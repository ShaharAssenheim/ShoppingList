-- STEP 4: Create functions (run this after step 3)

create or replace function public.create_group(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_group_id uuid;
begin
  insert into public.groups(name, owner_user_id)
  values (p_name, auth.uid())
  returning id into new_group_id;

  insert into public.group_members(group_id, user_id, role)
  values (new_group_id, auth.uid(), 'owner');

  return new_group_id;
end;
$$;

create or replace function public.leave_group(p_group_id uuid)
returns void
language sql
security definer
as $$
delete from public.group_members
where group_id = p_group_id and user_id = auth.uid();
$$;
