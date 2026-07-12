import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Vagas Piauí. Conectando talentos do Sul do Piauí.</p>
        <nav className="flex gap-4">
          <Link href="/privacidade" className="hover:underline">
            Privacidade
          </Link>
          <Link href="/termos" className="hover:underline">
            Termos de Uso
          </Link>
          <Link href="/sobre" className="hover:underline">
            Sobre
          </Link>
        </nav>
      </div>
    </footer>
  )
}
