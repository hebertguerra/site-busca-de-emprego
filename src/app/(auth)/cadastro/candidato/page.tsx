import { UserRound } from "lucide-react"

import { AuthCard } from "@/components/shared/auth-card"
import { CandidateSignUpForm } from "@/components/forms/candidate-sign-up-form"

export const metadata = { title: "Criar conta de candidato" }

export default function CadastroCandidatoPage() {
  return (
    <AuthCard
      icon={UserRound}
      title="Criar conta de candidato"
      subtitle="Monte seu perfil e candidate-se a vagas perto de você"
    >
      <CandidateSignUpForm />
    </AuthCard>
  )
}
