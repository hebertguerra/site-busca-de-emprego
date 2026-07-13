"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { applyToJob } from "@/lib/actions/applications"

export function ApplyButton({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState(applyToJob, undefined)

  if (state?.success) {
    return (
      <p className="animate-in fade-in zoom-in-95 duration-300 rounded-md bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
        Candidatura enviada! A empresa vai analisar seu perfil.
      </p>
    )
  }

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="jobId" value={jobId} />
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 sm:w-auto"
      >
        {pending ? "Enviando..." : "Candidatar-se"}
      </Button>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  )
}
