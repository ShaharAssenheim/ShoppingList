# Supabase DB setup

Run these files in order in Supabase SQL editor:

1. `schema.sql` — creates tables and indexes
2. `policies.sql` — enables RLS and adds policies
3. `functions.sql` — optional helper functions

## Notes
- Uses `auth.uid()` to scope access to the signed-in user.
- `groups` and `items` are shared via `group_members` table.
- Owners can manage groups/members; members can CRUD items.
