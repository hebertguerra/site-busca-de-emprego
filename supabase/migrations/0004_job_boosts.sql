-- =========================================================================
-- Fase 3 (Monetizacao) - vaga em destaque avulsa via Mercado Pago.
-- Modelo escolhido: a empresa paga um valor unico para destacar uma vaga
-- especifica por um periodo (7/15/30 dias), sem assinatura recorrente.
-- =========================================================================

create table public.job_boosts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  tier text not null check (tier in ('7_dias', '15_dias', '30_dias')),
  duration_days int not null,
  price_cents int not null,
  status text not null default 'pendente'
    check (status in ('pendente', 'pago', 'falhou', 'expirado')),
  payment_provider text not null default 'mercadopago',
  payment_id text,
  external_reference uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index job_boosts_job_id_idx on public.job_boosts (job_id);
create index job_boosts_company_id_idx on public.job_boosts (company_id);
create unique index job_boosts_external_reference_idx on public.job_boosts (external_reference);

alter table public.job_boosts enable row level security;

create policy "empresa cria destaque para a propria vaga"
  on public.job_boosts for insert
  with check (
    company_id = auth.uid()
    and exists (select 1 from public.jobs j where j.id = job_id and j.company_id = auth.uid())
  );

create policy "empresa ve os proprios destaques"
  on public.job_boosts for select
  using (company_id = auth.uid());

-- Confirmacao de pagamento so pode vir do webhook do Mercado Pago (Server
-- Action com service-role), nunca do cliente - mesmo padrao usado em
-- enforce_job_status_transition (0001_init.sql) para aprovacao de vagas.
create policy "somente service_role confirma pagamento"
  on public.job_boosts for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- jobs.featured_until e a fonte de verdade de "esta em destaque agora":
-- is_featured = true and featured_until > now(). Evita depender de um cron
-- para "desligar" o destaque quando expira - e so uma condicao de leitura.
alter table public.jobs
  add column featured_until timestamptz;

comment on column public.jobs.featured_until is
  'Data ate quando a vaga esta em destaque pago. Vaga em destaque = is_featured and featured_until > now().';

create index jobs_featured_until_idx on public.jobs (featured_until);

-- Quando um job_boost e marcado como pago, propaga o destaque para a vaga
-- na mesma transacao.
create or replace function public.apply_job_boost_on_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'pago' and old.status is distinct from 'pago' then
    update public.jobs
    set is_featured = true,
        featured_until = greatest(coalesce(featured_until, now()), now()) + (new.duration_days || ' days')::interval
    where id = new.job_id;
  end if;
  return new;
end;
$$;

create trigger job_boosts_apply_on_payment
  after update on public.job_boosts
  for each row execute function public.apply_job_boost_on_payment();

-- Nao precisa de GRANT explicito aqui: "alter default privileges" em
-- 0001_init.sql ja cobre tabelas novas automaticamente para anon/authenticated.
-- RLS acima e que realmente restringe o acesso linha a linha.
