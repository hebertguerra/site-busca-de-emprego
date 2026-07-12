import { z } from "zod"

export const jobSchema = z.object({
  title: z.string().min(5, "Dê um título claro para a vaga.").max(120),
  description: z.string().min(30, "Descreva a vaga com mais detalhes."),
  requirements: z.string().max(2000).optional(),
  benefits: z.string().max(1000).optional(),
  contractType: z.enum(["CLT", "PJ", "estagio", "temporario", "freelance"]),
  workplaceType: z.enum(["presencial", "remoto", "hibrido"]),
  city: z.string().min(2, "Informe a cidade da vaga.").optional(),
  state: z.string().length(2, "Use a sigla do estado, ex: PI.").default("PI"),
  salaryMin: z.coerce.number().nonnegative().optional(),
  salaryMax: z.coerce.number().nonnegative().optional(),
  salaryIsPublic: z.boolean().default(false),
})

export type JobInput = z.infer<typeof jobSchema>
