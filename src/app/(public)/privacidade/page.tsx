export const metadata = { title: "Política de Privacidade" }

export default function PrivacidadePage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Política de Privacidade</h1>
      <div className="prose prose-sm mt-4 max-w-none space-y-4 text-muted-foreground">
        <p>
          Esta política descreve como o Vagas Piauí trata os dados pessoais de
          candidatos e empresas, em conformidade com a Lei Geral de Proteção
          de Dados (Lei 13.709/2018 — LGPD).
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Quais dados coletamos
        </h2>
        <p>
          De candidatos: nome, e-mail, telefone/WhatsApp, foto, currículo em
          PDF, experiências profissionais e formação acadêmica. Não
          coletamos idade, estado civil, raça/cor ou outros dados sensíveis
          que possam gerar discriminação no processo seletivo.
        </p>
        <p>
          De empresas: razão social, CNPJ, dados de contato e informações
          sobre as vagas publicadas.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Base legal e uso dos dados
        </h2>
        <p>
          Tratamos os dados de candidatos com base no consentimento (Art. 7º,
          I, LGPD), obtido no cadastro e na etapa de upload de foto/currículo.
          O uso dos dados de empresas se baseia na execução do contrato de
          uso da plataforma.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Com quem compartilhamos
        </h2>
        <p>
          O perfil completo de um candidato (foto, currículo, contato) só
          fica visível para uma empresa depois que o candidato se candidata
          a uma vaga publicada por ela. Não existe busca pública de
          candidatos na plataforma. Toda visualização do perfil completo por
          uma empresa é registrada para fins de auditoria.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Seus direitos
        </h2>
        <p>
          Você pode solicitar a exclusão da sua conta e dos seus dados a
          qualquer momento, pelas configurações do seu perfil. Após a
          exclusão, seus dados deixam de aparecer para empresas
          imediatamente e são removidos definitivamente em até 30 dias.
        </p>

        <h2 className="text-base font-semibold text-foreground">Contato</h2>
        <p>
          Dúvidas sobre seus dados pessoais podem ser enviadas para o e-mail
          de contato informado na página Sobre.
        </p>
      </div>
    </div>
  )
}
