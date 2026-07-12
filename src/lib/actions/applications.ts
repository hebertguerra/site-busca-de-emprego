"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import {
  applicationSchema,
  applicationStatusUpdateSchema,
} from "@/lib/validations/application"
import { checkRateLimit } from "@/lib/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export type ActionState = { error?: string; success?: boolean } | undefined

export async function applyToJob(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = applicationSchema.safeParse({
    jobId: formData.get("jobId"),
    coverNote: formData.get("coverNote") || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/entrar?redirect=/vagas/${parsed.data.jobId}`)
  }

  const headerList = await headers()
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const { success } = await checkRateLimit("apply", ip)
  if (!success) {
    return { error: "Muitas candidaturas em pouco tempo. Tente novamente mais tarde." }
  }

  const { error } = await supabase.from("applications").insert({
    job_id: parsed.data.jobId,
    candidate_id: user.id,
    cover_note: parsed.data.coverNote,
  })

  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "Você já se candidatou a esta vaga."
        : "Não foi possível enviar sua candidatura. Tente novamente.",
    }
  }

  revalidatePath(`/vagas/${parsed.data.jobId}`)
  return { success: true }
}

export async function updateApplicationStatus(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = applicationStatusUpdateSchema.safeParse({
    applicationId: formData.get("applicationId"),
    status: formData.get("status"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("applications")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.applicationId)

  if (error) {
    return { error: "Não foi possível atualizar o status." }
  }

  revalidatePath("/empresa/vagas")
  return { success: true }
}

/** Registra no log de auditoria LGPD que a empresa abriu o perfil completo do candidato. */
export async function logCandidateProfileAccess(candidateId: string, context: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("data_access_log").insert({
    accessed_by: user.id,
    candidate_id: candidateId,
    context,
  })
}

/**
 * Gera uma signed URL de curto prazo para o currículo de um candidato.
 * A checagem de autorização usa o cliente autenticado (RLS de `applications`
 * só deixa a empresa ler candidaturas das próprias vagas); a signed URL em
 * si é emitida com a service-role key porque o bucket `resumes` é privado.
 */
export async function getResumeSignedUrl(applicationId: string) {
  const supabase = await createClient()
  const { data: application } = await supabase
    .from("applications")
    .select("candidate_id")
    .eq("id", applicationId)
    .single()

  if (!application) return null

  await logCandidateProfileAccess(application.candidate_id, "visualizacao_curriculo")

  const admin = createAdminClient()
  const { data } = await admin.storage
    .from("resumes")
    .createSignedUrl(`${application.candidate_id}/curriculo.pdf`, 300)

  return data?.signedUrl ?? null
}
