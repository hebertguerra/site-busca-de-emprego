import { z } from "zod"

export const applicationSchema = z.object({
  jobId: z.uuid("Vaga inválida."),
  coverNote: z.string().max(1000, "A mensagem pode ter até 1000 caracteres.").optional(),
})

export type ApplicationInput = z.infer<typeof applicationSchema>

export const applicationStatusUpdateSchema = z.object({
  applicationId: z.uuid("Candidatura inválida."),
  status: z.enum(["em_analise", "entrevista", "aprovado", "rejeitado"]),
})

export type ApplicationStatusUpdateInput = z.infer<typeof applicationStatusUpdateSchema>
