-- Supabase schema for DOCOICO
-- Run this SQL in Supabase SQL editor (or via psql if you export the DB)

-- enable uuid generator
create extension if not exists pgcrypto;

-- spots table
create table if not exists spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  lat double precision not null,
  lng double precision not null,
  google_place_id text,
  instagram_url text,
  comfort_score integer,
  created_at timestamptz default now()
);

-- sessions (QR-based anonymous voting sessions)
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  qr_code text,
  mode text not null check (mode in ('couple','friends','solo')),
  host_id uuid,
  created_at timestamptz default now(),
  expires_at timestamptz,
  expected_count integer,
  candidate_options jsonb not null default '[]'::jsonb
);

-- votes (anonymous votes linked to sessions)
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  mood text,
  atmosphere text,
  budget text,
  genre text,
  candidate_name text,
  created_at timestamptz default now()
);

-- user profiles (connects to Supabase Auth users table)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  provider text,
  display_name text,
  avatar_url text,
  birth_date date,
  partner_user_id uuid references profiles(id) on delete set null,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Couple-mode proposals. These are written and read only through protected
-- server routes, so no browser policy grants are needed.
create table if not exists couple_recommendations (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles(id) on delete cascade,
  partner_id uuid not null references profiles(id) on delete cascade,
  spot_name text not null,
  spot_category text,
  spot_reason text,
  created_at timestamptz default now()
);

-- useful indexes
create index if not exists idx_spots_google_place on spots(google_place_id);
create index if not exists idx_sessions_expires on sessions(expires_at);

-- Realtime: Supabase Realtime works on WAL; ensure appropriate RLS policies are added in Supabase dashboard for production.

-- user history and favorites
create table if not exists user_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  spot_id uuid,
  spot_name text,
  spot_category text,
  lat double precision,
  lng double precision,
  transport text,
  note text,
  created_at timestamptz default now(),
  foreign key (spot_id) references spots(id) on delete set null
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  spot_id uuid not null,
  created_at timestamptz default now(),
  foreign key (spot_id) references spots(id) on delete cascade
);

create unique index if not exists ux_favorites_user_spot on favorites(user_id, spot_id);
create index if not exists idx_couple_recommendations_partner on couple_recommendations(partner_id, created_at desc);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;
