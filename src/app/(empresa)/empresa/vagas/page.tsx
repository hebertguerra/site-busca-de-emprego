import Link from "next/link"
import { Briefcase, PlusCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Minhas vagas" }

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  pendente_aprovacao: "Em análise",
  publicada: "Publicada",
  pausada: "Pausada",
  encerrada: "Encerrada",
  rejeitada: "Rejeitada",
}

const STATUS_CLASSES: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  pendente_aprovacao: "bg-amber-100 text-amber-800",
  publicada: "bg-emerald-100 text-emerald-800",
  pausada: "bg-secondary text-secondary-foreground",
  encerrada: "bg-muted text-muted-foreground",
  rejeitada: "bg-rose-100 text-rose-800",
}

export default async function EmpresaVagasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: jobs } = user
    ? await supabase
        .from("jobs")
        .select("id, title, status, rejection_reason, created_at")
        .eq("company_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Minhas vagas</h1>
        <Button asChild size="sm" className="shadow-md">
          <Link href="/empresa/vagas/nova">
            <PlusCircle className="size-4" />
            Nova vaga
          </Link>
        </Button>
      </div>

      {(jobs?.length ?? 0) === 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Briefcase className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">Você ainda não publicou nenhuma vaga.</p>
          <Button asChild size="sm">
            <Link href="/empresa/vagas/nova">Publicar primeira vaga</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {jobs?.map((job, index) => (
          <div
            key={job.id}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md"
            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{job.title}</span>
              <Badge className={STATUS_CLASSES[job.status] ?? ""}>
                {STATUS_LABELS[job.status] ?? job.status}
              </Badge>
            </div>
            {job.status === "rejeitada" && job.rejection_reason && (
              <p className="mt-1 text-sm text-destructive">Motivo: {job.rejection_reason}</p>
            )}
            <div className="mt-2 flex gap-4 text-sm">
              <Link href={`/empresa/vagas/${job.id}/editar`} className="font-medium text-primary underline underline-offset-2">
                Editar
              </Link>
              <Link href={`/empresa/vagas/${job.id}/candidatos`} className="font-medium text-primary underline underline-offset-2">
                Ver candidatos
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
