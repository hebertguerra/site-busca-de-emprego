"use server"

import { revalidatePath } from "next/cache"

import { companyProfileSchema } from "@/lib/validations/company"
import { createClient } from "@/lib/supabase/server"

export type ActionState = { error?: string; success?: boolean } | undefined

export async function updateCompanyProfile(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = companyProfileSchema.safeParse({
    tradeName: formData.get("tradeName"),
    legalName: formData.get("legalName") || undefined,
    cnpj: formData.get("cnpj"),
    description: formData.get("description") || undefined,
    website: formData.get("website") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Sessão expirada. Entre novamente." }

  const { error } = await supabase
    .from("companies")
    .update({
      trade_name: parsed.data.tradeName,
      legal_name: parsed.data.legalName,
      description: parsed.data.description,
      website: parsed.data.website || null,
      city: parsed.data.city,
      state: parsed.data.state,
    })
    .eq("id", user.id)

  if (error) {
    return { error: "Não foi possível salvar os dados da empresa." }
  }

  revalidatePath("/empresa/perfil")
  return { success: true }
}
