import { Briefcase } from "lucide-react"

import { JobForm } from "@/components/forms/job-form"
import { createJob } from "@/lib/actions/jobs"

export const metadata = { title: "Nova vaga" }

export default function NovaVagaPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Publicar vaga</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sua vaga passa por uma revisão rápida antes de ficar visível ao público.
      </p>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both mt-6 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="size-4.5" />
          </span>
          <h2 className="font-semibold">Detalhes da vaga</h2>
        </div>
        <div className="mt-4">
          <JobForm action={createJob} />
        </div>
      </div>
    </div>
  )
}
