import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Painel da empresa" }

export default async function PainelEmpresaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: jobs } = user
    ? await supabase.from("jobs").select("status").eq("company_id", user.id)
    : { data: [] }

  const counts = {
    publicada: jobs?.filter((j) => j.status === "publicada").length ?? 0,
    pendente_aprovacao: jobs?.filter((j) => j.status === "pendente_aprovacao").length ?? 0,
    total: jobs?.length ?? 0,
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Painel da empresa</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Vagas publicadas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{counts.publicada}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Em análise</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{counts.pendente_aprovacao}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Total de vagas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{counts.total}</CardContent>
        </Card>
      </div>

      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/empresa/vagas/nova">Publicar vaga</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/empresa/vagas">Minhas vagas</Link>
        </Button>
      </div>
    </div>
  )
}
