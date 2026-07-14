import { redirect } from "next/navigation"
import { Building2 } from "lucide-react"

import { CompanyProfileForm } from "@/components/forms/company-profile-form"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Perfil da empresa" }

export default async function PerfilEmpresaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/entrar?redirect=/empresa/perfil")

  const { data: company } = await supabase.from("companies").select("*").eq("id", user.id).single()

  if (!company) redirect("/empresa/painel")

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Perfil da empresa</h1>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both mt-6 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="size-4.5" />
          </span>
          <h2 className="font-semibold">Dados da empresa</h2>
        </div>
        <div className="mt-4">
          <CompanyProfileForm company={company} />
        </div>
      </div>
    </div>
  )
}
