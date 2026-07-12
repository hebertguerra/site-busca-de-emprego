import { redirect } from "next/navigation"

import { AvatarUploader } from "@/components/shared/avatar-uploader"
import { ResumeUploader } from "@/components/shared/resume-uploader"
import { CandidateProfileForm } from "@/components/forms/candidate-profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Meu perfil" }

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/entrar?redirect=/perfil")

  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Meu perfil</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Complete seu perfil para aumentar suas chances nas vagas.
      </p>

      <div className="mt-6 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto</CardTitle>
          </CardHeader>
          <CardContent>
            <AvatarUploader userId={user.id} currentUrl={candidate?.photo_url ?? null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Currículo (PDF)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResumeUploader userId={user.id} currentUrl={candidate?.resume_file_url ?? null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <CandidateProfileForm candidate={candidate ?? null} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
