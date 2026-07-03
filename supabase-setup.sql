-- Trade Control Journal - Supabase Setup
-- Run this entire script in the Supabase SQL Editor

-- ── TRADES TABLE ─────────────────────────────────────────────────────────────
create table if not exists public.trades (
  id             text        primary key,
  user_id        uuid        not null references auth.users(id) on delete cascade,
  date           text        not null,
  time           text        not null,
  symbol         text        not null,
  type           text        not null check (type in ('Long', 'Short')),
  pnl            numeric     not null default 0,
  risk           numeric     not null default 0,
  planned_rr     numeric     not null default 0,
  actual_rr      numeric     not null default 0,
  status         text        not null check (status in ('Win', 'Loss', 'Break Even')),
  entry_reason   text        not null default '',
  followed_rules boolean     not null default true,
  touched_after_entry boolean not null default false,
  notes          text        not null default '',
  screenshot     text,
  created_at     text        not null
);

-- Row Level Security: users can only see/modify their own trades
alter table public.trades enable row level security;

create policy "Users manage own trades"
  on public.trades
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── MONTHLY GOALS TABLE ───────────────────────────────────────────────────────
create table if not exists public.monthly_goals (
  id        uuid    primary key default gen_random_uuid(),
  user_id   uuid    not null references auth.users(id) on delete cascade,
  amount    numeric not null default 1000,
  month     text    not null,
  unique(user_id, month)
);

alter table public.monthly_goals enable row level security;

create policy "Users manage own goals"
  on public.monthly_goals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── DONE ──────────────────────────────────────────────────────────────────────
-- Your tables are ready. Go back to the app and create your account!
