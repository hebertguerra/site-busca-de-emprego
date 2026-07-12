import { notFound } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ApplicationStatusForm } from "@/components/forms/application-status-form"
import { ResumeLinkButton } from "@/components/shared/resume-link-button"
import { createClient } from "@/lib/supabase/server"
import type { ApplicationStatus } from "@/types/database.types"

export const metadata = { title: "Candidatos" }

type Params = Promise<{ id: string }>

export default async function CandidatosPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: job } = await supabase.from("jobs").select("id, title").eq("id", id).single()
  if (!job) notFound()

  const { data: applications } = await supabase
    .from("applications")
    .select(
      "id, status, cover_note, applied_at, candidates(id, headline, city, state, whatsapp, photo_url, skills)"
    )
    .eq("job_id", id)
    .order("applied_at", { ascending: false })
    .overrideTypes<
      Array<{
        id: string
        status: ApplicationStatus
        cover_note: string | null
        applied_at: string
        candidates: {
          id: string
          headline: string | null
          city: string | null
          state: string
          whatsapp: string | null
          photo_url: string | null
          skills: string[]
        } | null
      }>,
      { merge: false }
    >()

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Candidatos — {job.title}</h1>

      {(applications?.length ?? 0) === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Nenhuma candidatura recebida ainda.</p>
      )}

      <div className="mt-6 grid gap-4">
        {applications?.map((application) => {
          const candidate = application.candidates

          if (!candidate) return null

          return (
            <div key={application.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={candidate.photo_url ?? undefined} />
                    <AvatarFallback>{candidate.headline?.[0] ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{candidate.headline}</p>
                    <p className="text-sm text-muted-foreground">
                      {candidate.city}/{candidate.state} · {candidate.whatsapp}
                    </p>
                    {candidate.skills && candidate.skills.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {candidate.skills.join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
                <ApplicationStatusForm applicationId={application.id} currentStatus={application.status} />
              </div>

              {application.cover_note && (
                <p className="mt-3 rounded-md bg-muted p-3 text-sm">{application.cover_note}</p>
              )}

              <div className="mt-3">
                <ResumeLinkButton applicationId={application.id} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
