-- =========================================================================
-- Plataforma de Vagas - Sul do Piaui / Nordeste
-- Migration inicial: tabelas do MVP, RLS, triggers e buckets de storage.
-- RLS fica habilitado em todas as tabelas desde o primeiro momento
-- (deny-by-default: sem policy = sem acesso para anon/authenticated).
-- =========================================================================

-- -------------------------------------------------------------------------
-- Helpers
-- -------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -------------------------------------------------------------------------
-- profiles
-- -------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('candidato', 'empresa', 'admin')),
  full_name text,
  phone text,
  consent_lgpd_accepted_at timestamptz,
  consent_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create policy "usuario ve o proprio perfil"
  on public.profiles for select
  using (id = auth.uid());

create policy "usuario atualiza o proprio perfil"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Cria o profile automaticamente quando um usuario se registra no Supabase Auth.
-- role/full_name/phone chegam via options.data no supabase.auth.signUp().
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'candidato'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------------------
-- candidates (1:1 com profiles)
-- -------------------------------------------------------------------------
create table public.candidates (
  id uuid primary key references public.profiles (id) on delete cascade,
  photo_url text,
  headline text,
  bio text,
  city text,
  state text not null default 'PI',
  whatsapp text,
  resume_file_url text,
  resume_updated_at timestamptz,
  skills text[] not null default '{}',
  desired_contract_types text[] not null default '{}',
  profile_visibility boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Deliberadamente SEM campos de idade/data de nascimento/estado civil/raca:
-- esses dados nao devem ser coletados nem expostos a empresas (Lei 9.029/95).

alter table public.candidates enable row level security;

create trigger candidates_set_updated_at
  before update on public.candidates
  for each row execute function public.set_updated_at();

create policy "candidato gerencia o proprio perfil"
  on public.candidates for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- Nao existe busca publica/navegavel de candidatos no MVP: uma empresa so
-- enxerga um candidato depois que ele se candidata a uma vaga dela.
create policy "empresa ve candidatos que se candidataram as suas vagas"
  on public.candidates for select
  using (
    exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.candidate_id = candidates.id
        and j.company_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------------
-- candidate_experiences / candidate_education
-- -------------------------------------------------------------------------
create table public.candidate_experiences (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  company_name text not null,
  role_title text not null,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  description text,
  created_at timestamptz not null default now()
);

create index candidate_experiences_candidate_id_idx on public.candidate_experiences (candidate_id);

alter table public.candidate_experiences enable row level security;

create policy "candidato gerencia as proprias experiencias"
  on public.candidate_experiences for all
  using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

create policy "empresa ve experiencias de candidatos que se candidataram"
  on public.candidate_experiences for select
  using (
    exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.candidate_id = candidate_experiences.candidate_id
        and j.company_id = auth.uid()
    )
  );

create table public.candidate_education (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  institution text not null,
  degree text,
  field_of_study text,
  start_year smallint,
  end_year smallint,
  created_at timestamptz not null default now()
);

create index candidate_education_candidate_id_idx on public.candidate_education (candidate_id);

alter table public.candidate_education enable row level security;

create policy "candidato gerencia a propria formacao"
  on public.candidate_education for all
  using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

create policy "empresa ve formacao de candidatos que se candidataram"
  on public.candidate_education for select
  using (
    exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.candidate_id = candidate_education.candidate_id
        and j.company_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------------
-- companies (1:1 com profiles)
-- -------------------------------------------------------------------------
create table public.companies (
  id uuid primary key references public.profiles (id) on delete cascade,
  trade_name text not null,
  legal_name text,
  cnpj text not null unique,
  logo_url text,
  description text,
  website text,
  city text,
  state text,
  verified boolean not null default false,
  plan_tier text not null default 'free', -- hook para monetizacao (Fase 2), nao usado no MVP
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.companies enable row level security;

create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- Perfil de empresa e publico (CNPJ/razao social ja sao dados publicos no Brasil).
create policy "perfis de empresa sao publicos"
  on public.companies for select
  using (true);

create policy "empresa cria o proprio perfil"
  on public.companies for insert
  with check (id = auth.uid());

create policy "empresa atualiza o proprio perfil"
  on public.companies for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- -------------------------------------------------------------------------
-- jobs
-- -------------------------------------------------------------------------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  description text not null,
  requirements text,
  benefits text,
  contract_type text not null check (contract_type in ('CLT', 'PJ', 'estagio', 'temporario', 'freelance')),
  workplace_type text not null check (workplace_type in ('presencial', 'remoto', 'hibrido')),
  city text,
  state text not null default 'PI',
  salary_min numeric,
  salary_max numeric,
  salary_is_public boolean not null default false,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'pendente_aprovacao', 'publicada', 'pausada', 'encerrada', 'rejeitada')),
  rejection_reason text,
  is_featured boolean not null default false, -- hook para anuncios pagos (Fase 2)
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_company_id_idx on public.jobs (company_id);
create index jobs_status_idx on public.jobs (status);
create index jobs_city_idx on public.jobs (city);

alter table public.jobs enable row level security;

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

create policy "vagas publicadas sao publicas"
  on public.jobs for select
  using (status = 'publicada' and (expires_at is null or expires_at > now()));

create policy "empresa ve as proprias vagas em qualquer status"
  on public.jobs for select
  using (company_id = auth.uid());

create policy "empresa cria vagas"
  on public.jobs for insert
  with check (company_id = auth.uid());

create policy "empresa atualiza as proprias vagas"
  on public.jobs for update
  using (company_id = auth.uid())
  with check (company_id = auth.uid());

-- Empresas podem editar/pausar/encerrar suas vagas, mas NAO podem se
-- autoaprovar: a transicao para 'publicada' ou 'rejeitada' so acontece via
-- Server Action de admin usando a service-role key (auth.role() = 'service_role').
create or replace function public.enforce_job_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status
     and new.status in ('publicada', 'rejeitada')
     and auth.role() <> 'service_role' then
    raise exception 'Somente um administrador pode publicar ou rejeitar uma vaga.';
  end if;
  return new;
end;
$$;

create trigger jobs_enforce_status_transition
  before update on public.jobs
  for each row execute function public.enforce_job_status_transition();

-- -------------------------------------------------------------------------
-- applications
-- -------------------------------------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  status text not null default 'enviada'
    check (status in ('enviada', 'em_analise', 'entrevista', 'aprovado', 'rejeitado', 'desistiu')),
  cover_note text,
  resume_snapshot_url text,
  applied_at timestamptz not null default now(),
  unique (job_id, candidate_id)
);

create index applications_job_id_idx on public.applications (job_id);
create index applications_candidate_id_idx on public.applications (candidate_id);

alter table public.applications enable row level security;

create policy "candidato cria candidatura"
  on public.applications for insert
  with check (candidate_id = auth.uid());

create policy "candidato ve as proprias candidaturas"
  on public.applications for select
  using (candidate_id = auth.uid());

create policy "empresa ve candidaturas das proprias vagas"
  on public.applications for select
  using (
    exists (
      select 1 from public.jobs j
      where j.id = applications.job_id and j.company_id = auth.uid()
    )
  );

create policy "empresa atualiza status de candidaturas das proprias vagas"
  on public.applications for update
  using (
    exists (
      select 1 from public.jobs j
      where j.id = applications.job_id and j.company_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.jobs j
      where j.id = applications.job_id and j.company_id = auth.uid()
    )
  );

-- Candidato so pode alterar a propria candidatura para 'desistiu' (sem DELETE fisico).
create policy "candidato pode desistir da candidatura"
  on public.applications for update
  using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid() and status = 'desistiu');

-- -------------------------------------------------------------------------
-- application_status_history (trilha de auditoria)
-- -------------------------------------------------------------------------
create table public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles (id),
  changed_at timestamptz not null default now()
);

create index application_status_history_application_id_idx
  on public.application_status_history (application_id);

alter table public.application_status_history enable row level security;

create policy "candidato ve o historico das proprias candidaturas"
  on public.application_status_history for select
  using (
    exists (
      select 1 from public.applications a
      where a.id = application_status_history.application_id
        and a.candidate_id = auth.uid()
    )
  );

create policy "empresa ve o historico das candidaturas de suas vagas"
  on public.application_status_history for select
  using (
    exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.id = application_status_history.application_id
        and j.company_id = auth.uid()
    )
  );

create or replace function public.log_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.application_status_history (application_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger applications_log_status_change
  after update on public.applications
  for each row execute function public.log_application_status_change();

-- -------------------------------------------------------------------------
-- data_access_log (accountability LGPD)
-- -------------------------------------------------------------------------
create table public.data_access_log (
  id uuid primary key default gen_random_uuid(),
  accessed_by uuid not null references public.profiles (id),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  accessed_at timestamptz not null default now(),
  context text
);

create index data_access_log_candidate_id_idx on public.data_access_log (candidate_id);

alter table public.data_access_log enable row level security;

-- Inserido pela Server Action toda vez que uma empresa abre o perfil
-- completo de um candidato (ex: /empresa/vagas/[id]/candidatos).
create policy "empresa registra o proprio acesso a um perfil"
  on public.data_access_log for insert
  with check (accessed_by = auth.uid());

create policy "candidato ve quem acessou o proprio perfil"
  on public.data_access_log for select
  using (candidate_id = auth.uid());

-- -------------------------------------------------------------------------
-- reports (denuncias)
-- -------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id),
  job_id uuid references public.jobs (id) on delete set null,
  company_id uuid references public.companies (id) on delete set null,
  reason text not null,
  description text,
  status text not null default 'aberto'
    check (status in ('aberto', 'em_analise', 'resolvido', 'arquivado')),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

-- Qualquer pessoa (logada ou anonima) pode denunciar uma vaga/empresa.
-- Leitura restrita ao admin via service-role (sem policy de select aqui).
create policy "qualquer pessoa pode denunciar uma vaga ou empresa"
  on public.reports for insert
  with check (true);

-- -------------------------------------------------------------------------
-- consent_log (consentimento LGPD)
-- -------------------------------------------------------------------------
create table public.consent_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  consent_type text not null check (consent_type in ('cadastro', 'foto', 'curriculo', 'cookies')),
  accepted boolean not null,
  version text not null,
  ip_address text,
  created_at timestamptz not null default now()
);

create index consent_log_profile_id_idx on public.consent_log (profile_id);

alter table public.consent_log enable row level security;

create policy "usuario registra o proprio consentimento"
  on public.consent_log for insert
  with check (profile_id = auth.uid());

create policy "usuario ve o proprio historico de consentimento"
  on public.consent_log for select
  using (profile_id = auth.uid());

-- =========================================================================
-- Storage: buckets e policies
-- =========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('resumes', 'resumes', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

-- Convencao de path: {user_id}/{arquivo}. (storage.foldername(name))[1] = primeiro nivel do path.

create policy "avatares tem leitura publica"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "dono gerencia o proprio avatar (insert)"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "dono gerencia o proprio avatar (update)"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "dono gerencia o proprio avatar (delete)"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Bucket 'resumes' e privado: so o candidato dono acessa via client normal.
-- Empresas recebem o curriculo por signed URL, emitida por uma Server Action
-- que usa o cliente admin (service-role) depois de reconfirmar autorizacao
-- (mesma regra da policy de applications) - por isso nao ha policy de select
-- publica ou por empresa aqui.
create policy "candidato gerencia o proprio curriculo"
  on storage.objects for all
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
