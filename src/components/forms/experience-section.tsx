"use client"

import { useActionState, useTransition } from "react"

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
import { addExperience, deleteExperience } from "@/lib/actions/candidate"
import type { Database, EmploymentType } from "@/types/database.types"

type Experience = Database["public"]["Tables"]["candidate_experiences"]["Row"]

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  formal: "Carteira assinada (CLT)",
  informal: "Informal / bico",
  autonomo: "Autônomo / conta própria",
}

export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  const [state, formAction, pending] = useActionState(addExperience, undefined)
  const [deleting, startDelete] = useTransition()

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Inclua qualquer experiência, mesmo sem carteira assinada — trabalho informal, bico ou
        autônomo também conta como experiência para a empresa que está contratando.
      </p>

      {experiences.length > 0 && (
        <ul className="grid gap-2">
          {experiences.map((experience) => (
            <li
              key={experience.id}
              className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {experience.role_title} — {experience.company_name}
                </p>
                <p className="text-muted-foreground">
                  {EMPLOYMENT_TYPE_LABELS[experience.employment_type]}
                  {experience.is_current ? " · atual" : ""}
                </p>
                {experience.description && <p className="mt-1">{experience.description}</p>}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={deleting}
                onClick={() => startDelete(() => deleteExperience(experience.id))}
              >
                Remover
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="grid gap-3 rounded-lg border p-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <Label htmlFor="companyName">Empresa ou cliente</Label>
            <Input id="companyName" name="companyName" placeholder="Ex: Fazenda Boa Vista" required />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="roleTitle">Função</Label>
            <Input id="roleTitle" name="roleTitle" placeholder="Ex: Operador de máquinas" required />
          </div>
        </div>

        <div className="grid gap-1">
          <Label htmlFor="employmentType">Tipo de vínculo</Label>
          <Select name="employmentType" defaultValue="formal">
            <SelectTrigger id="employmentType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Carteira assinada (CLT)</SelectItem>
              <SelectItem value="informal">Informal / bico</SelectItem>
              <SelectItem value="autonomo">Autônomo / conta própria</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <Label htmlFor="startDate">Início</Label>
            <Input id="startDate" name="startDate" type="date" required />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="endDate">Fim (deixe em branco se atual)</Label>
            <Input id="endDate" name="endDate" type="date" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="isCurrent" name="isCurrent" />
          <Label htmlFor="isCurrent" className="text-sm font-normal">
            Trabalho atual
          </Label>
        </div>

        <div className="grid gap-1">
          <Label htmlFor="description">O que você fazia (opcional)</Label>
          <Textarea id="description" name="description" rows={2} />
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <Button type="submit" disabled={pending} size="sm" className="w-full sm:w-auto">
          {pending ? "Adicionando..." : "Adicionar experiência"}
        </Button>
      </form>
    </div>
  )
}
