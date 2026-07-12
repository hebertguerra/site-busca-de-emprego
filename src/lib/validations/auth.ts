import { z } from "zod"

import { isValidCnpj, onlyDigits } from "@/lib/cnpj"

export const signInSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
})

export type SignInInput = z.infer<typeof signInSchema>

const passwordSchema = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")

export const candidateSignUpSchema = z
  .object({
    fullName: z.string().min(3, "Informe seu nome completo."),
    phone: z.string().min(10, "Informe um telefone/WhatsApp válido."),
    email: z.string().email("Informe um e-mail válido."),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptedTerms: z.literal(
      true,
      "É necessário aceitar os Termos de Uso e a Política de Privacidade."
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  })

export type CandidateSignUpInput = z.infer<typeof candidateSignUpSchema>

export const companySignUpSchema = z
  .object({
    tradeName: z.string().min(2, "Informe o nome da empresa."),
    cnpj: z
      .string()
      .transform(onlyDigits)
      .refine((value) => isValidCnpj(value), "Informe um CNPJ válido."),
    phone: z.string().min(10, "Informe um telefone/WhatsApp válido."),
    email: z.string().email("Informe um e-mail válido."),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptedTerms: z.literal(
      true,
      "É necessário aceitar os Termos de Uso e a Política de Privacidade."
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  })

export type CompanySignUpInput = z.infer<typeof companySignUpSchema>
