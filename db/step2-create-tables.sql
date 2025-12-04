-- STEP 2: Create tables (run this after step 1)

create extension if not exists "uuid-ossp";

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_user_id uuid not null,
  created_at timestamptz not null default now()
);

create table public.group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table public.items (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null,
  is_completed boolean not null default false,
  emoji text not null default '🛒',
  category text not null default 'כללי',
  created_at timestamptz not null default now()
);

create index idx_items_group_created on public.items(group_id, created_at desc);
create index idx_group_members_user on public.group_members(user_id);
create index idx_user_profiles_email on public.user_profiles(email);

alter table public.user_profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.items enable row level security;
