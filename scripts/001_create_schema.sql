-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  is_admin boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Profiles RLS Policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);
create policy "profiles_select_all_public" on public.profiles for select using (true);

-- Create events table (matches/games)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  sport text not null,
  league text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  team_a text not null,
  team_b text not null,
  odds_a numeric,
  odds_b numeric,
  odds_draw numeric,
  status text default 'upcoming',
  result text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.events enable row level security;

-- Events RLS Policies (public read, admin write)
create policy "events_select_public" on public.events for select using (true);
create policy "events_insert_admin" on public.events for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "events_update_admin" on public.events for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "events_delete_admin" on public.events for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Create predictions table
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  prediction text not null,
  odds numeric not null,
  amount numeric not null,
  status text default 'pending',
  payout numeric,
  confidence integer check (confidence >= 1 and confidence <= 100),
  created_at timestamp with time zone default now(),
  settled_at timestamp with time zone
);

alter table public.predictions enable row level security;

-- Predictions RLS Policies
create policy "predictions_select_own" on public.predictions for select using (auth.uid() = user_id);
create policy "predictions_insert_own" on public.predictions for insert with check (auth.uid() = user_id);
create policy "predictions_select_admin" on public.predictions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.subscriptions enable row level security;

-- Subscriptions RLS Policies
create policy "subscriptions_select_own" on public.subscriptions for select using (auth.uid() = user_id);
create policy "subscriptions_update_own" on public.subscriptions for update using (auth.uid() = user_id);

-- Create user_stats table
create table if not exists public.user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  total_predictions integer default 0,
  correct_predictions integer default 0,
  win_rate numeric default 0,
  total_winnings numeric default 0,
  current_streak integer default 0,
  best_streak integer default 0,
  rank integer,
  level integer default 1,
  experience_points integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.user_stats enable row level security;

-- User Stats RLS Policies
create policy "user_stats_select_public" on public.user_stats for select using (true);
create policy "user_stats_update_own" on public.user_stats for update using (auth.uid() = user_id);

-- Create badges table
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon_url text,
  criteria text not null,
  created_at timestamp with time zone default now()
);

alter table public.badges enable row level security;

-- Badges RLS Policy (public read)
create policy "badges_select_public" on public.badges for select using (true);

-- Create user_badges table (junction)
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamp with time zone default now(),
  unique(user_id, badge_id)
);

alter table public.user_badges enable row level security;

-- User Badges RLS Policies
create policy "user_badges_select_own" on public.user_badges for select using (auth.uid() = user_id);
create policy "user_badges_select_public" on public.user_badges for select using (true);
create policy "user_badges_insert_own" on public.user_badges for insert with check (auth.uid() = user_id);

-- Create trigger for auto-profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
    new.email
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Insert some initial badges
insert into public.badges (name, description, criteria) values
  ('First Prediction', 'Make your first prediction', 'complete_1_prediction'),
  ('Hot Streak', 'Get 5 predictions correct in a row', 'streak_5'),
  ('Master Predictor', 'Achieve 80% win rate with 50+ predictions', 'win_rate_80_50'),
  ('High Roller', 'Place predictions totaling $10,000', 'total_10k'),
  ('League Champion', 'Finish #1 on the leaderboard', 'rank_1')
on conflict do nothing;
