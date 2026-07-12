"use server"

import { revalidatePath } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("not_authenticated")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("not_authorized")
}

export async function approveJob(jobId: string) {
  await requireAdmin()
  const admin = createAdminClient()
  await admin
    .from("jobs")
    .update({ status: "publicada", published_at: new Date().toISOString(), rejection_reason: null })
    .eq("id", jobId)
  revalidatePath("/moderacao")
}

export async function rejectJob(jobId: string, reason: string) {
  await requireAdmin()
  const admin = createAdminClient()
  await admin.from("jobs").update({ status: "rejeitada", rejection_reason: reason }).eq("id", jobId)
  revalidatePath("/moderacao")
}

export async function resolveReport(reportId: string) {
  await requireAdmin()
  const admin = createAdminClient()
  await admin.from("reports").update({ status: "resolvido" }).eq("id", reportId)
  revalidatePath("/moderacao")
}
