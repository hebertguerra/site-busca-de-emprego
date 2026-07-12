import { redirect } from "next/navigation"

import { CompanyProfileForm } from "@/components/forms/company-profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      <h1 className="text-2xl font-bold">Perfil da empresa</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Dados da empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyProfileForm company={company} />
        </CardContent>
      </Card>
    </div>
  )
}
