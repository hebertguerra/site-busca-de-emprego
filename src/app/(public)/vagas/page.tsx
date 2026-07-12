import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Vagas abertas" }

const CONTRACT_LABELS: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ",
  estagio: "Estágio",
  temporario: "Temporário",
  freelance: "Freelance",
}

const WORKPLACE_LABELS: Record<string, string> = {
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
}

type SearchParams = Promise<{ cidade?: string }>

export default async function VagasPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { cidade } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("jobs")
    .select("id, title, city, state, contract_type, workplace_type, published_at")
    .order("published_at", { ascending: false })

  if (cidade) {
    query = query.ilike("city", `%${cidade}%`)
  }

  const { data: jobs, error } = await query

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Vagas abertas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {jobs?.length ?? 0} vaga(s) encontrada(s)
        {cidade ? ` em "${cidade}"` : ""}.
      </p>

      {error && (
        <p className="mt-6 text-sm text-destructive">
          Não foi possível carregar as vagas agora. Tente novamente em
          instantes.
        </p>
      )}

      {!error && (jobs?.length ?? 0) === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Nenhuma vaga publicada no momento. Volte em breve!
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {jobs?.map((job) => (
          <Link key={job.id} href={`/vagas/${job.id}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">{job.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {job.city && (
                  <span>
                    {job.city}/{job.state}
                  </span>
                )}
                <Badge variant="secondary">
                  {CONTRACT_LABELS[job.contract_type] ?? job.contract_type}
                </Badge>
                <Badge variant="outline">
                  {WORKPLACE_LABELS[job.workplace_type] ?? job.workplace_type}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
