"use server"

import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

const reportJobSchema = z.object({
  jobId: z.uuid(),
  reason: z.string().min(3, "Descreva o motivo da denúncia."),
})

export type ActionState = { error?: string; success?: boolean } | undefined

export async function reportJob(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = reportJobSchema.safeParse({
    jobId: formData.get("jobId"),
    reason: formData.get("reason"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from("reports").insert({
    job_id: parsed.data.jobId,
    reason: "denuncia_usuario",
    description: parsed.data.reason,
    reporter_id: user?.id ?? null,
  })

  if (error) {
    return { error: "Não foi possível enviar a denúncia. Tente novamente." }
  }

  return { success: true }
}
