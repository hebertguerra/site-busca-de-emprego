import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JobForm } from "@/components/forms/job-form"
import { createJob } from "@/lib/actions/jobs"

export const metadata = { title: "Nova vaga" }

export default function NovaVagaPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Publicar vaga</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sua vaga passa por uma revisão rápida antes de ficar visível ao público.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Detalhes da vaga</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm action={createJob} />
        </CardContent>
      </Card>
    </div>
  )
}
