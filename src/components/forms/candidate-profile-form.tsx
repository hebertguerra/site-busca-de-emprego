"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateCandidateProfile } from "@/lib/actions/candidate"
import type { Database } from "@/types/database.types"

const CONTRACT_OPTIONS: { value: string; label: string }[] = [
  { value: "CLT", label: "CLT" },
  { value: "PJ", label: "PJ" },
  { value: "estagio", label: "Estágio" },
  { value: "temporario", label: "Temporário" },
  { value: "freelance", label: "Freelance" },
]

type Candidate = Database["public"]["Tables"]["candidates"]["Row"]

export function CandidateProfileForm({ candidate }: { candidate: Candidate | null }) {
  const [state, formAction, pending] = useActionState(updateCandidateProfile, undefined)

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="headline">O que você faz?</Label>
        <Input
          id="headline"
          name="headline"
          placeholder="Ex: Auxiliar administrativo"
          defaultValue={candidate?.headline ?? ""}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Fale um pouco sobre você (opcional)</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={candidate?.bio ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" name="city" defaultValue={candidate?.city ?? ""} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state">Estado</Label>
          <Input id="state" name="state" maxLength={2} defaultValue={candidate?.state ?? "PI"} required />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          placeholder="(89) 9 9999-9999"
          defaultValue={candidate?.whatsapp ?? ""}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="skillsText">Habilidades (separadas por vírgula)</Label>
        <Input
          id="skillsText"
          name="skillsText"
          placeholder="Ex: atendimento ao cliente, excel, direção veicular"
          defaultValue={candidate?.skills?.join(", ") ?? ""}
        />
      </div>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Tipos de contrato de interesse</legend>
        <div className="flex flex-wrap gap-3">
          {CONTRACT_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="desiredContractTypes"
                value={option.value}
                defaultChecked={candidate?.desired_contract_types?.includes(option.value)}
                className="size-4 rounded border-input"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-primary">Perfil salvo!</p>}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : "Salvar perfil"}
      </Button>
    </form>
  )
}
