"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { getResumeSignedUrl } from "@/lib/actions/applications"

export function ResumeLinkButton({ applicationId }: { applicationId: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const url = await getResumeSignedUrl(applicationId)
      if (url) window.open(url, "_blank", "noopener,noreferrer")
    })
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={pending}>
      {pending ? "Abrindo..." : "Ver currículo"}
    </Button>
  )
}
