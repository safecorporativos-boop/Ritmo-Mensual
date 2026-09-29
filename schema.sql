-- ============================================
-- RITMO MENSUAL - Supabase Schema
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  theme text default 'coral',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  area text not null check (area in ('cocina','trabajo','personal','compras','ahorros','metas')),
  priority text default 'medium' check (priority in ('low','medium','high')),
  due_date date,
  notes text default '',
  completed boolean default false,
  year int not null,
  month int not null check (month between 1 and 12),
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists tasks_user_period_idx on public.tasks (user_id, year, month);
create index if not exists tasks_area_idx on public.tasks (area);

-- RLS
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Tasks policies
create policy "Users can view own tasks"
  on public.tasks for select using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
