-- 001_init.sql

-- Extensions
create extension if not exists pgcrypto;

-- PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  title text not null,
  brand text,
  category text,
  gender text check (gender in ('male','female','unisex')) default 'unisex',
  price numeric,
  currency text default 'TRY',
  image_url text,
  product_url text not null,
  is_active boolean not null default true,
  attrs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_active on public.products (is_active);
create index if not exists idx_products_brand on public.products (brand);
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_attrs_gin on public.products using gin (attrs);

-- USER PROFILES
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorite_brands text[] not null default '{}',
  blocked_brands text[] not null default '{}',
  pref jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- QUIZ QUESTIONS (optional seedable)
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  prompt text not null,
  type text not null check (type in ('single','multi','range')),
  options jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- QUIZ ANSWERS
create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_key text not null,
  answer jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_key)
);

-- LIKES / DISLIKES
create table if not exists public.user_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.user_dislikes (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- DAILY RECOMMENDATIONS
create table if not exists public.recommendations_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  product_ids uuid[] not null default '{}',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- CLICKS (optional analytics)
create table if not exists public.events_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid not null references public.products(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  source text not null default 'feed',
  session_id text
);

-- UPDATED_AT trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_products_updated_at') then
    create trigger trg_products_updated_at
    before update on public.products
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_profiles_updated_at') then
    create trigger trg_profiles_updated_at
    before update on public.user_profiles
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_quiz_answers_updated_at') then
    create trigger trg_quiz_answers_updated_at
    before update on public.quiz_answers
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_reco_daily_updated_at') then
    create trigger trg_reco_daily_updated_at
    before update on public.recommendations_daily
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- RLS ENABLE
alter table public.user_profiles enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.user_likes enable row level security;
alter table public.user_dislikes enable row level security;
alter table public.recommendations_daily enable row level security;
alter table public.products enable row level security;
alter table public.events_clicks enable row level security;

-- PRODUCTS: public read (only active)
drop policy if exists "Products are public read (active)" on public.products;
create policy "Products are public read (active)"
on public.products for select
using (is_active = true);

-- USER TABLES: only owner
drop policy if exists "Profiles owner read/write" on public.user_profiles;
create policy "Profiles owner read/write"
on public.user_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Quiz answers owner read/write" on public.quiz_answers;
create policy "Quiz answers owner read/write"
on public.quiz_answers for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Likes owner read/write" on public.user_likes;
create policy "Likes owner read/write"
on public.user_likes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Dislikes owner read/write" on public.user_dislikes;
create policy "Dislikes owner read/write"
on public.user_dislikes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Reco daily owner read" on public.recommendations_daily;
create policy "Reco daily owner read"
on public.recommendations_daily for select
using (auth.uid() = user_id);

-- recommendations_daily writes should be server-side (service role).
-- Optionally allow user to insert/update own record (not recommended). Keep locked:
drop policy if exists "Reco daily no client writes" on public.recommendations_daily;
create policy "Reco daily no client writes"
on public.recommendations_daily for insert
with check (false);

drop policy if exists "Reco daily no client updates" on public.recommendations_daily;
create policy "Reco daily no client updates"
on public.recommendations_daily for update
using (false);

-- events_clicks: no client direct writes (server only)
drop policy if exists "Clicks no client writes" on public.events_clicks;
create policy "Clicks no client writes"
on public.events_clicks for insert
with check (false);
