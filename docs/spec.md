# Plataforma de Vagas — Sul do Piauí / Nordeste

> Documento de especificação do produto. Serve de referência para decisões de
> arquitetura, modelo de dados, conformidade legal e roteiro do projeto.

## Contexto

O objetivo é um site profissional de empregos conectando candidatos e
empresas, com foco na região Sul do Piauí/Nordeste (usuários majoritariamente
mobile, conexão instável, baixa alfabetização digital em parte do público). O
site precisa seguir a LGPD e boas práticas de recrutamento (não-discriminação,
processo seletivo justo), e no futuro deve monetizar via anúncios pagos de
empresas para se sustentar.

Decisões já validadas:
- **Stack**: Next.js (App Router, TypeScript) + Supabase (Postgres, Auth, Storage).
- **Hospedagem**: Vercel (app) + Supabase (dados), ambos no free tier para começar.
- **Escopo do MVP**: essencial — cadastro de empresas, publicação de vagas,
  cadastro de candidatos com foto/currículo, busca e candidatura. IA de
  triagem e anúncios pagos ficam para fases futuras (o modelo de dados já
  deixa espaço barato para isso).
- **Git**: repositório no GitHub em `https://github.com/hebertguerra/site-busca-de-emprego`.

## Arquitetura de alto nível

Next.js App Router, TypeScript strict. Server Components por padrão para
leitura de dados (listagem de vagas, painéis); Client Components só nas
folhas interativas (formulários, upload, filtros). Mutações via **Server
Actions** (criar vaga, atualizar perfil, candidatar-se, mudar status de
candidatura) — mais simples de casar com RLS do que rotas de API separadas.

Estrutura de pastas (rotas):
```
src/app/(public)      -- landing, /vagas, /vagas/[id], /sobre, /privacidade, /termos
src/app/(auth)         -- /entrar, /cadastro/candidato, /cadastro/empresa
src/app/(candidato)    -- /painel, /perfil, /minhas-candidaturas
src/app/(empresa)      -- /empresa/painel, /empresa/perfil, /empresa/vagas,
                          /empresa/vagas/nova, /empresa/vagas/[id]/editar,
                          /empresa/vagas/[id]/candidatos
src/app/(admin)        -- /moderacao
```
> Nota de implementação: o painel da empresa fica em `/empresa/painel` (não
> `/painel`) para não colidir com a URL do painel do candidato — os route
> groups do Next.js não adicionam segmento à URL.

Auth via Supabase Auth (email+senha). `src/middleware.ts` protege os grupos
`(candidato)/(empresa)/(admin)` conforme `profiles.role`.

## Modelo de dados (Supabase/Postgres)

RLS habilitado em todas as tabelas desde a primeira migration
(`supabase/migrations/0001_init.sql`), deny-by-default.

- **profiles**: `id (FK auth.users)`, `role`, `full_name`, `phone`, `consent_lgpd_accepted_at`, `consent_version`.
- **candidates** (1:1 com profiles): `photo_url`, `headline`, `bio`, `city`, `state`, `whatsapp`, `resume_file_url`, `skills[]`, `desired_contract_types[]`, `profile_visibility`, `deleted_at` (soft delete). **Sem campos de idade/estado civil/raça.**
- **candidate_experiences**, **candidate_education**: histórico profissional/educacional.
- **companies** (1:1 com profiles): `trade_name`, `legal_name`, `cnpj` (único), `verified`, `plan_tier` (hook Fase 2, não usado no MVP).
- **jobs**: `company_id`, título/descrição/requisitos, `contract_type`, `workplace_type`, `status` (`rascunho`/`pendente_aprovacao`/`publicada`/`pausada`/`encerrada`/`rejeitada`), `is_featured` (hook Fase 3/monetização), `economic_sector`/`required_skills`/`suggested_qualification` (hooks Fase 2/qualificação, ver `0002_qualification_hooks.sql`).
- **applications**: `job_id`, `candidate_id`, `status`, `cover_note`, unique `(job_id, candidate_id)`.
- **application_status_history**: trilha de auditoria de mudança de status (trigger automático).
- **data_access_log**: LGPD — registra quando uma empresa visualiza o perfil completo de um candidato.
- **reports**: denúncias de vaga/empresa (inserção pública).
- **consent_log**: registro de consentimento (`cadastro`, `foto`, `curriculo`, `cookies`).

**Políticas RLS-chave:**
- `candidates`: candidato só lê/edita a própria linha; **empresa só lê um
  candidato via join com `applications`** da própria vaga — não existe busca
  pública de candidatos no MVP.
- `jobs`: leitura pública só onde `status='publicada'`; empresa só CRUD nas
  próprias vagas; **transição para `publicada`/`rejeitada` só via trigger que
  exige `auth.role() = 'service_role'`** (ou seja, só uma Server Action de
  admin usando `src/lib/supabase/admin.ts` consegue aprovar/rejeitar).
- `applications`: candidato insere/lê as próprias; empresa lê/atualiza status
  só das candidaturas às próprias vagas; sem DELETE físico (status `desistiu`).
- Storage: bucket `avatars` público leitura/dono escrita; bucket `resumes`
  **privado** — acesso da empresa via signed URL emitida por Server Action
  (`getResumeSignedUrl`) que confirma a relação candidatura↔vaga↔empresa antes
  de gerar a URL, e registra o acesso em `data_access_log`.

## Conformidade LGPD e boas práticas de seleção

| Preocupação | Mecanismo implementado |
|---|---|
| Consentimento de cadastro | Checkbox obrigatório no cadastro → `consent_log` + `profiles.consent_lgpd_accepted_at` (`src/lib/consent.ts`) |
| Consentimento de foto/currículo | Checkbox implícito no fluxo de upload → `consent_log` tipo `foto`/`curriculo` |
| Direito ao esquecimento | Soft delete (`candidates.deleted_at`) já exclui o candidato das buscas de empresas via RLS; hard delete definitivo é trabalho de acompanhamento (job manual/cron) |
| Anti-discriminação | Formulário de vaga não tem campos de idade/sexo/raça/estado civil; `src/lib/discriminatory-terms.ts` sinaliza termos suspeitos e cria uma denúncia automática para revisão do admin |
| Minimização de dados | Foto/currículo só visíveis para empresas às quais o candidato se candidatou |
| Trilha de auditoria | `data_access_log` a cada visualização de currículo por uma empresa |
| Base legal documentada | Página `/privacidade` |

## Escolhas técnicas

- UI: Tailwind CSS + shadcn/ui (base Radix — a base `base-nova`/`@base-ui`
  padrão do CLI atual não tem o componente `form` completo, por isso o
  projeto foi inicializado com `-b radix`).
- Formulários: `react-hook-form` + `zod`, mais em vários fluxos formulários
  nativos com Server Actions (`useActionState`) quando a validação
  client-side extra não compensa a complexidade.
- Auth/dados: `@supabase/ssr` (browser/server) + `@supabase/supabase-js` (admin).
- Upload: compressão client-side de foto (`browser-image-compression`),
  upload direto do navegador para o Storage (RLS de dono + limites de
  tamanho/mime configurados nos buckets), sem passar pelo servidor Next.js.
- Rate limiting: Upstash Redis (`src/lib/rate-limit.ts`), com no-op automático
  em desenvolvimento se as env vars não estiverem configuradas.
- Testes: a configurar (Vitest para schemas/utils, Playwright para o fluxo
  crítico) — ainda não incluído neste scaffold inicial.

## Deploy e segurança

1. Projeto Supabase free tier, região mais próxima do Brasil.
2. Variáveis de ambiente conforme `.env.example`. `SUPABASE_SERVICE_ROLE_KEY`
   só é usada em `src/lib/supabase/admin.ts`, nunca no cliente.
3. RLS ativo desde a primeira migration.
4. Deploy Vercel conectado ao GitHub.
5. Validação de arquivo client+server (schemas em `src/lib/validations` +
   limites de tamanho/mime nos buckets do Storage).

## Roteiro por fases

- **Fase 1 (MVP — em andamento)**: cadastro, perfil, vagas, candidatura,
  moderação leve, LGPD, WhatsApp share. Este scaffold inicial já cobre o
  fluxo completo ponta a ponta (falta plugar um projeto Supabase real e
  testar).
- **Fase 2 (Qualificação profissional)**: motivada pela pesquisa em
  [`pesquisa-mercado-sul-piaui.md`](pesquisa-mercado-sul-piaui.md) — o
  problema local não é falta de vaga, é descompasso entre a vaga e a
  qualificação do candidato. Escopo:
  - Trilhas de qualificação atreladas à vaga: quando falta uma competência,
    sugerir o curso gratuito (SENAC/SENAI/Mais Formação Mais Renda) mais
    próximo que fecha a lacuna. Começa com um catálogo curado manualmente
    pelo admin, não scraping/integração automática.
  - Setorização de vagas por vocação econômica regional (`jobs.economic_sector`:
    agronegócio/MATOPIBA, turismo/Serra da Capivara, comércio e serviços,
    indústria e construção), já que são os polos de demanda identificados no
    Sul do Piauí.
  - Perfil do candidato reconhecendo experiência informal (bico, autônomo)
    como experiência real, não só histórico formal em CTPS.
  - Mostrar trajetória de ganho (faixa salarial acessível antes/depois de uma
    qualificação) em vez de mensagem moralizante sobre formalização — é a
    forma "não agressiva e direcionada" de endereçar o efeito de
    desincentivo do Bolsa Família identificado na pesquisa.
  - *Hooks de schema já reservados no MVP para não exigir migração
    disruptiva depois*: `jobs.economic_sector`, `jobs.required_skills`,
    `jobs.suggested_qualification` (ver `supabase/migrations/0002_qualification_hooks.sql`).
- **Fase 3 (Monetização — implementada)**: modelo escolhido foi "vaga em
  destaque avulsa" (pagamento único por 7/15/30 dias, não assinatura).
  Tabela `job_boosts` (`supabase/migrations/0004_job_boosts.sql`) registra
  cada compra; `jobs.featured_until` é a fonte de verdade de "está em
  destaque agora" (`is_featured and featured_until > now()`, calculado em
  tempo de leitura — sem cron). Checkout via Mercado Pago Checkout Pro
  (`src/lib/actions/boosts.ts`), confirmação só via webhook assinado
  (`src/app/api/webhooks/mercadopago/route.ts`, valida `x-signature` com o
  `WebhookSignatureValidator` do SDK oficial antes de processar qualquer
  coisa). Como no MVP, roda com env vars vazias sem quebrar o resto do site
  até o usuário configurar a conta Mercado Pago (passo a passo no README).
  `companies.plan_tier` segue reservado, não usado (seria para um Fase 3.5
  de assinatura mensal, se o modelo avulso não se sustentar sozinho).
- **Fase 4 (IA)**: matching de currículo/vaga usando `jobs.required_skills` x
  `candidates.skills`, extração automática de skills a partir do currículo,
  sempre com revisão humana disponível (LGPD Art. 20).
- **Fase 5 (Empreendedorismo/MEI)**: rota paralela ao emprego CLT para quem
  já trabalha por conta própria (22,8% dos ocupados no Piauí) — ligação com
  microcrédito/Sebrae para formalização como MEI.

## Setup local

Ver [`README.md`](../README.md).

## Pendências conhecidas deste scaffold inicial

- `src/types/database.types.ts` foi escrito manualmente a partir da migration
  — assim que houver um projeto Supabase real, regerar com
  `supabase gen types typescript`.
- A convenção de arquivo `middleware.ts` está marcada como deprecada pelo
  Next.js 16 em favor de `proxy.ts` (aviso no build, não bloqueante) — avaliar
  migração quando a documentação oficial estabilizar.
- Turnstile (anti-spam) e Resend (e-mail transacional) ainda não estão
  integrados no código, só documentados no `.env.example`.
