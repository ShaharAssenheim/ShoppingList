-- STEP 1: Drop everything (run this first)

-- Drop all policies first
drop policy if exists "User profiles: all authenticated users can read" on public.user_profiles;
drop policy if exists "User profiles: users can update own profile" on public.user_profiles;
drop policy if exists "Groups: members can read" on public.groups;
drop policy if exists "Groups: owner can modify" on public.groups;
drop policy if exists "Groups: owner can create/modify" on public.groups;
drop policy if exists "Group members: visible to involved user" on public.group_members;
drop policy if exists "Group members: owner can manage" on public.group_members;
drop policy if exists "Group members: user can see own" on public.group_members;
drop policy if exists "Group members: owner can see all" on public.group_members;
drop policy if exists "Items: members can read" on public.items;
drop policy if exists "Items: members can insert" on public.items;
drop policy if exists "Items: members can update" on public.items;
drop policy if exists "Items: members can delete" on public.items;

-- Drop functions
drop function if exists public.create_group(text);
drop function if exists public.leave_group(uuid);

-- Drop tables
drop table if exists public.items cascade;
drop table if exists public.group_members cascade;
drop table if exists public.groups cascade;
drop table if exists public.user_profiles cascade;
