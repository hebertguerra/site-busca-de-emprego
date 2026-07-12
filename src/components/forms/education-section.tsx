"use client"

import { useActionState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addEducation, deleteEducation } from "@/lib/actions/candidate"
import type { Database } from "@/types/database.types"

type Education = Database["public"]["Tables"]["candidate_education"]["Row"]

export function EducationSection({ education }: { education: Education[] }) {
  const [state, formAction, pending] = useActionState(addEducation, undefined)
  const [deleting, startDelete] = useTransition()

  return (
    <div className="grid gap-4">
      {education.length > 0 && (
        <ul className="grid gap-2">
          {education.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm"
            >
              <div>
                <p className="font-medium">{item.institution}</p>
                <p className="text-muted-foreground">
                  {[item.degree, item.field_of_study].filter(Boolean).join(" — ")}
                  {item.start_year ? ` (${item.start_year}${item.end_year ? `–${item.end_year}` : ""})` : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={deleting}
                onClick={() => startDelete(() => deleteEducation(item.id))}
              >
                Remover
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="grid gap-3 rounded-lg border p-3">
        <div className="grid gap-1">
          <Label htmlFor="institution">Instituição / curso</Label>
          <Input
            id="institution"
            name="institution"
            placeholder="Ex: SENAC Bom Jesus"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <Label htmlFor="degree">Nível (opcional)</Label>
            <Input id="degree" name="degree" placeholder="Ex: Técnico, Curso livre" />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="fieldOfStudy">Área (opcional)</Label>
            <Input id="fieldOfStudy" name="fieldOfStudy" placeholder="Ex: Administração" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <Label htmlFor="startYear">Ano de início (opcional)</Label>
            <Input id="startYear" name="startYear" type="number" min={1950} max={2100} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="endYear">Ano de conclusão (opcional)</Label>
            <Input id="endYear" name="endYear" type="number" min={1950} max={2100} />
          </div>
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <Button type="submit" disabled={pending} size="sm" className="w-full sm:w-auto">
          {pending ? "Adicionando..." : "Adicionar formação"}
        </Button>
      </form>
    </div>
  )
}
