import Link from "next/link"
import { Briefcase, CheckCircle2, Clock, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Painel da empresa" }

export default async function PainelEmpresaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: jobs } = user
    ? await supabase.from("jobs").select("status").eq("company_id", user.id)
    : { data: [] }

  const counts = {
    publicada: jobs?.filter((j) => j.status === "publicada").length ?? 0,
    pendente_aprovacao: jobs?.filter((j) => j.status === "pendente_aprovacao").length ?? 0,
    total: jobs?.length ?? 0,
  }

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-orange-600 to-amber-500 bg-[length:220%_220%] text-primary-foreground animate-gradient-pan">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 animate-float-a rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-1 px-4 py-10">
          <h1 className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both text-2xl font-extrabold">
            Painel da empresa
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both text-sm text-primary-foreground/90">
            Acompanhe suas vagas e candidaturas em um só lugar.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both rounded-2xl border bg-card p-5 shadow-sm">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-4.5" />
            </span>
            <p className="mt-3 text-2xl font-bold">{counts.publicada}</p>
            <p className="text-sm text-muted-foreground">Vagas publicadas</p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both rounded-2xl border bg-card p-5 shadow-sm">
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="size-4.5" />
            </span>
            <p className="mt-3 text-2xl font-bold">{counts.pendente_aprovacao}</p>
            <p className="text-sm text-muted-foreground">Em análise</p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both rounded-2xl border bg-card p-5 shadow-sm">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="size-4.5" />
            </span>
            <p className="mt-3 text-2xl font-bold">{counts.total}</p>
            <p className="text-sm text-muted-foreground">Total de vagas</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="shadow-md transition-transform hover:-translate-y-0.5">
            <Link href="/empresa/vagas/nova">
              <PlusCircle className="size-4" />
              Publicar vaga
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/empresa/vagas">Minhas vagas</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
