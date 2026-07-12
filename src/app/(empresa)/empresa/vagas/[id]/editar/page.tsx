import { notFound } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      <h1 className="text-2xl font-bold">Editar vaga</h1>
      {job.status === "publicada" && (
        <p className="mt-1 text-sm text-muted-foreground">
          Alterações em uma vaga já publicada não exigem nova aprovação.
        </p>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Detalhes da vaga</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm job={job} action={boundUpdateJob} />
        </CardContent>
      </Card>
    </div>
  )
}
