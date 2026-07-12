import type { SupabaseClient } from "@supabase/supabase-js"

import type { ConsentType, Database } from "@/types/database.types"

export const CURRENT_CONSENT_VERSION = "2026-07-12"

export async function recordConsent(
  supabase: SupabaseClient<Database>,
  profileId: string,
  consentType: ConsentType
) {
  await supabase.from("consent_log").insert({
    profile_id: profileId,
    consent_type: consentType,
    accepted: true,
    version: CURRENT_CONSENT_VERSION,
  })

  if (consentType === "cadastro") {
    await supabase
      .from("profiles")
      .update({
        consent_lgpd_accepted_at: new Date().toISOString(),
        consent_version: CURRENT_CONSENT_VERSION,
      })
      .eq("id", profileId)
  }
}
