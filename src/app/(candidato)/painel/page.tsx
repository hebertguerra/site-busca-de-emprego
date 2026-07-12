import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Meu painel" }

export default async function PainelCandidatoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: candidate } = user
    ? await supabase
        .from("candidates")
        .select("headline, city, resume_file_url, photo_url")
        .eq("id", user.id)
        .single()
    : { data: null }

  const profileComplete = Boolean(
    candidate?.headline && candidate?.city && candidate?.resume_file_url && candidate?.photo_url
  )

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Olá!</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Aqui você acompanha seu perfil e suas candidaturas.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meu perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {profileComplete
                ? "Seu perfil está completo."
                : "Complete seu perfil com foto e currículo para se candidatar às vagas."}
            </p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/perfil">{profileComplete ? "Editar perfil" : "Completar perfil"}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Minhas candidaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Acompanhe o status das vagas às quais você se candidatou.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href="/minhas-candidaturas">Ver candidaturas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
