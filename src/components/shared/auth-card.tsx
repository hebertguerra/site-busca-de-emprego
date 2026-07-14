import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function AuthCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <Card className="gap-0 overflow-hidden rounded-3xl border-border/70 py-0 shadow-lg">
        <div className="bg-gradient-to-br from-primary via-orange-600 to-amber-500 px-6 py-7 text-primary-foreground">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Icon className="size-5" />
          </span>
          <h1 className="mt-3 text-xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-primary-foreground/85">{subtitle}</p>}
        </div>
        <CardContent className="grid gap-4 py-6">{children}</CardContent>
      </Card>
    </div>
  )
}
