import Link from "next/link"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions/auth"
import { createClient } from "@/lib/supabase/server"

export async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let dashboardHref = "/painel"
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role === "empresa") dashboardHref = "/empresa/painel"
    if (profile?.role === "admin") dashboardHref = "/moderacao"
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold">
          Vagas Piauí
        </Link>

        <nav className="hidden items-center gap-4 text-sm sm:flex">
          <Link href="/vagas" className="hover:underline">
            Vagas
          </Link>
          <Link href="/sobre" className="hover:underline">
            Sobre
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={dashboardHref}>Meu painel</Link>
              </Button>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/entrar">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/cadastro/candidato">Criar conta</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
