"use client"

import { useState, useTransition } from "react"
import imageCompression from "browser-image-compression"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { setCandidatePhoto } from "@/lib/actions/candidate"
import { photoUploadSchema } from "@/lib/validations/candidate"
import { createClient } from "@/lib/supabase/client"

export function AvatarUploader({
  userId,
  currentUrl,
}: {
  userId: string
  currentUrl: string | null
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 800,
      })

      const parsed = photoUploadSchema.safeParse({ file: compressed })
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Arquivo inválido.")
        return
      }

      startTransition(async () => {
        const supabase = createClient()
        const path = `${userId}/avatar.jpg`
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, compressed, { upsert: true, contentType: compressed.type })

        if (uploadError) {
          setError("Não foi possível enviar a foto. Tente novamente.")
          return
        }

        const { data } = supabase.storage.from("avatars").getPublicUrl(path)
        await setCandidatePhoto(data.publicUrl)
        setPreview(data.publicUrl)
      })
    } catch {
      setError("Não foi possível processar a imagem. Tente outra foto.")
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src={preview ?? undefined} alt="Sua foto" />
        <AvatarFallback>Foto</AvatarFallback>
      </Avatar>
      <div className="grid gap-1">
        <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} disabled={pending} />
        <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP, até 2MB.</p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  )
}
