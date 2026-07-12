"use client"

import Link from "next/link"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUpCandidate } from "@/lib/actions/auth"

export function CandidateSignUpForm() {
  const [state, formAction, pending] = useActionState(signUpCandidate, undefined)

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input id="fullName" name="fullName" required autoComplete="name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">WhatsApp</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="(89) 9 9999-9999"
          required
          autoComplete="tel"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div className="flex items-start gap-2">
        <Checkbox id="acceptedTerms" name="acceptedTerms" required />
        <Label htmlFor="acceptedTerms" className="text-sm font-normal">
          Li e aceito os{" "}
          <Link href="/termos" className="underline" target="_blank">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="underline" target="_blank">
            Política de Privacidade
          </Link>
          .
        </Label>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Criando conta..." : "Criar minha conta"}
      </Button>
    </form>
  )
}
