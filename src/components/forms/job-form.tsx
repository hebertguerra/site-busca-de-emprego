"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Database } from "@/types/database.types"

type Job = Database["public"]["Tables"]["jobs"]["Row"]
type ActionState = { error?: string } | undefined
type JobFormAction = (state: ActionState, formData: FormData) => Promise<ActionState>

export function JobForm({ job, action }: { job?: Job; action: JobFormAction }) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Título da vaga</Label>
        <Input id="title" name="title" defaultValue={job?.title ?? ""} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={job?.description ?? ""} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="requirements">Requisitos (opcional)</Label>
        <Textarea id="requirements" name="requirements" rows={3} defaultValue={job?.requirements ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="benefits">Benefícios (opcional)</Label>
        <Textarea id="benefits" name="benefits" rows={2} defaultValue={job?.benefits ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="contractType">Tipo de contrato</Label>
          <Select name="contractType" defaultValue={job?.contract_type}>
            <SelectTrigger id="contractType">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLT">CLT</SelectItem>
              <SelectItem value="PJ">PJ</SelectItem>
              <SelectItem value="estagio">Estágio</SelectItem>
              <SelectItem value="temporario">Temporário</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="workplaceType">Modelo de trabalho</Label>
          <Select name="workplaceType" defaultValue={job?.workplace_type}>
            <SelectTrigger id="workplaceType">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="remoto">Remoto</SelectItem>
              <SelectItem value="hibrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" name="city" defaultValue={job?.city ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state">Estado</Label>
          <Input id="state" name="state" maxLength={2} defaultValue={job?.state ?? "PI"} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="salaryMin">Salário mínimo (opcional)</Label>
          <Input id="salaryMin" name="salaryMin" type="number" min={0} defaultValue={job?.salary_min ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="salaryMax">Salário máximo (opcional)</Label>
          <Input id="salaryMax" name="salaryMax" type="number" min={0} defaultValue={job?.salary_max ?? ""} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="salaryIsPublic" name="salaryIsPublic" defaultChecked={job?.salary_is_public} />
        <Label htmlFor="salaryIsPublic" className="text-sm font-normal">
          Mostrar o salário na vaga publicada
        </Label>
      </div>

      <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        Não inclua critérios como idade, sexo, raça ou estado civil na vaga — isso é vedado pela
        Lei 9.029/95 e vagas com esses termos são sinalizadas para revisão.
      </p>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : job ? "Salvar alterações" : "Enviar vaga para aprovação"}
      </Button>
    </form>
  )
}
