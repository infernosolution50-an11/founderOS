alter table public.opportunities
add column if not exists is_demo boolean not null default false;

create index if not exists opportunities_is_demo_idx on public.opportunities(is_demo) where is_demo = true;

drop policy if exists "Users can select own opportunities" on public.opportunities;
create policy "Users can select own opportunities" on public.opportunities
  for select to authenticated using (user_id = auth.uid() or is_demo = true);

drop policy if exists "Users can insert own opportunities" on public.opportunities;
create policy "Users can insert own opportunities" on public.opportunities
  for insert to authenticated with check (user_id = auth.uid() and is_demo = false);

drop policy if exists "Users can update own opportunities" on public.opportunities;
create policy "Users can update own opportunities" on public.opportunities
  for update to authenticated using (user_id = auth.uid() and is_demo = false) with check (user_id = auth.uid() and is_demo = false);

drop policy if exists "Users can delete own opportunities" on public.opportunities;
create policy "Users can delete own opportunities" on public.opportunities
  for delete to authenticated using (user_id = auth.uid() and is_demo = false);

drop policy if exists "Users can select own tasks" on public.tasks;
create policy "Users can select own tasks" on public.tasks
  for select to authenticated using (
    user_id = auth.uid()
    or exists (
      select 1 from public.opportunities
      where opportunities.id = tasks.opportunity_id
      and opportunities.is_demo = true
    )
  );

drop policy if exists "Users can select own Ember messages" on public.ember_messages;
create policy "Users can select own Ember messages" on public.ember_messages
  for select to authenticated using (
    user_id = auth.uid()
    or exists (
      select 1 from public.opportunities
      where opportunities.id = ember_messages.opportunity_id
      and opportunities.is_demo = true
    )
  );

drop policy if exists "Users can select own documents" on public.documents;
create policy "Users can select own documents" on public.documents
  for select to authenticated using (
    user_id = auth.uid()
    or exists (
      select 1 from public.opportunities
      where opportunities.id = documents.opportunity_id
      and opportunities.is_demo = true
    )
  );

drop policy if exists "Users can select own opportunity notes" on public.opportunity_notes;
create policy "Users can select own opportunity notes" on public.opportunity_notes
  for select to authenticated using (
    user_id = auth.uid()
    or exists (
      select 1 from public.opportunities
      where opportunities.id = opportunity_notes.opportunity_id
      and opportunities.is_demo = true
    )
  );

drop policy if exists "Users can select own risk assessments" on public.risk_assessments;
create policy "Users can select own risk assessments" on public.risk_assessments
  for select to authenticated using (
    user_id = auth.uid()
    or exists (
      select 1 from public.opportunities
      where opportunities.id = risk_assessments.opportunity_id
      and opportunities.is_demo = true
    )
  );

insert into public.opportunities (
  id, user_id, is_demo, name, opportunity_score, urgency, pain, frequency, willingness_to_pay,
  domain_expertise, network_access, unfair_insight, timing_signals, business_model, acv,
  tam_m, sam_m, som_m, growth_rate_pct, competitors, moat_network, moat_data, moat_switching,
  moat_scale, moat_brand, moat_ip, phase, kpi_primary, kpi_revenue, kpi_learning, conviction_stars
) values
(
  '11111111-1111-4111-8111-111111111111', null, true,
  'AI procurement copilot for mid-market finance teams', 78, 8, 8, 7, 8,
  5, 5, 6, array['New technology', 'Budget pressure', 'Workflow fragmentation'], 'Vertical SaaS', '$18k/year',
  2200, 360, 42, 32,
  '[{"name":"Zip","threat":"high"},{"name":"Coupa","threat":"medium"},{"name":"Manual spreadsheet workflow","threat":"high"}]'::jsonb,
  5, 8, 7, 4, 4, 3, '0→1',
  '10 finance leader discovery calls', '3 paid pilots at $1.5k/month', 'Validate whether procurement intake is owned by finance or ops', 4
),
(
  '22222222-2222-4222-8222-222222222222', null, true,
  'Founder-community dealflow network', 56, 6, 7, 6, 5,
  7, 8, 5, array['Creator-led trust', 'Capital moving online'], 'Community marketplace', '$49/month plus carry share',
  850, 120, 18, 24,
  '[{"name":"AngelList","threat":"high"},{"name":"WhatsApp groups","threat":"medium"},{"name":"LinkedIn cold outreach","threat":"medium"}]'::jsonb,
  7, 5, 4, 5, 6, 2, '0→1',
  'Build 2 curated founder/investor cohorts', '20 paid founding members', 'Learn if trust density beats existing private networks', 3
),
(
  '33333333-3333-4333-8333-333333333333', null, true,
  'Broad AI productivity assistant for everyone', 34, 4, 5, 5, 3,
  3, 3, 2, array['AI adoption'], 'Prosumer subscription', '$12/month',
  5000, 900, 20, 18,
  '[{"name":"ChatGPT","threat":"high"},{"name":"Notion AI","threat":"high"},{"name":"Microsoft Copilot","threat":"high"}]'::jsonb,
  2, 3, 2, 3, 2, 1, '0→1',
  'Find one painful niche workflow', '10 preorders from a narrow ICP', 'Prove users need a specialized product, not a general assistant', 1
)
on conflict (id) do update set
  user_id = excluded.user_id,
  is_demo = excluded.is_demo,
  name = excluded.name,
  opportunity_score = excluded.opportunity_score,
  urgency = excluded.urgency,
  pain = excluded.pain,
  frequency = excluded.frequency,
  willingness_to_pay = excluded.willingness_to_pay,
  domain_expertise = excluded.domain_expertise,
  network_access = excluded.network_access,
  unfair_insight = excluded.unfair_insight,
  timing_signals = excluded.timing_signals,
  business_model = excluded.business_model,
  acv = excluded.acv,
  tam_m = excluded.tam_m,
  sam_m = excluded.sam_m,
  som_m = excluded.som_m,
  growth_rate_pct = excluded.growth_rate_pct,
  competitors = excluded.competitors,
  moat_network = excluded.moat_network,
  moat_data = excluded.moat_data,
  moat_switching = excluded.moat_switching,
  moat_scale = excluded.moat_scale,
  moat_brand = excluded.moat_brand,
  moat_ip = excluded.moat_ip,
  phase = excluded.phase,
  kpi_primary = excluded.kpi_primary,
  kpi_revenue = excluded.kpi_revenue,
  kpi_learning = excluded.kpi_learning,
  conviction_stars = excluded.conviction_stars;

insert into public.opportunity_notes (id, opportunity_id, user_id, thesis, customer_notes, open_questions, kill_conditions, moat_insight) values
('11111111-aaaa-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', null,
 'Finance teams are becoming the operational control point for software spend, but procurement intake is still fragmented across Slack, email, spreadsheets, and legacy suites.',
 'Target CFOs, controllers, procurement leads, and RevOps leaders at 200-1,000 person companies with fast SaaS sprawl and budget pressure.',
 'Who owns the intake workflow daily? Which system must integrate on day one? What approval step creates measurable cycle-time pain?',
 'Kill this if buyers refuse paid pilots, if ownership is too fragmented, or if incumbents already solve intake well enough for mid-market teams.',
 'The strongest defensibility angle is proprietary approval and vendor-risk data collected across repeated procurement workflows.'),
('22222222-aaaa-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', null,
 'Founders and emerging angels trust curated peer context more than cold platforms, but density and moderation decide whether a marketplace has repeat value.',
 'Early users should be founder-operators already sharing intros in private groups, plus micro-fund scouts looking for pre-seed signal.',
 'Will members pay before dealflow liquidity exists? Can the community maintain quality without becoming a noisy Slack clone?',
 'Kill this if curated cohorts do not create repeat intros within 30 days or if trust requires founder-led manual curation forever.',
 'Defensibility depends on reputation graphs and proprietary interaction history, not generic profiles.'),
('33333333-aaaa-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', null,
 'A horizontal AI assistant has a huge market but weak wedge, low willingness to switch, and direct competition from bundled incumbents.',
 'Interview users who pay for multiple productivity tools and force them to name one recurring workflow that generic AI still fails to solve.',
 'Which niche job has urgent daily pain? What data or workflow access creates specialization that ChatGPT cannot copy instantly?',
 'Kill this if users describe convenience rather than painful workflow failure, or if every feature is a prompt away in existing tools.',
 'A defensible version needs a narrow proprietary workflow dataset or system-of-record integration.')
on conflict (opportunity_id) do update set
  user_id = excluded.user_id,
  thesis = excluded.thesis,
  customer_notes = excluded.customer_notes,
  open_questions = excluded.open_questions,
  kill_conditions = excluded.kill_conditions,
  moat_insight = excluded.moat_insight;

delete from public.tasks where opportunity_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333'
);

insert into public.tasks (opportunity_id, user_id, text, category, phase, done, priority, due_date) values
('11111111-1111-4111-8111-111111111111', null, 'Interview 10 finance leaders about procurement intake pain', 'research', '0→1', true, 'high', current_date + interval '3 days'),
('11111111-1111-4111-8111-111111111111', null, 'Mock a Slack-to-approval workflow prototype', 'product', '0→1', false, 'medium', current_date + interval '7 days'),
('11111111-1111-4111-8111-111111111111', null, 'Pitch 3 paid pilot design partners', 'sales', '0→1', false, 'high', current_date + interval '10 days'),
('22222222-2222-4222-8222-222222222222', null, 'Run concierge matching for 20 founders and 10 angels', 'ops', '0→1', true, 'high', current_date + interval '5 days'),
('22222222-2222-4222-8222-222222222222', null, 'Test paid founding membership with 30 warm leads', 'sales', '0→1', false, 'high', current_date + interval '9 days'),
('22222222-2222-4222-8222-222222222222', null, 'Design reputation graph v0 from intro outcomes', 'product', '0→1', false, 'medium', current_date + interval '14 days'),
('33333333-3333-4333-8333-333333333333', null, 'Narrow to one painful workflow before building', 'research', '0→1', false, 'high', current_date + interval '2 days'),
('33333333-3333-4333-8333-333333333333', null, 'Run fake-door pricing for three niche ICPs', 'sales', '0→1', false, 'medium', current_date + interval '8 days'),
('33333333-3333-4333-8333-333333333333', null, 'Identify one proprietary data source or integration', 'product', '0→1', false, 'high', current_date + interval '12 days');

delete from public.risk_assessments where opportunity_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333'
);

insert into public.risk_assessments (opportunity_id, user_id, risk_label, heat_level, mitigation_note) values
('11111111-1111-4111-8111-111111111111', null, 'Incumbents bundle the workflow', 'high', 'Find a narrow Slack-native intake wedge legacy suites ignore.'),
('11111111-1111-4111-8111-111111111111', null, 'Buyer and daily user may differ', 'medium', 'Force every call to identify economic buyer, workflow owner, and champion.'),
('22222222-2222-4222-8222-222222222222', null, 'Marketplace cold start', 'high', 'Start with concierge cohorts before building self-serve marketplace features.'),
('22222222-2222-4222-8222-222222222222', null, 'Quality dilution as membership scales', 'medium', 'Use invitation paths, reputation scoring, and moderator workflows.'),
('33333333-3333-4333-8333-333333333333', null, 'No durable differentiation', 'high', 'Refuse horizontal features until a niche workflow has proof of urgent pain.'),
('33333333-3333-4333-8333-333333333333', null, 'Low willingness to pay', 'high', 'Demand preorders or explicit budget owner signal before building.');

delete from public.ember_messages where opportunity_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333'
);

insert into public.ember_messages (opportunity_id, user_id, role, content, agent_type, response_id) values
('11111111-1111-4111-8111-111111111111', null, 'assistant', 'Demo readout: this is a strong B2B wedge if discovery proves finance owns the daily intake pain and paid pilots can start inside Slack before broader suite replacement.', 'market', 'demo-response-procurement-1'),
('11111111-1111-4111-8111-111111111111', null, 'assistant', 'Execution plan: interview finance leaders, mock the intake-to-approval workflow, and ask for paid pilot terms before expanding the product surface.', 'execution', 'demo-response-procurement-2'),
('22222222-2222-4222-8222-222222222222', null, 'assistant', 'Demo readout: the community network has real founder edge but must prove repeat liquidity and trust density before investing in platform automation.', 'core', 'demo-response-community-1'),
('22222222-2222-4222-8222-222222222222', null, 'assistant', 'Moat note: proprietary reputation graphs and intro outcomes matter more than profile pages. Start manual, measure trust, then automate.', 'moat', 'demo-response-community-2'),
('33333333-3333-4333-8333-333333333333', null, 'assistant', 'Demo readout: this is intentionally weak. The market is large, but the wedge is too broad and incumbents can copy generic assistant features quickly.', 'risk', 'demo-response-productivity-1'),
('33333333-3333-4333-8333-333333333333', null, 'assistant', 'Next move: narrow to one painful niche workflow and require preorders before writing more product code.', 'execution', 'demo-response-productivity-2');

delete from public.documents where opportunity_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333'
);

insert into public.documents (opportunity_id, user_id, filename, storage_path, extracted_text, file_type, file_size_bytes) values
('11111111-1111-4111-8111-111111111111', null, 'demo-procurement-discovery-brief.md', 'demo/procurement-discovery-brief.md', 'Discovery summary: CFOs report procurement intake living across Slack, email, and spreadsheets. The most painful step is routing approvals with budget context and vendor risk visibility.', 'text/markdown', 8420),
('22222222-2222-4222-8222-222222222222', null, 'demo-community-cohort-notes.md', 'demo/community-cohort-notes.md', 'Cohort notes: founders value warm investor context and high-signal peer referrals. The operational bottleneck is maintaining quality as volume increases.', 'text/markdown', 6310),
('33333333-3333-4333-8333-333333333333', null, 'demo-productivity-risk-review.md', 'demo/productivity-risk-review.md', 'Risk review: horizontal AI productivity is a crowded field with weak switching costs. Users need a specialized workflow outcome, not another generic chat surface.', 'text/markdown', 5120);

