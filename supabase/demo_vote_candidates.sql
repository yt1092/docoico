-- Run once in the Supabase SQL Editor for an existing DOCOICO project.
alter table public.sessions
  add column if not exists candidate_options jsonb not null default '[]'::jsonb;

alter table public.votes
  add column if not exists candidate_name text;

-- Required for Supabase Realtime delivery in the friends-vote screen.
alter publication supabase_realtime add table public.votes;
