import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanySignUpForm } from "@/components/forms/company-sign-up-form"

export const metadata = { title: "Cadastrar empresa" }

export default function CadastroEmpresaPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanySignUpForm />
        </CardContent>
      </Card>
    </div>
  )
}
