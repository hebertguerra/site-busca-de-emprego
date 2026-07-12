-- =========================================================================
-- Fase 2 (Qualificacao profissional) - reconhecer experiencia informal.
-- Motivado pela pesquisa em docs/pesquisa-mercado-sul-piaui.md: ~60% da
-- populacao ocupada no Piaui esta na informalidade. O formulario de
-- experiencia ja aceita texto livre (nao exige CTPS), mas sem esta coluna
-- a empresa nao tem como distinguir/valorizar isso na leitura do perfil.
-- =========================================================================

alter table public.candidate_experiences
  add column employment_type text not null default 'formal'
    check (employment_type in ('formal', 'informal', 'autonomo'));

comment on column public.candidate_experiences.employment_type is
  'Tipo de vinculo dessa experiencia: formal (CLT/registrado), informal (bico, sem registro) ou autonomo (MEI/conta propria). Reconhece trabalho informal como experiencia real, nao so historico em CTPS.';
