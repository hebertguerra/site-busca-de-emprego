import { Building2 } from "lucide-react"

import { AuthCard } from "@/components/shared/auth-card"
import { CompanySignUpForm } from "@/components/forms/company-sign-up-form"

export const metadata = { title: "Cadastrar empresa" }

export default function CadastroEmpresaPage() {
  return (
    <AuthCard
      icon={Building2}
      title="Cadastrar empresa"
      subtitle="Publique vagas e encontre talentos da região"
    >
      <CompanySignUpForm />
    </AuthCard>
  )
}
