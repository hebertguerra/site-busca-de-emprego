"use client"

import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { reportJob } from "@/lib/actions/reports"

export function ReportJobDialog({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(reportJob, undefined)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-sm text-muted-foreground underline">
          Denunciar vaga
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Denunciar esta vaga</DialogTitle>
        </DialogHeader>
        {state?.success ? (
          <p className="text-sm text-primary">
            Denúncia enviada. Nossa equipe vai analisar em breve.
          </p>
        ) : (
          <form action={formAction} className="grid gap-3">
            <input type="hidden" name="jobId" value={jobId} />
            <Textarea name="reason" placeholder="Descreva o motivo da denúncia" required rows={4} />
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={pending}>
              {pending ? "Enviando..." : "Enviar denúncia"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
