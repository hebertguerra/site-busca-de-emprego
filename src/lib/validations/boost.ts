import { z } from "zod"

export const boostTierSchema = z.enum(["7_dias", "15_dias", "30_dias"])
export type BoostTierInput = z.infer<typeof boostTierSchema>

export const BOOST_PLANS: Record<
  BoostTierInput,
  { label: string; durationDays: number; priceCents: number }
> = {
  "7_dias": { label: "7 dias", durationDays: 7, priceCents: 2990 },
  "15_dias": { label: "15 dias", durationDays: 15, priceCents: 4990 },
  "30_dias": { label: "30 dias", durationDays: 30, priceCents: 8990 },
}

export const createBoostSchema = z.object({
  jobId: z.uuid("Vaga inválida."),
  tier: boostTierSchema,
})
