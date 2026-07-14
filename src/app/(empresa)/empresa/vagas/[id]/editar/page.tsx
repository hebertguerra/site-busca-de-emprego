import { notFound } from "next/navigation"
import { Briefcase } from "lucide-react"

import { JobForm } from "@/components/forms/job-form"
import { updateJob } from "@/lib/actions/jobs"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Editar vaga" }

type Params = Promise<{ id: string }>

export default async function EditarVagaPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single()

  if (!job) notFound()

  const boundUpdateJob = updateJob.bind(null, id)

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Editar vaga</h1>
      {job.status === "publicada" && (
        <p className="mt-1 text-sm text-muted-foreground">
          Alterações em uma vaga já publicada não exigem nova aprovação.
        </p>
      )}

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both mt-6 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="size-4.5" />
          </span>
          <h2 className="font-semibold">Detalhes da vaga</h2>
        </div>
        <div className="mt-4">
          <JobForm job={job} action={boundUpdateJob} />
        </div>
      </div>
    </div>
  )
}
