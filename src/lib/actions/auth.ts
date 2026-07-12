"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import {
  candidateSignUpSchema,
  companySignUpSchema,
  signInSchema,
} from "@/lib/validations/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { recordConsent } from "@/lib/consent"
import { createClient } from "@/lib/supabase/server"

export type ActionState = { error?: string } | undefined

async function getClientIp() {
  const headerList = await headers()
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
}

export async function signIn(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const ip = await getClientIp()
  const { success } = await checkRateLimit("auth", ip)
  if (!success) {
    return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error || !data.user) {
    return { error: "E-mail ou senha inválidos." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single()

  if (profile?.role === "empresa") redirect("/empresa/painel")
  if (profile?.role === "admin") redirect("/moderacao")
  redirect("/painel")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function signUpCandidate(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = candidateSignUpSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptedTerms: formData.get("acceptedTerms") === "on",
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const ip = await getClientIp()
  const { success } = await checkRateLimit("auth", ip)
  if (!success) {
    return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }
  }

  const { fullName, phone, email, password } = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "candidato", full_name: fullName, phone } },
  })

  if (error || !data.user) {
    return { error: error?.message.includes("already registered")
      ? "Este e-mail já está cadastrado."
      : "Não foi possível concluir o cadastro. Tente novamente." }
  }

  await recordConsent(supabase, data.user.id, "cadastro")

  redirect("/perfil")
}

export async function signUpCompany(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = companySignUpSchema.safeParse({
    tradeName: formData.get("tradeName"),
    cnpj: formData.get("cnpj"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptedTerms: formData.get("acceptedTerms") === "on",
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const ip = await getClientIp()
  const { success } = await checkRateLimit("auth", ip)
  if (!success) {
    return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }
  }

  const { tradeName, cnpj, phone, email, password } = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "empresa", full_name: tradeName, phone } },
  })

  if (error || !data.user) {
    return { error: error?.message.includes("already registered")
      ? "Este e-mail já está cadastrado."
      : "Não foi possível concluir o cadastro. Tente novamente." }
  }

  const { error: companyError } = await supabase.from("companies").insert({
    id: data.user.id,
    trade_name: tradeName,
    cnpj,
  })

  if (companyError) {
    return {
      error: companyError.message.includes("duplicate")
        ? "Este CNPJ já está cadastrado."
        : "Cadastro criado, mas houve um erro ao salvar os dados da empresa.",
    }
  }

  await recordConsent(supabase, data.user.id, "cadastro")

  redirect("/empresa/painel")
}
