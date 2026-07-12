"use client"

import { useActionState, useRef } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateApplicationStatus } from "@/lib/actions/applications"
import type { ApplicationStatus } from "@/types/database.types"

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "enviada", label: "Enviada" },
  { value: "em_analise", label: "Em análise" },
  { value: "entrevista", label: "Entrevista" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Não seguiu" },
]

export function ApplicationStatusForm({
  applicationId,
  currentStatus,
}: {
  applicationId: string
  currentStatus: ApplicationStatus
}) {
  const [, formAction] = useActionState(updateApplicationStatus, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="applicationId" value={applicationId} />
      <Select
        name="status"
        defaultValue={currentStatus}
        onValueChange={() => formRef.current?.requestSubmit()}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  )
}
