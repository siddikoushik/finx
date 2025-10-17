-- Profiles table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  display_name text,
  created_at timestamp with time zone default now()
);

-- Calculations table
create table if not exists public.calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  calculator_type text not null,
  input_json jsonb not null,
  output_json jsonb not null,
  summary_text text,
  created_at timestamp with time zone default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.calculations enable row level security;

create policy profiles_select_own on public.profiles for select using ( auth.uid() = user_id );
create policy profiles_upsert_own on public.profiles for insert with check ( auth.uid() = user_id );
create policy profiles_update_own on public.profiles for update using ( auth.uid() = user_id );

create policy calcs_select_own on public.calculations for select using ( auth.uid() = user_id );
create policy calcs_insert_own on public.calculations for insert with check ( auth.uid() = user_id );
create policy calcs_update_own on public.calculations for update using ( auth.uid() = user_id );
create policy calcs_delete_own on public.calculations for delete using ( auth.uid() = user_id );
