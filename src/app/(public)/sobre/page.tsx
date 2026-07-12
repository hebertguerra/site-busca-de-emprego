export const metadata = { title: "Sobre" }

export default function SobrePage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Sobre o Vagas Piauí</h1>
      <div className="prose prose-sm mt-4 max-w-none text-muted-foreground">
        <p>
          O Vagas Piauí nasceu para aproximar quem busca uma oportunidade de
          trabalho das empresas do Sul do Piauí e do Nordeste. Acreditamos que
          um processo seletivo justo, transparente e acessível a partir do
          celular pode mudar a vida de muita gente na nossa região.
        </p>
        <p>
          A plataforma é gratuita para candidatos e para o cadastro básico de
          vagas. Seguimos a Lei Geral de Proteção de Dados (LGPD) e boas
          práticas de recrutamento: não coletamos nem exibimos dados como
          idade, estado civil ou raça, e o currículo de um candidato só fica
          visível para as empresas às quais ele se candidatou.
        </p>
      </div>
    </div>
  )
}
