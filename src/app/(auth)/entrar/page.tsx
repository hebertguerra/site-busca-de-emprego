import Link from "next/link"
import { LogIn } from "lucide-react"

import { AuthCard } from "@/components/shared/auth-card"
import { SignInForm } from "@/components/forms/sign-in-form"

export const metadata = { title: "Entrar" }

export default function EntrarPage() {
  return (
    <AuthCard icon={LogIn} title="Entrar" subtitle="Acesse sua conta para continuar">
      <SignInForm />
      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/cadastro/candidato" className="font-medium text-primary underline underline-offset-2">
          Criar conta de candidato
        </Link>{" "}
        ou{" "}
        <Link href="/cadastro/empresa" className="font-medium text-primary underline underline-offset-2">
          cadastrar empresa
        </Link>
        .
      </p>
    </AuthCard>
  )
}
