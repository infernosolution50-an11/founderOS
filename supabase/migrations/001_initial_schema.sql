create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  plan text default 'free',
  created_at timestamptz default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  name text not null default 'Untitled Opportunity',
  opportunity_score integer default 0,
  urgency integer default 5,
  pain integer default 5,
  frequency integer default 5,
  willingness_to_pay integer default 5,
  domain_expertise integer default 3,
  network_access integer default 3,
  unfair_insight integer default 3,
  timing_signals text[] default '{}',
  business_model text default '',
  acv text default '',
  tam_m numeric default 0,
  sam_m numeric default 0,
  som_m numeric default 0,
  growth_rate_pct integer default 20,
  competitors jsonb default '[]'::jsonb,
  moat_network integer default 5,
  moat_data integer default 4,
  moat_switching integer default 6,
  moat_scale integer default 3,
  moat_brand integer default 5,
  moat_ip integer default 2,
  phase text default '0→1',
  kpi_primary text default '',
  kpi_revenue text default '',
  kpi_learning text default '',
  conviction_stars integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  text text not null,
  category text not null check (category in ('research','product','sales','ops')),
  phase text default '0→1',
  done boolean default false,
  priority text default 'medium' check (priority in ('low','medium','high')),
  due_date date,
  created_at timestamptz default now()
);

create table if not exists public.ember_messages (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  agent_type text default 'core' check (agent_type in ('core','market','risk','doc_synthesizer','execution','moat')),
  created_at timestamptz default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  extracted_text text,
  file_type text,
  file_size_bytes integer,
  created_at timestamptz default now()
);

create table if not exists public.opportunity_notes (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete cascade unique,
  user_id uuid references public.users(id) on delete cascade,
  thesis text default '',
  customer_notes text default '',
  open_questions text default '',
  kill_conditions text default '',
  moat_insight text default '',
  updated_at timestamptz default now()
);

create table if not exists public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  risk_label text not null,
  heat_level text default 'medium' check (heat_level in ('low','medium','high')),
  mitigation_note text default '',
  created_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists opportunities_set_updated_at on public.opportunities;
create trigger opportunities_set_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

drop trigger if exists opportunity_notes_set_updated_at on public.opportunity_notes;
create trigger opportunity_notes_set_updated_at
before update on public.opportunity_notes
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.opportunities enable row level security;
alter table public.tasks enable row level security;
alter table public.ember_messages enable row level security;
alter table public.documents enable row level security;
alter table public.opportunity_notes enable row level security;
alter table public.risk_assessments enable row level security;

create policy "Users can select own profile" on public.users
  for select to authenticated using (id = auth.uid());
create policy "Users can insert own profile" on public.users
  for insert to authenticated with check (id = auth.uid());
create policy "Users can update own profile" on public.users
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Users can delete own profile" on public.users
  for delete to authenticated using (id = auth.uid());

create policy "Users can select own opportunities" on public.opportunities
  for select to authenticated using (user_id = auth.uid());
create policy "Users can insert own opportunities" on public.opportunities
  for insert to authenticated with check (user_id = auth.uid());
create policy "Users can update own opportunities" on public.opportunities
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can delete own opportunities" on public.opportunities
  for delete to authenticated using (user_id = auth.uid());

create policy "Users can select own tasks" on public.tasks
  for select to authenticated using (user_id = auth.uid());
create policy "Users can insert own tasks" on public.tasks
  for insert to authenticated with check (user_id = auth.uid());
create policy "Users can update own tasks" on public.tasks
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can delete own tasks" on public.tasks
  for delete to authenticated using (user_id = auth.uid());

create policy "Users can select own Ember messages" on public.ember_messages
  for select to authenticated using (user_id = auth.uid());
create policy "Users can insert own Ember messages" on public.ember_messages
  for insert to authenticated with check (user_id = auth.uid());
create policy "Users can update own Ember messages" on public.ember_messages
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can delete own Ember messages" on public.ember_messages
  for delete to authenticated using (user_id = auth.uid());

create policy "Users can select own documents" on public.documents
  for select to authenticated using (user_id = auth.uid());
create policy "Users can insert own documents" on public.documents
  for insert to authenticated with check (user_id = auth.uid());
create policy "Users can update own documents" on public.documents
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can delete own documents" on public.documents
  for delete to authenticated using (user_id = auth.uid());

create policy "Users can select own opportunity notes" on public.opportunity_notes
  for select to authenticated using (user_id = auth.uid());
create policy "Users can insert own opportunity notes" on public.opportunity_notes
  for insert to authenticated with check (user_id = auth.uid());
create policy "Users can update own opportunity notes" on public.opportunity_notes
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can delete own opportunity notes" on public.opportunity_notes
  for delete to authenticated using (user_id = auth.uid());

create policy "Users can select own risk assessments" on public.risk_assessments
  for select to authenticated using (user_id = auth.uid());
create policy "Users can insert own risk assessments" on public.risk_assessments
  for insert to authenticated with check (user_id = auth.uid());
create policy "Users can update own risk assessments" on public.risk_assessments
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can delete own risk assessments" on public.risk_assessments
  for delete to authenticated using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update set public = false;

create policy "Users can read own document files" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload own document files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own document files" on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own document files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
