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

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um projeto no [Supabase](https://supabase.com), copie a URL e as
   chaves em *Project Settings > API*, e preencha um `.env.local` a partir
   de `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

3. Aplique a migration inicial no seu projeto Supabase (via CLI ou colando o
   conteúdo de `supabase/migrations/0001_init.sql` no SQL Editor do painel):

   ```bash
   npx supabase link --project-ref <seu-project-ref>
   npx supabase db push
   ```

4. Gere os tipos TypeScript a partir do schema real (substitui o arquivo
   escrito manualmente em `src/types/database.types.ts`):

   ```bash
   npx supabase gen types typescript --project-id <seu-project-ref> --schema public > src/types/database.types.ts
   ```

5. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000).

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
