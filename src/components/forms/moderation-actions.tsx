"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { approveJob, rejectJob } from "@/lib/actions/moderation"

export function ModerationActions({ jobId }: { jobId: string }) {
  const [reason, setReason] = useState("")
  const [showReasonInput, setShowReasonInput] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => approveJob(jobId))}
      >
        Aprovar
      </Button>

      {showReasonInput ? (
        <div className="flex gap-2">
          <Input
            placeholder="Motivo da rejeição"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="h-8 w-48"
          />
          <Button
            size="sm"
            variant="destructive"
            disabled={pending || !reason.trim()}
            onClick={() => startTransition(() => rejectJob(jobId, reason))}
          >
            Confirmar
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="destructive" onClick={() => setShowReasonInput(true)}>
          Rejeitar
        </Button>
      )}
    </div>
  )
}
