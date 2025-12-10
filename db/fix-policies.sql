-- Helper function to check membership securely (bypassing RLS recursion)
create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id
    and user_id = auth.uid()
  );
$$;

-- Drop existing policies to start fresh
drop policy if exists "groups_select" on public.groups;
drop policy if exists "groups_insert" on public.groups;
drop policy if exists "groups_update" on public.groups;
drop policy if exists "groups_delete" on public.groups;

drop policy if exists "group_members_select" on public.group_members;
drop policy if exists "group_members_insert" on public.group_members;
drop policy if exists "group_members_delete" on public.group_members;

-- GROUPS POLICIES

-- Select: Allow if user is owner OR a member
create policy "groups_select"
  on public.groups for select
  using (
    owner_user_id = auth.uid() 
    or 
    public.is_group_member(id)
  );

-- Insert: Allow authenticated users to create groups
create policy "groups_insert"
  on public.groups for insert
  with check (owner_user_id = auth.uid());

-- Update: Only owner
create policy "groups_update"
  on public.groups for update
  using (owner_user_id = auth.uid());

-- Delete: Only owner
create policy "groups_delete"
  on public.groups for delete
  using (owner_user_id = auth.uid());


-- GROUP MEMBERS POLICIES

-- Select: Allow if user is a member of the group (so they can see who else is in it)
create policy "group_members_select"
  on public.group_members for select
  using (
    public.is_group_member(group_id)
  );

-- Insert: Only the group owner can add members
create policy "group_members_insert"
  on public.group_members for insert
  with check (
    exists (
      select 1 from public.groups
      where id = group_id
      and owner_user_id = auth.uid()
    )
  );

-- Delete: User can remove themselves (leave) OR Owner can remove anyone
create policy "group_members_delete"
  on public.group_members for delete
  using (
    user_id = auth.uid()
    or
    exists (
      select 1 from public.groups
      where id = group_id
      and owner_user_id = auth.uid()
    )
  );
