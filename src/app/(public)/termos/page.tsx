export const metadata = { title: "Termos de Uso" }

export default function TermosPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Termos de Uso</h1>
      <div className="prose prose-sm mt-4 max-w-none space-y-4 text-muted-foreground">
        <p>
          Ao criar uma conta no Vagas Piauí, candidato ou empresa concordam
          com estes termos.
        </p>

        <h2 className="text-base font-semibold text-foreground">Candidatos</h2>
        <p>
          As informações do seu perfil e currículo devem ser verdadeiras. O
          uso da plataforma para fins fraudulentos resulta em suspensão da
          conta.
        </p>

        <h2 className="text-base font-semibold text-foreground">Empresas</h2>
        <p>
          As vagas publicadas passam por uma revisão antes de ficarem
          visíveis ao público. Não são permitidas vagas com critérios
          discriminatórios (idade, sexo, raça, estado civil, aparência ou
          similares), conforme a Lei 9.029/95. Vagas que violem esta regra
          serão rejeitadas ou removidas.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Denúncias
        </h2>
        <p>
          Qualquer pessoa pode denunciar uma vaga ou empresa que julgue
          inadequada. As denúncias são analisadas pela equipe de moderação.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Alterações
        </h2>
        <p>
          Estes termos podem ser atualizados. Mudanças relevantes serão
          comunicadas na plataforma.
        </p>
      </div>
    </div>
  )
}
