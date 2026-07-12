"use client"

import { useState, useTransition } from "react"

import { Input } from "@/components/ui/input"
import { setCandidateResume } from "@/lib/actions/candidate"
import { resumeUploadSchema } from "@/lib/validations/candidate"
import { createClient } from "@/lib/supabase/client"

export function ResumeUploader({
  userId,
  currentUrl,
}: {
  userId: string
  currentUrl: string | null
}) {
  const [fileName, setFileName] = useState<string | null>(currentUrl ? "Currículo enviado" : null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)

    const parsed = resumeUploadSchema.safeParse({ file })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Arquivo inválido.")
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const path = `${userId}/curriculo.pdf`
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, file, { upsert: true, contentType: "application/pdf" })

      if (uploadError) {
        setError("Não foi possível enviar o currículo. Tente novamente.")
        return
      }

      await setCandidateResume(path)
      setFileName(file.name)
    })
  }

  return (
    <div className="grid gap-1">
      <Input type="file" accept="application/pdf" onChange={handleChange} disabled={pending} />
      <p className="text-xs text-muted-foreground">PDF, até 5MB.</p>
      {fileName && <p className="text-xs text-muted-foreground">Arquivo atual: {fileName}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
