import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Minhas candidaturas" }

const STATUS_LABELS: Record<string, string> = {
  enviada: "Enviada",
  em_analise: "Em análise",
  entrevista: "Entrevista",
  aprovado: "Aprovado",
  rejeitado: "Não seguiu",
  desistiu: "Desistiu",
}

export default async function MinhasCandidaturasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: applications } = user
    ? await supabase
        .from("applications")
        .select("id, status, applied_at, jobs(id, title, companies(trade_name))")
        .eq("candidate_id", user.id)
        .order("applied_at", { ascending: false })
        .overrideTypes<
          Array<{
            id: string
            status: string
            applied_at: string
            jobs: { id: string; title: string; companies: { trade_name: string } | null } | null
          }>,
          { merge: false }
        >()
    : { data: [] }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Minhas candidaturas</h1>

      {(applications?.length ?? 0) === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Você ainda não se candidatou a nenhuma vaga.{" "}
          <Link href="/vagas" className="underline">
            Ver vagas abertas
          </Link>
          .
        </p>
      )}

      <div className="mt-6 grid gap-3">
        {applications?.map((application) => {
          const job = application.jobs
          const company = job?.companies

          return (
            <div key={application.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Link href={`/vagas/${job?.id}`} className="font-medium hover:underline">
                  {job?.title}
                </Link>
                <p className="text-sm text-muted-foreground">{company?.trade_name}</p>
              </div>
              <Badge variant="secondary">{STATUS_LABELS[application.status] ?? application.status}</Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}
