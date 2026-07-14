import Link from "next/link"
import { ClipboardList } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const STATUS_CLASSES: Record<string, string> = {
  enviada: "bg-secondary text-secondary-foreground",
  em_analise: "bg-amber-100 text-amber-800",
  entrevista: "bg-blue-100 text-blue-800",
  aprovado: "bg-emerald-100 text-emerald-800",
  rejeitado: "bg-rose-100 text-rose-800",
  desistiu: "bg-muted text-muted-foreground",
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
      <h1 className="text-3xl font-extrabold tracking-tight">Minhas candidaturas</h1>

      {(applications?.length ?? 0) === 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardList className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">
            Você ainda não se candidatou a nenhuma vaga.
          </p>
          <Button asChild size="sm">
            <Link href="/vagas">Ver vagas abertas</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {applications?.map((application, index) => {
          const job = application.jobs
          const company = job?.companies

          return (
            <Link
              key={application.id}
              href={`/vagas/${job?.id}`}
              className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both flex items-center justify-between rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            >
              <div>
                <p className="font-medium">{job?.title}</p>
                <p className="text-sm text-muted-foreground">{company?.trade_name}</p>
              </div>
              <Badge className={STATUS_CLASSES[application.status] ?? ""}>
                {STATUS_LABELS[application.status] ?? application.status}
              </Badge>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
