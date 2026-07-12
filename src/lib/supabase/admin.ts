import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"

/**
 * Cliente com a service-role key: ignora RLS.
 * Uso restrito a Server Actions de admin que já validaram
 * `profiles.role === 'admin'` explicitamente antes de chamar isto.
 * Nunca importar este módulo em código que roda no cliente.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
