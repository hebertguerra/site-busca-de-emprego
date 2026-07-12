"use server"

import { revalidatePath } from "next/cache"

import {
  candidateProfileSchema,
  educationSchema,
  experienceSchema,
} from "@/lib/validations/candidate"
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

export async function addExperience(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = experienceSchema.safeParse({
    companyName: formData.get("companyName"),
    roleTitle: formData.get("roleTitle"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    isCurrent: formData.get("isCurrent") === "on",
    description: formData.get("description") || undefined,
    employmentType: formData.get("employmentType") || "formal",
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const { supabase, userId } = await requireCandidate()

  // Garante que a linha em `candidates` já existe antes da FK de candidate_experiences.
  await supabase.from("candidates").upsert({ id: userId })

  const { error } = await supabase.from("candidate_experiences").insert({
    candidate_id: userId,
    company_name: parsed.data.companyName,
    role_title: parsed.data.roleTitle,
    start_date: parsed.data.startDate,
    end_date: parsed.data.isCurrent ? null : parsed.data.endDate || null,
    is_current: parsed.data.isCurrent,
    description: parsed.data.description,
    employment_type: parsed.data.employmentType,
  })

  if (error) {
    return { error: "Não foi possível salvar essa experiência. Tente novamente." }
  }

  revalidatePath("/perfil")
  return { success: true }
}

export async function deleteExperience(experienceId: string) {
  const { supabase, userId } = await requireCandidate()
  await supabase
    .from("candidate_experiences")
    .delete()
    .eq("id", experienceId)
    .eq("candidate_id", userId)
  revalidatePath("/perfil")
}

export async function addEducation(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = educationSchema.safeParse({
    institution: formData.get("institution"),
    degree: formData.get("degree") || undefined,
    fieldOfStudy: formData.get("fieldOfStudy") || undefined,
    startYear: formData.get("startYear") || undefined,
    endYear: formData.get("endYear") || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const { supabase, userId } = await requireCandidate()

  await supabase.from("candidates").upsert({ id: userId })

  const { error } = await supabase.from("candidate_education").insert({
    candidate_id: userId,
    institution: parsed.data.institution,
    degree: parsed.data.degree,
    field_of_study: parsed.data.fieldOfStudy,
    start_year: parsed.data.startYear,
    end_year: parsed.data.endYear,
  })

  if (error) {
    return { error: "Não foi possível salvar essa formação. Tente novamente." }
  }

  revalidatePath("/perfil")
  return { success: true }
}

export async function deleteEducation(educationId: string) {
  const { supabase, userId } = await requireCandidate()
  await supabase
    .from("candidate_education")
    .delete()
    .eq("id", educationId)
    .eq("candidate_id", userId)
  revalidatePath("/perfil")
}
