"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCnpj } from "@/lib/cnpj"
import { updateCompanyProfile } from "@/lib/actions/company"
import type { Database } from "@/types/database.types"

type Company = Database["public"]["Tables"]["companies"]["Row"]

export function CompanyProfileForm({ company }: { company: Company }) {
  const [state, formAction, pending] = useActionState(updateCompanyProfile, undefined)

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="tradeName">Nome fantasia</Label>
        <Input id="tradeName" name="tradeName" defaultValue={company.trade_name} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="legalName">Razão social</Label>
        <Input id="legalName" name="legalName" defaultValue={company.legal_name ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input id="cnpj" name="cnpj" defaultValue={formatCnpj(company.cnpj)} disabled />
        <p className="text-xs text-muted-foreground">O CNPJ não pode ser alterado depois do cadastro.</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Sobre a empresa</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={company.description ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="website">Site (opcional)</Label>
        <Input id="website" name="website" type="url" defaultValue={company.website ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" name="city" defaultValue={company.city ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state">Estado</Label>
          <Input id="state" name="state" maxLength={2} defaultValue={company.state ?? "PI"} />
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-primary">Dados salvos!</p>}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  )
}
