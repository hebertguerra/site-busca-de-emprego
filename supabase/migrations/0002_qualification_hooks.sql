-- =========================================================================
-- Fase 2 (Qualificacao profissional) - hooks de schema.
-- Motivado pela pesquisa em docs/pesquisa-mercado-sul-piaui.md: o problema
-- local nao e falta de vaga, e descompasso entre a vaga e a qualificacao do
-- candidato. Estas colunas apenas reservam espaco para a Fase 2 (trilhas de
-- qualificacao atreladas a vaga, matching por skill, filtro por vocacao
-- economica regional) sem construir a funcionalidade completa agora.
-- =========================================================================

alter table public.jobs
  add column economic_sector text
    check (economic_sector in ('agronegocio', 'turismo', 'comercio_servicos', 'industria_construcao', 'outro')),
  add column required_skills text[] not null default '{}',
  add column suggested_qualification text;

comment on column public.jobs.economic_sector is
  'Vocacao economica regional da vaga (ex: agronegocio/MATOPIBA, turismo/Serra da Capivara). Usado para filtro, curado manualmente no MVP.';
comment on column public.jobs.required_skills is
  'Skills exigidas pela vaga, no mesmo formato de candidates.skills. Habilita matching skill-a-skill na Fase 4, sem logica de matching ainda.';
comment on column public.jobs.suggested_qualification is
  'Nota curada manualmente pelo admin/empresa apontando um curso gratuito (SENAC/SENAI/Mais Formacao Mais Renda) que fecha uma lacuna de qualificacao comum para esta vaga.';

create index jobs_economic_sector_idx on public.jobs (economic_sector);
