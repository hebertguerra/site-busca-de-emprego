"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { findDiscriminatoryTerms } from "@/lib/discriminatory-terms"
import { jobSchema } from "@/lib/validations/job"
import { createClient } from "@/lib/supabase/server"

export type ActionState = { error?: string } | undefined

function parseJobForm(formData: FormData) {
  return jobSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    requirements: formData.get("requirements") || undefined,
    benefits: formData.get("benefits") || undefined,
    contractType: formData.get("contractType"),
    workplaceType: formData.get("workplaceType"),
    city: formData.get("city") || undefined,
    state: formData.get("state") || "PI",
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    salaryIsPublic: formData.get("salaryIsPublic") === "on",
  })
}

export async function createJob(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseJobForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Sessão expirada. Entre novamente." }

  const flaggedTerms = findDiscriminatoryTerms(
    `${parsed.data.title} ${parsed.data.description} ${parsed.data.requirements ?? ""}`
  )

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      company_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      requirements: parsed.data.requirements,
      benefits: parsed.data.benefits,
      contract_type: parsed.data.contractType,
      workplace_type: parsed.data.workplaceType,
      city: parsed.data.city,
      state: parsed.data.state,
      salary_min: parsed.data.salaryMin,
      salary_max: parsed.data.salaryMax,
      salary_is_public: parsed.data.salaryIsPublic,
      // Sempre entra em fila de moderação — só um admin pode publicar (ver trigger no banco).
      status: "pendente_aprovacao",
    })
    .select("id")
    .single()

  if (error || !job) {
    return { error: "Não foi possível criar a vaga. Tente novamente." }
  }

  if (flaggedTerms.length > 0) {
    await supabase.from("reports").insert({
      reporter_id: null,
      job_id: job.id,
      company_id: user.id,
      reason: "termo_potencialmente_discriminatorio",
      description: `Termos sinalizados automaticamente: ${flaggedTerms.join(", ")}`,
    })
  }

  revalidatePath("/empresa/vagas")
  redirect("/empresa/vagas")
}

export async function updateJob(
  jobId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseJobForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("jobs")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      requirements: parsed.data.requirements,
      benefits: parsed.data.benefits,
      contract_type: parsed.data.contractType,
      workplace_type: parsed.data.workplaceType,
      city: parsed.data.city,
      state: parsed.data.state,
      salary_min: parsed.data.salaryMin,
      salary_max: parsed.data.salaryMax,
      salary_is_public: parsed.data.salaryIsPublic,
    })
    .eq("id", jobId)

  if (error) {
    return { error: "Não foi possível atualizar a vaga." }
  }

  revalidatePath("/empresa/vagas")
  revalidatePath(`/empresa/vagas/${jobId}/editar`)
  redirect("/empresa/vagas")
}

export async function setJobStatus(jobId: string, status: "pausada" | "encerrada") {
  const supabase = await createClient()
  await supabase.from("jobs").update({ status }).eq("id", jobId)
  revalidatePath("/empresa/vagas")
}
