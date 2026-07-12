import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-12">
      <section className="flex flex-col items-start gap-4 text-left">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Emprego perto de você, no Sul do Piauí
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Conectamos quem busca uma oportunidade de trabalho com empresas da
          região. Cadastre seu currículo ou publique uma vaga — é gratuito.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/vagas">Ver vagas abertas</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/cadastro/empresa">Sou uma empresa</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Para candidatos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monte seu perfil com foto e currículo, e candidate-se em poucos
            toques, mesmo pelo celular.
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Para empresas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Publique vagas, receba candidaturas e acompanhe o processo
            seletivo em um só lugar.
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Compromisso com a LGPD</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Seus dados só são compartilhados com empresas às quais você se
            candidata. Veja nossa{" "}
            <Link href="/privacidade" className="underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
