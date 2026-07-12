import { z } from "zod"

import { isValidCnpj, onlyDigits } from "@/lib/cnpj"

export const companyProfileSchema = z.object({
  tradeName: z.string().min(2, "Informe o nome fantasia."),
  legalName: z.string().min(2, "Informe a razão social.").optional(),
  cnpj: z
    .string()
    .transform(onlyDigits)
    .refine((value) => isValidCnpj(value), "Informe um CNPJ válido."),
  description: z.string().max(1000).optional(),
  website: z.string().url("Informe uma URL válida.").optional().or(z.literal("")),
  city: z.string().min(2, "Informe a cidade.").optional(),
  state: z.string().length(2, "Use a sigla do estado, ex: PI.").optional(),
})

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>
