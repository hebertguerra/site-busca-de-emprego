import { z } from "zod"

export const candidateProfileSchema = z.object({
  headline: z
    .string()
    .min(3, "Conte em poucas palavras o que você faz.")
    .max(100),
  bio: z.string().max(1000, "A descrição pode ter até 1000 caracteres.").optional(),
  city: z.string().min(2, "Informe sua cidade."),
  state: z.string().length(2, "Use a sigla do estado, ex: PI.").default("PI"),
  whatsapp: z.string().min(10, "Informe um WhatsApp válido."),
  skills: z.array(z.string().min(1)).max(30).default([]),
  desiredContractTypes: z
    .array(z.enum(["CLT", "PJ", "estagio", "temporario", "freelance"]))
    .min(1, "Selecione ao menos um tipo de contrato de interesse."),
})

export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>

export const experienceSchema = z.object({
  companyName: z.string().min(2, "Informe o nome da empresa."),
  roleTitle: z.string().min(2, "Informe o cargo/função."),
  startDate: z.string().min(1, "Informe a data de início."),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().max(500).optional(),
})

export type ExperienceInput = z.infer<typeof experienceSchema>

export const educationSchema = z.object({
  institution: z.string().min(2, "Informe a instituição de ensino."),
  degree: z.string().max(100).optional(),
  fieldOfStudy: z.string().max(100).optional(),
  startYear: z.coerce.number().int().min(1950).max(2100).optional(),
  endYear: z.coerce.number().int().min(1950).max(2100).optional(),
})

export type EducationInput = z.infer<typeof educationSchema>

export const photoUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, "A foto deve ter no máximo 2MB.")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Envie a foto em JPEG, PNG ou WebP."
    ),
})

export const resumeUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "O currículo deve ter no máximo 5MB.")
    .refine((file) => file.type === "application/pdf", "Envie o currículo em PDF."),
})
