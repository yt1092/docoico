-- RLS policies for tables written to directly from the browser (anon key).
-- Other tables (spots, sessions, favorites, user_history) are only ever
-- written via server-side API routes using the service role key, which
-- bypasses RLS entirely, so they don't need policies here.

alter table votes enable row level security;
alter table profiles enable row level security;

-- Votes are anonymous by design (QR-code voting, no login required).
drop policy if exists "votes_public_insert" on votes;
create policy "votes_public_insert" on votes
  for insert
  with check (true);

drop policy if exists "votes_public_select" on votes;
create policy "votes_public_select" on votes
  for select
  using (true);

-- Profiles: a user may only create/update their own row.
drop policy if exists "profiles_own_insert" on profiles;
create policy "profiles_own_insert" on profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_own_update" on profiles;
create policy "profiles_own_update" on profiles
  for update
  using (auth.uid() = id);

drop policy if exists "profiles_own_select" on profiles;
create policy "profiles_own_select" on profiles
  for select
  using (auth.uid() = id);
