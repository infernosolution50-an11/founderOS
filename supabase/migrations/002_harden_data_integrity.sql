alter table public.ember_messages
add column if not exists response_id text;

create index if not exists opportunities_user_id_idx on public.opportunities(user_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_opportunity_id_idx on public.tasks(opportunity_id);
create index if not exists ember_messages_user_id_idx on public.ember_messages(user_id);
create index if not exists ember_messages_opportunity_id_idx on public.ember_messages(opportunity_id);
create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists documents_opportunity_id_idx on public.documents(opportunity_id);
create index if not exists opportunity_notes_user_id_idx on public.opportunity_notes(user_id);
create index if not exists risk_assessments_user_id_idx on public.risk_assessments(user_id);
create index if not exists risk_assessments_opportunity_id_idx on public.risk_assessments(opportunity_id);

drop policy if exists "Users can insert own tasks" on public.tasks;
create policy "Users can insert own tasks" on public.tasks
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.opportunities
      where opportunities.id = tasks.opportunity_id
      and opportunities.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own Ember messages" on public.ember_messages;
create policy "Users can insert own Ember messages" on public.ember_messages
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.opportunities
      where opportunities.id = ember_messages.opportunity_id
      and opportunities.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own documents" on public.documents;
create policy "Users can insert own documents" on public.documents
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.opportunities
      where opportunities.id = documents.opportunity_id
      and opportunities.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own opportunity notes" on public.opportunity_notes;
create policy "Users can insert own opportunity notes" on public.opportunity_notes
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.opportunities
      where opportunities.id = opportunity_notes.opportunity_id
      and opportunities.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own risk assessments" on public.risk_assessments;
create policy "Users can insert own risk assessments" on public.risk_assessments
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.opportunities
      where opportunities.id = risk_assessments.opportunity_id
      and opportunities.user_id = auth.uid()
    )
  );

