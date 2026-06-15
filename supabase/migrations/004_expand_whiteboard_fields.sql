alter table public.opportunities
add column if not exists problem_statement text default '',
add column if not exists target_customer_persona text default '',
add column if not exists customer_discovery_count integer default 0,
add column if not exists key_insight text default '',
add column if not exists falsifiable_hypothesis text default '',
add column if not exists market_type text default 'existing_market',
add column if not exists pricing_model text default '',
add column if not exists moat_summary text default '',
add column if not exists time_to_copy text default '1_year',
add column if not exists sprint_goal_90_day text default '',
add column if not exists runway_months numeric default 0,
add column if not exists next_fundraise_trigger text default '',
add column if not exists prior_startup_experience text default 'none',
add column if not exists co_founder_status text default 'solo',
add column if not exists capital_access text default 'bootstrapped',
add column if not exists founder_statement text default '',
add column if not exists lois_verbal_commitments integer default 0,
add column if not exists waitlist_signups integer default 0,
add column if not exists pilot_customers integer default 0,
add column if not exists revenue_to_date numeric default 0,
add column if not exists last_customer_conversation_date date,
add column if not exists signal_notes text default '';

do $$
begin
  alter table public.opportunities drop constraint if exists opportunities_market_type_check;
  alter table public.opportunities add constraint opportunities_market_type_check
    check (market_type in ('new_market','existing_market','resegmented_market','clone_market'));

  alter table public.opportunities drop constraint if exists opportunities_time_to_copy_check;
  alter table public.opportunities add constraint opportunities_time_to_copy_check
    check (time_to_copy in ('3_months','6_months','1_year','3_plus_years'));

  alter table public.opportunities drop constraint if exists opportunities_prior_startup_experience_check;
  alter table public.opportunities add constraint opportunities_prior_startup_experience_check
    check (prior_startup_experience in ('none','one_exit','multiple_exits','currently_operating'));

  alter table public.opportunities drop constraint if exists opportunities_co_founder_status_check;
  alter table public.opportunities add constraint opportunities_co_founder_status_check
    check (co_founder_status in ('solo','co_founder_found','team_assembled'));

  alter table public.opportunities drop constraint if exists opportunities_capital_access_check;
  alter table public.opportunities add constraint opportunities_capital_access_check
    check (capital_access in ('bootstrapped','friends_family','seeking_seed','funded'));
end $$;

alter table public.risk_assessments
add column if not exists category text default 'market',
add column if not exists likelihood text default 'high',
add column if not exists impact text default 'high',
add column if not exists owner text default '',
add column if not exists status text default 'open';

do $$
begin
  alter table public.risk_assessments drop constraint if exists risk_assessments_category_check;
  alter table public.risk_assessments add constraint risk_assessments_category_check
    check (category in ('market','technical','regulatory','team','financial','timing'));

  alter table public.risk_assessments drop constraint if exists risk_assessments_likelihood_check;
  alter table public.risk_assessments add constraint risk_assessments_likelihood_check
    check (likelihood in ('low','high'));

  alter table public.risk_assessments drop constraint if exists risk_assessments_impact_check;
  alter table public.risk_assessments add constraint risk_assessments_impact_check
    check (impact in ('low','high'));

  alter table public.risk_assessments drop constraint if exists risk_assessments_status_check;
  alter table public.risk_assessments add constraint risk_assessments_status_check
    check (status in ('open','in_progress','mitigated'));
end $$;

do $$
begin
  alter table public.tasks drop constraint if exists tasks_category_check;
  alter table public.tasks add constraint tasks_category_check
    check (category in ('research','product','sales','ops','hiring'));
end $$;

alter table public.opportunity_notes
add column if not exists decision_log jsonb default '[]'::jsonb;

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  target_date date,
  done boolean default false,
  created_at timestamptz default now()
);

create index if not exists milestones_user_id_idx on public.milestones(user_id);
create index if not exists milestones_opportunity_id_idx on public.milestones(opportunity_id);

alter table public.milestones enable row level security;

drop policy if exists "Users can select own milestones" on public.milestones;
create policy "Users can select own milestones" on public.milestones
  for select to authenticated using (
    user_id = auth.uid()
    or exists (
      select 1 from public.opportunities
      where opportunities.id = milestones.opportunity_id
      and opportunities.is_demo = true
    )
  );

drop policy if exists "Users can insert own milestones" on public.milestones;
create policy "Users can insert own milestones" on public.milestones
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.opportunities
      where opportunities.id = milestones.opportunity_id
      and opportunities.user_id = auth.uid()
      and opportunities.is_demo = false
    )
  );

drop policy if exists "Users can update own milestones" on public.milestones;
create policy "Users can update own milestones" on public.milestones
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own milestones" on public.milestones;
create policy "Users can delete own milestones" on public.milestones
  for delete to authenticated using (user_id = auth.uid());

update public.opportunities
set
  problem_statement = case id
    when '11111111-1111-4111-8111-111111111111' then 'Finance teams lose budget control because procurement requests start in Slack, email, and spreadsheets before anyone has approval context.'
    when '22222222-2222-4222-8222-222222222222' then 'Early founders and emerging investors waste time finding trusted, relevant dealflow and warm context.'
    else 'A broad AI productivity assistant has no sharp problem statement yet; the founder must narrow to a painful recurring workflow.'
  end,
  target_customer_persona = case id
    when '11111111-1111-4111-8111-111111111111' then 'CFOs, controllers, and procurement leads at 200-1,000 person companies with SaaS sprawl.'
    when '22222222-2222-4222-8222-222222222222' then 'Founder-operators and micro-fund scouts who already exchange warm intros in private communities.'
    else 'Knowledge workers who pay for productivity tools, narrowed further by discovery.'
  end,
  customer_discovery_count = case id when '11111111-1111-4111-8111-111111111111' then 14 when '22222222-2222-4222-8222-222222222222' then 9 else 3 end,
  key_insight = case id
    when '11111111-1111-4111-8111-111111111111' then 'Procurement pain starts before the formal procurement suite, where budget context is absent.'
    when '22222222-2222-4222-8222-222222222222' then 'Trust density matters more than raw deal volume.'
    else 'Users describe convenience, not urgent pain.'
  end,
  falsifiable_hypothesis = case id
    when '11111111-1111-4111-8111-111111111111' then 'If finance leaders will not commit to paid pilots after seeing a Slack-native workflow, the wedge is too weak.'
    when '22222222-2222-4222-8222-222222222222' then 'If curated cohorts do not produce repeat intros within 30 days, the network lacks utility.'
    else 'If no narrow ICP prepays for a specialized workflow, the product should be killed.'
  end,
  market_type = case id when '22222222-2222-4222-8222-222222222222' then 'resegmented_market' else 'existing_market' end,
  pricing_model = case id
    when '11111111-1111-4111-8111-111111111111' then 'Monthly SaaS plus implementation for paid design partners.'
    when '22222222-2222-4222-8222-222222222222' then 'Paid membership with potential success fees for qualified investor matches.'
    else 'Prosumer subscription, still unvalidated.'
  end,
  moat_summary = case id
    when '11111111-1111-4111-8111-111111111111' then 'The long-term moat is proprietary approval, vendor-risk, and budget workflow data accumulated across finance teams.'
    when '22222222-2222-4222-8222-222222222222' then 'The moat is a reputation graph built from intro outcomes and trusted community behavior.'
    else 'No credible moat exists until the product owns a narrow workflow or proprietary dataset.'
  end,
  time_to_copy = case id when '11111111-1111-4111-8111-111111111111' then '1_year' when '22222222-2222-4222-8222-222222222222' then '6_months' else '3_months' end,
  sprint_goal_90_day = case id
    when '11111111-1111-4111-8111-111111111111' then 'Convert three finance teams into paid Slack-native procurement pilots.'
    when '22222222-2222-4222-8222-222222222222' then 'Run two curated cohorts and prove repeat intro liquidity.'
    else 'Find one painful niche workflow and secure ten preorders.'
  end,
  runway_months = case id when '11111111-1111-4111-8111-111111111111' then 9 when '22222222-2222-4222-8222-222222222222' then 6 else 4 end,
  next_fundraise_trigger = case id
    when '11111111-1111-4111-8111-111111111111' then 'Three paid pilots with weekly active finance users.'
    when '22222222-2222-4222-8222-222222222222' then 'Repeat introductions and 50 paid founding members.'
    else 'A narrow paid wedge with evidence incumbents cannot copy instantly.'
  end,
  prior_startup_experience = case id when '22222222-2222-4222-8222-222222222222' then 'currently_operating' else 'none' end,
  co_founder_status = case id when '11111111-1111-4111-8111-111111111111' then 'co_founder_found' else 'solo' end,
  capital_access = case id when '11111111-1111-4111-8111-111111111111' then 'seeking_seed' else 'bootstrapped' end,
  founder_statement = case id
    when '11111111-1111-4111-8111-111111111111' then 'We have direct finance-ops experience and access to CFO design partners.'
    when '22222222-2222-4222-8222-222222222222' then 'We already sit inside high-trust founder and investor communities.'
    else 'We are not yet the obvious team until a narrow workflow edge appears.'
  end,
  lois_verbal_commitments = case id when '11111111-1111-4111-8111-111111111111' then 4 when '22222222-2222-4222-8222-222222222222' then 2 else 0 end,
  waitlist_signups = case id when '11111111-1111-4111-8111-111111111111' then 37 when '22222222-2222-4222-8222-222222222222' then 58 else 8 end,
  pilot_customers = case id when '11111111-1111-4111-8111-111111111111' then 2 else 0 end,
  revenue_to_date = case id when '11111111-1111-4111-8111-111111111111' then 3000 else 0 end,
  last_customer_conversation_date = current_date - case id when '33333333-3333-4333-8333-333333333333' then 21 else 2 end,
  signal_notes = case id
    when '11111111-1111-4111-8111-111111111111' then 'Two CFOs asked for paid pilots if the Slack workflow integrates with approval data.'
    when '22222222-2222-4222-8222-222222222222' then 'Warm intros are valuable, but members are unsure whether they pay before liquidity exists.'
    else 'Interest is generic; no one has committed budget.'
  end,
  competitors = case id
    when '11111111-1111-4111-8111-111111111111' then '[{"name":"Zip","threat":"high","differentiator":"Slack-native intake before formal procurement","estimated_arr":"$100M+"},{"name":"Coupa","threat":"medium","differentiator":"Faster mid-market workflow with lower implementation burden","estimated_arr":"$1B+"}]'::jsonb
    when '22222222-2222-4222-8222-222222222222' then '[{"name":"AngelList","threat":"high","differentiator":"Curated founder-operator trust graph","estimated_arr":"$100M+"},{"name":"WhatsApp groups","threat":"medium","differentiator":"Structured reputation and outcome tracking","estimated_arr":"Unknown"}]'::jsonb
    else '[{"name":"ChatGPT","threat":"high","differentiator":"None yet","estimated_arr":"$1B+"},{"name":"Notion AI","threat":"high","differentiator":"None yet","estimated_arr":"$100M+"}]'::jsonb
  end
where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333'
);

update public.opportunity_notes
set decision_log = jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid(), 'body', 'Initial demo assumptions seeded for whiteboard expansion.', 'created_at', now())
)
where opportunity_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333'
);

update public.risk_assessments
set
  category = case
    when risk_label ilike '%incumbent%' or risk_label ilike '%differentiation%' then 'market'
    when risk_label ilike '%buyer%' then 'team'
    when risk_label ilike '%cold start%' then 'market'
    when risk_label ilike '%quality%' then 'team'
    else 'market'
  end,
  likelihood = case heat_level when 'low' then 'low' else 'high' end,
  impact = case heat_level when 'low' then 'low' else 'high' end,
  owner = 'Founder',
  status = 'open';

delete from public.milestones where opportunity_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333'
);

insert into public.milestones (opportunity_id, user_id, title, target_date, done) values
('11111111-1111-4111-8111-111111111111', null, 'Complete 15 CFO discovery calls', current_date + interval '14 days', false),
('11111111-1111-4111-8111-111111111111', null, 'Secure three paid procurement pilots', current_date + interval '45 days', false),
('22222222-2222-4222-8222-222222222222', null, 'Launch first curated cohort', current_date + interval '21 days', false),
('22222222-2222-4222-8222-222222222222', null, 'Reach 50 paid founding members', current_date + interval '60 days', false),
('33333333-3333-4333-8333-333333333333', null, 'Choose one narrow workflow ICP', current_date + interval '10 days', false),
('33333333-3333-4333-8333-333333333333', null, 'Collect ten niche preorders', current_date + interval '30 days', false);

