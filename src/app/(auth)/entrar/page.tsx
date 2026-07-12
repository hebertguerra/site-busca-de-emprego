import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SignInForm } from "@/components/forms/sign-in-form"

export const metadata = { title: "Entrar" }

export default function EntrarPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <SignInForm />
          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link href="/cadastro/candidato" className="underline">
              Criar conta de candidato
            </Link>{" "}
            ou{" "}
            <Link href="/cadastro/empresa" className="underline">
              cadastrar empresa
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
