-- STEP 3: Create simple policies (run this after step 2)

-- User profiles: allow all authenticated users to read and update own
create policy "user_profiles_select"
  on public.user_profiles for select
  using (true);

create policy "user_profiles_insert"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "user_profiles_update"
  on public.user_profiles for update
  using (auth.uid() = id);

-- Groups: simple ownership check
create policy "groups_select"
  on public.groups for select
  using (owner_user_id = auth.uid());

create policy "groups_insert"
  on public.groups for insert
  with check (owner_user_id = auth.uid());

create policy "groups_update"
  on public.groups for update
  using (owner_user_id = auth.uid());

create policy "groups_delete"
  on public.groups for delete
  using (owner_user_id = auth.uid());

-- Group members: owner can see and manage
create policy "group_members_select"
  on public.group_members for select
  using (user_id = auth.uid());

create policy "group_members_insert"
  on public.group_members for insert
  with check (true);

create policy "group_members_delete"
  on public.group_members for delete
  using (user_id = auth.uid());

-- Items: very simple for now
create policy "items_select"
  on public.items for select
  using (true);

create policy "items_insert"
  on public.items for insert
  with check (true);

create policy "items_update"
  on public.items for update
  using (true);

create policy "items_delete"
  on public.items for delete
  using (true);
