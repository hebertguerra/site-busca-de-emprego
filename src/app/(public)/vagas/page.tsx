import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import type { EconomicSector } from "@/types/database.types"

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

const SECTOR_LABELS: Record<EconomicSector, string> = {
  agronegocio: "Agronegócio",
  turismo: "Turismo",
  comercio_servicos: "Comércio e serviços",
  industria_construcao: "Indústria e construção",
  outro: "Outro",
}

const SECTOR_OPTIONS: EconomicSector[] = [
  "agronegocio",
  "turismo",
  "comercio_servicos",
  "industria_construcao",
  "outro",
]

type SearchParams = Promise<{ cidade?: string; setor?: string }>

export default async function VagasPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { cidade, setor } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("jobs")
    .select("id, title, city, state, contract_type, workplace_type, economic_sector, published_at")
    .order("published_at", { ascending: false })

  if (cidade) {
    query = query.ilike("city", `%${cidade}%`)
  }

  if (setor && SECTOR_OPTIONS.includes(setor as EconomicSector)) {
    query = query.eq("economic_sector", setor as EconomicSector)
  }

  const { data: jobs, error } = await query

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Vagas abertas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {jobs?.length ?? 0} vaga(s) encontrada(s)
        {cidade ? ` em "${cidade}"` : ""}
        {setor ? ` no setor "${SECTOR_LABELS[setor as EconomicSector] ?? setor}"` : ""}.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={cidade ? `/vagas?cidade=${cidade}` : "/vagas"}>
          <Badge
            className="cursor-pointer px-3 py-1.5 text-sm transition-transform hover:scale-105"
            variant={!setor ? "default" : "outline"}
          >
            Todos os setores
          </Badge>
        </Link>
        {SECTOR_OPTIONS.map((option) => (
          <Link
            key={option}
            href={`/vagas?${cidade ? `cidade=${cidade}&` : ""}setor=${option}`}
          >
            <Badge
              className="cursor-pointer px-3 py-1.5 text-sm transition-transform hover:scale-105"
              variant={setor === option ? "default" : "outline"}
            >
              {SECTOR_LABELS[option]}
            </Badge>
          </Link>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-sm text-destructive">
          Não foi possível carregar as vagas agora. Tente novamente em
          instantes.
        </p>
      )}

      {!error && (jobs?.length ?? 0) === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Nenhuma vaga publicada com esse filtro no momento. Volte em breve!
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {jobs?.map((job, index) => (
          <Link
            key={job.id}
            href={`/vagas/${job.id}`}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
          >
            <Card className="h-full gap-3 rounded-2xl border-border/70 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
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
                {job.economic_sector && (
                  <Badge className="border-primary/30 bg-primary/10 text-primary">
                    {SECTOR_LABELS[job.economic_sector]}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
