# Vagas Piauí

Plataforma de vagas de emprego conectando candidatos e empresas do Sul do
Piauí e do Nordeste. Empresas cadastram vagas, candidatos criam perfil com
foto e currículo e se candidatam — tudo pensado para uso no celular e em
conexões instáveis.

Contexto completo do produto (arquitetura, modelo de dados, LGPD, roteiro por
fases) está em [`docs/spec.md`](docs/spec.md).

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript) + Tailwind CSS + shadcn/ui
- [Supabase](https://supabase.com) (Postgres, Auth, Storage) com Row Level Security
- Deploy: Vercel (app) + Supabase (dados), ambos no free tier

## Rodando localmente

### 1. Instalar as dependências

```bash
npm install
```

### 2. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta (dá pra usar login do GitHub).
2. Clique em **New Project**.
3. Escolha uma organização (ou crie uma), dê um nome ao projeto (ex: `vagas-piaui`), defina uma senha forte para o banco (guarde-a) e escolha a região mais próxima do Brasil (geralmente `South America (São Paulo)`).
4. Aguarde alguns minutos até o projeto ficar pronto (status "Healthy").

### 3. Pegar a URL e as chaves da API

1. No painel do projeto, vá em **Project Settings** (ícone de engrenagem) → **API**.
2. Você vai precisar de três valores:
   - **Project URL** → algo como `https://xxxxxxxxxxxx.supabase.co`
   - **anon / public key** → uma chave longa (JWT)
   - **service_role key** → outra chave longa, marcada como secreta (⚠️ nunca compartilhe publicamente nem comite no repositório)

### 4. Configurar as variáveis de ambiente

```bash
cp .env.example .env.local
```

Abra `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<a anon key>
SUPABASE_SERVICE_ROLE_KEY=<a service_role key>
```

As demais variáveis (Upstash, Turnstile, Resend) podem ficar em branco por
enquanto — o site funciona sem elas em desenvolvimento.

### 5. Aplicar a migration (criar tabelas, RLS e buckets de storage)

Duas formas, escolha a mais simples pra você:

**Opção A — pelo painel (mais simples, sem instalar nada):**

1. No painel do Supabase, vá em **SQL Editor**.
2. Abra o arquivo `supabase/migrations/0001_init.sql` deste repositório, copie todo o conteúdo.
3. Cole no SQL Editor e clique em **Run**.

**Opção B — pela linha de comando (CLI):**

```bash
npx supabase login
npx supabase link --project-ref <seu-project-ref>
npx supabase db push
```

(o `project-ref` é o trecho antes de `.supabase.co` na Project URL, ex: `xxxxxxxxxxxx`)

Isso cria todas as tabelas, ativa a segurança (RLS) e já cria os buckets de
armazenamento (`avatars` e `resumes`) automaticamente.

### 6. Gerar os tipos TypeScript reais (opcional, mas recomendado)

Substitui o arquivo escrito manualmente em `src/types/database.types.ts`
pelo gerado direto do seu banco:

```bash
npx supabase gen types typescript --project-id <seu-project-ref> --schema public > src/types/database.types.ts
```

### 7. Rodar e testar

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Crie uma conta de
candidato, complete o perfil, crie uma conta de empresa (em outra
aba/navegador anônimo), publique uma vaga, e veja ela aparecer em
`/moderacao` para aprovar. Na primeira vez, você precisa promover seu
próprio usuário a `admin` diretamente no banco (SQL Editor):

```sql
update public.profiles set role = 'admin' where id = '<seu-user-id>';
```

(o `<seu-user-id>` é encontrado em **Authentication > Users** no painel do Supabase)

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — ESLint

## Estrutura

```
src/app/(public)     rotas públicas: landing, vagas, sobre, privacidade, termos
src/app/(auth)       login e cadastro (candidato/empresa)
src/app/(candidato)  painel, perfil (foto/currículo), candidaturas
src/app/(empresa)    painel, perfil, CRUD de vagas, candidatos por vaga
src/app/(admin)      moderação (aprovar/rejeitar vagas, denúncias)
src/lib/supabase     clientes Supabase (browser/server/admin)
src/lib/actions       Server Actions (mutações)
src/lib/validations   schemas zod compartilhados
supabase/migrations   schema SQL + RLS
```
