-- DOCOICO profile dashboard and couple-mode upgrade
-- Run this once in the Supabase SQL Editor.

alter table profiles add column if not exists birth_date date;
alter table profiles add column if not exists partner_user_id uuid references profiles(id) on delete set null;
alter table profiles add column if not exists updated_at timestamptz default now();

create table if not exists couple_recommendations (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles(id) on delete cascade,
  partner_id uuid not null references profiles(id) on delete cascade,
  spot_name text not null,
  spot_category text,
  spot_reason text,
  created_at timestamptz default now()
);

alter table couple_recommendations enable row level security;
create index if not exists idx_couple_recommendations_partner on couple_recommendations(partner_id, created_at desc);
