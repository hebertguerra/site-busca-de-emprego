import Link from "next/link"
import { Briefcase, GraduationCap, ShieldCheck, Sprout, Landmark, MapPinned } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-emerald-600 to-lime-500 bg-[length:220%_220%] text-primary-foreground animate-gradient-pan">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 animate-float-a rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/3 size-80 animate-float-b rounded-full bg-amber-300/20 blur-3xl"
        />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-start gap-5 px-4 py-16 sm:py-24">
          <span className="animate-in fade-in slide-in-from-bottom-2 duration-700 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <MapPinned className="size-3.5 animate-soft-pulse" />
            Feito para o Sul do Piauí
          </span>
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Emprego perto de você, sem complicação.
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both max-w-xl text-base text-primary-foreground/90 sm:text-lg">
            Conectamos quem busca uma oportunidade de trabalho com empresas da
            região — do agronegócio ao turismo da Serra da Capivara. Cadastre
            seu currículo ou publique uma vaga, é gratuito.
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both flex flex-wrap gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-xl"
            >
              <Link href="/vagas">Ver vagas abertas</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/60 bg-white/10 text-white backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:bg-white/20 hover:text-white"
            >
              <Link href="/cadastro/empresa">Sou uma empresa</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-14">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Vagas por perto, nos setores que mais empregam
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link
            href="/vagas?setor=agronegocio"
            className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:rotate-6">
              <Sprout className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Agronegócio</p>
              <p className="text-xs text-muted-foreground">Uruçuí, Bom Jesus e região</p>
            </div>
          </Link>
          <Link
            href="/vagas?setor=turismo"
            className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/40 text-accent-foreground transition-transform group-hover:scale-110 group-hover:rotate-6">
              <Landmark className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Turismo</p>
              <p className="text-xs text-muted-foreground">Serra da Capivara e região</p>
            </div>
          </Link>
          <Link
            href="/vagas"
            className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-transform group-hover:scale-110 group-hover:rotate-6">
              <Briefcase className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Todas as vagas</p>
              <p className="text-xs text-muted-foreground">Comércio, indústria e mais</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-16">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <Briefcase className="size-5" />
            </span>
            <h2 className="mt-3 font-semibold">Para candidatos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Monte seu perfil com foto e currículo, e candidate-se em poucos
              toques, mesmo pelo celular.
            </p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <GraduationCap className="size-5" />
            </span>
            <h2 className="mt-3 font-semibold">Qualificação sugerida</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quando falta uma habilidade para a vaga, mostramos um caminho
              real de curso gratuito para chegar lá.
            </p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <ShieldCheck className="size-5" />
            </span>
            <h2 className="mt-3 font-semibold">Compromisso com a LGPD</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Seus dados só são compartilhados com empresas às quais você se
              candidata. Veja nossa{" "}
              <Link href="/privacidade" className="underline">
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
