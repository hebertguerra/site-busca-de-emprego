import Link from "next/link"

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

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  publicada: "default",
  pendente_aprovacao: "secondary",
  rejeitada: "destructive",
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
        <h1 className="text-2xl font-bold">Minhas vagas</h1>
        <Button asChild size="sm">
          <Link href="/empresa/vagas/nova">Nova vaga</Link>
        </Button>
      </div>

      {(jobs?.length ?? 0) === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Você ainda não publicou nenhuma vaga.</p>
      )}

      <div className="mt-6 grid gap-3">
        {jobs?.map((job) => (
          <div key={job.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{job.title}</span>
              <Badge variant={STATUS_VARIANTS[job.status] ?? "outline"}>
                {STATUS_LABELS[job.status] ?? job.status}
              </Badge>
            </div>
            {job.status === "rejeitada" && job.rejection_reason && (
              <p className="mt-1 text-sm text-destructive">Motivo: {job.rejection_reason}</p>
            )}
            <div className="mt-2 flex gap-3 text-sm">
              <Link href={`/empresa/vagas/${job.id}/editar`} className="underline">
                Editar
              </Link>
              <Link href={`/empresa/vagas/${job.id}/candidatos`} className="underline">
                Ver candidatos
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
