"use client"

import { useActionState, useState } from "react"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createJobBoostCheckout } from "@/lib/actions/boosts"
import { BOOST_PLANS, type BoostTierInput } from "@/lib/validations/boost"

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function BoostJobDialog({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [tier, setTier] = useState<BoostTierInput>("15_dias")
  const [state, formAction, pending] = useActionState(createJobBoostCheckout, undefined)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="gap-1.5">
          <Sparkles className="size-3.5" />
          Destacar vaga
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Destacar &ldquo;{jobTitle}&rdquo;</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Vagas em destaque aparecem no topo da busca com um selo, por tempo limitado.
        </p>

        <form action={formAction} className="grid gap-3">
          <input type="hidden" name="jobId" value={jobId} />
          <input type="hidden" name="tier" value={tier} />

          <div className="grid gap-2">
            {(Object.entries(BOOST_PLANS) as [BoostTierInput, (typeof BOOST_PLANS)[BoostTierInput]][]).map(
              ([key, plan]) => (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm transition-colors ${
                    tier === key ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tier-select"
                      value={key}
                      checked={tier === key}
                      onChange={() => setTier(key)}
                      className="size-4"
                    />
                    {plan.label}
                  </span>
                  <span className="font-semibold">{formatPrice(plan.priceCents)}</span>
                </label>
              )
            )}
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Redirecionando para o pagamento..." : "Ir para o pagamento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
