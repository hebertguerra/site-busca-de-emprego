"use server"

import { revalidatePath } from "next/cache"

import { candidateProfileSchema } from "@/lib/validations/candidate"
import { recordConsent } from "@/lib/consent"
import { createClient } from "@/lib/supabase/server"

export type ActionState = { error?: string; success?: boolean } | undefined

async function requireCandidate() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("not_authenticated")
  return { supabase, userId: user.id }
}

export async function updateCandidateProfile(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const skillsText = String(formData.get("skillsText") ?? "")
  const skills = skillsText
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)

  const parsed = candidateProfileSchema.safeParse({
    headline: formData.get("headline"),
    bio: formData.get("bio") || undefined,
    city: formData.get("city"),
    state: formData.get("state") || "PI",
    whatsapp: formData.get("whatsapp"),
    skills,
    desiredContractTypes: formData.getAll("desiredContractTypes"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const { supabase, userId } = await requireCandidate()

  const { error } = await supabase.from("candidates").upsert({
    id: userId,
    headline: parsed.data.headline,
    bio: parsed.data.bio,
    city: parsed.data.city,
    state: parsed.data.state,
    whatsapp: parsed.data.whatsapp,
    skills: parsed.data.skills,
    desired_contract_types: parsed.data.desiredContractTypes,
  })

  if (error) {
    return { error: "Não foi possível salvar seu perfil. Tente novamente." }
  }

  revalidatePath("/perfil")
  revalidatePath("/painel")
  return { success: true }
}

/** Chamado depois que o arquivo já foi enviado ao Storage direto pelo navegador. */
export async function setCandidatePhoto(url: string) {
  const { supabase, userId } = await requireCandidate()

  await supabase.from("candidates").upsert({ id: userId, photo_url: url })
  await recordConsent(supabase, userId, "foto")

  revalidatePath("/perfil")
}

export async function setCandidateResume(url: string) {
  const { supabase, userId } = await requireCandidate()

  await supabase.from("candidates").upsert({
    id: userId,
    resume_file_url: url,
    resume_updated_at: new Date().toISOString(),
  })
  await recordConsent(supabase, userId, "curriculo")

  revalidatePath("/perfil")
}
