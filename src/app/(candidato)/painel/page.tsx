import Link from "next/link"
import { ClipboardList, Sparkles, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
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
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-emerald-600 to-lime-500 bg-[length:220%_220%] text-primary-foreground animate-gradient-pan">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 animate-float-a rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-1 px-4 py-10">
          <span className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            {profileComplete ? "Perfil completo" : "Complete seu perfil"}
          </span>
          <h1 className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both text-2xl font-extrabold">
            Olá{candidate?.headline ? "," : "!"} {candidate?.headline ?? ""}
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both text-sm text-primary-foreground/90">
            Aqui você acompanha seu perfil e suas candidaturas.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <UserRound className="size-5" />
            </span>
            <h2 className="mt-3 font-semibold">Meu perfil</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {profileComplete
                ? "Seu perfil está completo."
                : "Complete seu perfil com foto e currículo para se candidatar às vagas."}
            </p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/perfil">{profileComplete ? "Editar perfil" : "Completar perfil"}</Link>
            </Button>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <ClipboardList className="size-5" />
            </span>
            <h2 className="mt-3 font-semibold">Minhas candidaturas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Acompanhe o status das vagas às quais você se candidatou.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href="/minhas-candidaturas">Ver candidaturas</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
