-- supabase/migrations/00001_initial_schema.sql

-- Enums
create type user_role as enum ('inspector', 'manager', 'admin');
create type property_type as enum ('single_family', 'multi_family', 'condo', 'townhouse', 'commercial', 'industrial');
create type inspection_status as enum ('draft', 'in_progress', 'review', 'completed', 'archived');
create type photo_category as enum ('exterior', 'interior', 'roof', 'foundation', 'electrical', 'plumbing', 'hvac', 'structural', 'other');
create type finding_category as enum ('structural', 'electrical', 'plumbing', 'hvac', 'roofing', 'exterior', 'interior', 'appliances', 'safety', 'cosmetic');
create type severity as enum ('critical', 'major', 'minor', 'cosmetic', 'info');
create type finding_status as enum ('active', 'resolved', 'disputed');
create type report_type as enum ('full', 'summary', 'defects');

-- Organizations (must be created before profiles due to foreign key)
create table organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamptz default now()
);

-- Profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role user_role default 'inspector',
  organization_id uuid references organizations(id),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Inspections
create table inspections (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  property_type property_type not null,
  status inspection_status default 'draft',
  user_id uuid references profiles(id) on delete cascade not null,
  scheduled_at timestamptz,
  completed_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Photos
create table photos (
  id uuid default gen_random_uuid() primary key,
  inspection_id uuid references inspections(id) on delete cascade not null,
  file_name text not null,
  storage_path text not null,
  thumbnail_path text,
  category photo_category default 'other',
  location text,
  width int,
  height int,
  ai_caption text,
  ai_objects jsonb,
  ai_condition text,
  ai_confidence float,
  processed_at timestamptz,
  error text,
  created_at timestamptz default now()
);

-- Voice Notes
create table voice_notes (
  id uuid default gen_random_uuid() primary key,
  inspection_id uuid references inspections(id) on delete cascade not null,
  storage_path text not null,
  duration int not null,
  transcript text,
  summary text,
  processed_at timestamptz,
  error text,
  created_at timestamptz default now()
);

-- Findings
create table findings (
  id uuid default gen_random_uuid() primary key,
  inspection_id uuid references inspections(id) on delete cascade not null,
  photo_id uuid references photos(id),
  voice_note_id uuid references voice_notes(id),
  title text not null,
  description text not null,
  category finding_category not null,
  severity severity not null,
  location text,
  cost_estimate float,
  cost_min float,
  cost_max float,
  status finding_status default 'active',
  is_ai_generated boolean default false,
  confidence float,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reports
create table reports (
  id uuid default gen_random_uuid() primary key,
  inspection_id uuid references inspections(id) on delete cascade not null,
  type report_type not null,
  storage_path text,
  summary text,
  total_cost float,
  generated_at timestamptz default now()
);

-- Indexes
create index inspections_user_id_idx on inspections(user_id);
create index inspections_status_idx on inspections(status);
create index inspections_created_at_idx on inspections(created_at desc);
create index photos_inspection_id_idx on photos(inspection_id);
create index voice_notes_inspection_id_idx on voice_notes(inspection_id);
create index findings_inspection_id_idx on findings(inspection_id);
create index findings_severity_idx on findings(severity);
create index reports_inspection_id_idx on reports(inspection_id);

-- Updated at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
create trigger inspections_updated_at before update on inspections
  for each row execute function update_updated_at();
create trigger findings_updated_at before update on findings
  for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
