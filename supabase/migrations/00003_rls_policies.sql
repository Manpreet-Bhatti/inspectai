-- supabase/migrations/00003_rls_policies.sql

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table inspections enable row level security;
alter table photos enable row level security;
alter table voice_notes enable row level security;
alter table findings enable row level security;
alter table reports enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Inspections: users can CRUD their own inspections
create policy "Users can view own inspections"
  on inspections for select
  using (auth.uid() = user_id);

create policy "Users can create inspections"
  on inspections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own inspections"
  on inspections for update
  using (auth.uid() = user_id);

create policy "Users can delete own inspections"
  on inspections for delete
  using (auth.uid() = user_id);

-- Photos: access through inspection ownership
create policy "Users can view photos of own inspections"
  on photos for select
  using (
    exists (
      select 1 from inspections
      where inspections.id = photos.inspection_id
        and inspections.user_id = auth.uid()
    )
  );

create policy "Users can insert photos to own inspections"
  on photos for insert
  with check (
    exists (
      select 1 from inspections
      where inspections.id = inspection_id
        and inspections.user_id = auth.uid()
    )
  );

create policy "Users can update photos of own inspections"
  on photos for update
  using (
    exists (
      select 1 from inspections
      where inspections.id = photos.inspection_id
        and inspections.user_id = auth.uid()
    )
  );

create policy "Users can delete photos of own inspections"
  on photos for delete
  using (
    exists (
      select 1 from inspections
      where inspections.id = photos.inspection_id
        and inspections.user_id = auth.uid()
    )
  );

-- Voice notes: same pattern as photos
create policy "Users can view voice notes of own inspections"
  on voice_notes for select
  using (
    exists (
      select 1 from inspections
      where inspections.id = voice_notes.inspection_id
        and inspections.user_id = auth.uid()
    )
  );

create policy "Users can insert voice notes to own inspections"
  on voice_notes for insert
  with check (
    exists (
      select 1 from inspections
      where inspections.id = inspection_id
        and inspections.user_id = auth.uid()
    )
  );

create policy "Users can delete voice notes of own inspections"
  on voice_notes for delete
  using (
    exists (
      select 1 from inspections
      where inspections.id = voice_notes.inspection_id
        and inspections.user_id = auth.uid()
    )
  );

-- Findings: same pattern
create policy "Users can view findings of own inspections"
  on findings for select
  using (
    exists (
      select 1 from inspections
      where inspections.id = findings.inspection_id
        and inspections.user_id = auth.uid()
    )
  );

create policy "Users can manage findings of own inspections"
  on findings for all
  using (
    exists (
      select 1 from inspections
      where inspections.id = findings.inspection_id
        and inspections.user_id = auth.uid()
    )
  );

-- Reports: same pattern
create policy "Users can view reports of own inspections"
  on reports for select
  using (
    exists (
      select 1 from inspections
      where inspections.id = reports.inspection_id
        and inspections.user_id = auth.uid()
    )
  );

create policy "Users can create reports for own inspections"
  on reports for insert
  with check (
    exists (
      select 1 from inspections
      where inspections.id = inspection_id
        and inspections.user_id = auth.uid()
    )
  );

-- Service role bypass for ML service
-- The ML service uses the service_role key which bypasses RLS
