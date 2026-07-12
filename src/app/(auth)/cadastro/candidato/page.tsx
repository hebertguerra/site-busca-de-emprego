import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CandidateSignUpForm } from "@/components/forms/candidate-sign-up-form"

export const metadata = { title: "Criar conta de candidato" }

export default function CadastroCandidatoPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Criar conta de candidato</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidateSignUpForm />
        </CardContent>
      </Card>
    </div>
  )
}
