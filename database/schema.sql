create extension if not exists pgcrypto;
create extension if not exists citext;

do $$ begin
  create type user_role as enum ('user', 'super_admin', 'moderator', 'verification_agent', 'support_agent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type account_status as enum ('active', 'pending_verification', 'suspended', 'banned', 'deleted');
exception when duplicate_object then null; end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  username citext not null unique,
  phone_number text not null unique,
  email citext not null unique,
  password_hash text not null,
  role user_role not null default 'user',
  status account_status not null default 'pending_verification',
  reputation_score int not null default 5 check (reputation_score between 0 and 5),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  refresh_token_hash text not null,
  user_agent text,
  ip_address inet,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  replaced_by_session_id uuid references auth_sessions(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  user_id uuid primary key references users(id) on delete cascade,
  date_of_birth date,
  gender text,
  looking_for text[] not null default '{}',
  city text,
  state text,
  country text,
  languages_spoken text[] not null default '{}',
  relationship_goals text[] not null default '{}',
  profession text,
  company text,
  industry text,
  college text,
  degree text,
  graduation_year int,
  smoking text,
  drinking text,
  fitness_level text,
  diet_preference text,
  sleep_schedule text,
  travel_frequency text,
  favorite_movies text[] not null default '{}',
  favorite_tv_shows text[] not null default '{}',
  favorite_music_genres text[] not null default '{}',
  favorite_games text[] not null default '{}',
  bio text check (char_length(bio) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists interests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists interests_lower_name_uq on interests (lower(name));

create table if not exists user_interests (
  user_id uuid not null references users(id) on delete cascade,
  interest_id uuid not null references interests(id) on delete cascade,
  primary key (user_id, interest_id)
);

create table if not exists verification_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  channel text not null check (channel in ('email', 'phone')),
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists user_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null check (type in ('email', 'phone', 'selfie', 'government_id')),
  status text not null default 'pending' check (status in ('pending', 'pending_review', 'approved', 'rejected')),
  score int not null default 0 check (score between 0 and 100),
  provider_payload jsonb not null default '{}',
  rejection_reason text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, type)
);

create table if not exists social_verifications (
  user_id uuid primary key references users(id) on delete cascade,
  instagram_username text,
  linkedin_profile_url text,
  status text not null default 'pending_review',
  review_note text,
  reviewed_by_user_id uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reference_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  friend_name text not null,
  friend_phone_number text not null,
  relationship text not null,
  trust_confirmed boolean,
  status text not null default 'requested',
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  url text not null,
  media_type text not null check (media_type in ('photo', 'video')),
  is_face_photo boolean not null default false,
  is_full_body boolean not null default false,
  position int not null check (position between 0 and 5),
  trust_score int not null default 0 check (trust_score between 0 and 100),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'flagged', 'rejected')),
  ai_analysis jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trust_scores (
  user_id uuid primary key references users(id) on delete cascade,
  phone_verified int not null default 0,
  email_verified int not null default 0,
  id_verified int not null default 0,
  selfie_verified int not null default 0,
  image_authenticity int not null default 0,
  social_verification int not null default 0,
  account_reputation int not null default 0,
  total_score int not null default 0 check (total_score between 0 and 100),
  updated_at timestamptz not null default now()
);

create table if not exists compatibility_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  age int,
  profession text,
  industry text,
  city text,
  country text,
  languages text[] not null default '{}',
  lifestyle_tags text[] not null default '{}',
  relationship_goals text[] not null default '{}',
  personality_traits text[] not null default '{}',
  interests text[] not null default '{}',
  entertainment_preferences jsonb not null default '{}',
  summary text not null default '',
  embedding real[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists discovery_actions (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references users(id) on delete cascade,
  target_user_id uuid not null references users(id) on delete cascade,
  action text not null check (action in ('like', 'pass', 'super_like', 'save', 'hide', 'block')),
  created_at timestamptz not null default now(),
  unique (actor_user_id, target_user_id, action),
  check (actor_user_id <> target_user_id)
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references users(id) on delete cascade,
  user_b_id uuid not null references users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'unmatched', 'blocked')),
  ai_icebreaker text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_a_id, user_b_id),
  check (user_a_id < user_b_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  sender_user_id uuid not null references users(id) on delete cascade,
  content text,
  media_url text,
  message_type text not null default 'text' check (message_type in ('text', 'voice', 'photo', 'video', 'gif')),
  safety_status text not null default 'clear' check (safety_status in ('clear', 'flagged', 'blocked')),
  safety_payload jsonb not null default '{}',
  read_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists message_reactions (
  message_id uuid not null references messages(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, reaction)
);

create table if not exists call_sessions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  caller_user_id uuid not null references users(id) on delete cascade,
  call_type text not null check (call_type in ('voice', 'video')),
  status text not null default 'ringing',
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan_code text not null check (plan_code in ('monthly', 'quarterly', 'yearly')),
  provider text not null,
  provider_subscription_id text not null,
  status text not null check (status in ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references users(id),
  reported_user_id uuid not null references users(id) on delete cascade,
  message_id uuid references messages(id),
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'in_review', 'resolved', 'dismissed')),
  metadata jsonb not null default '{}',
  resolution_note text,
  reviewed_by_user_id uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists users_status_idx on users(status);
create index if not exists auth_sessions_user_active_idx on auth_sessions(user_id, expires_at) where revoked_at is null;
create index if not exists profiles_location_idx on profiles(country, state, city);
create index if not exists media_user_idx on media_assets(user_id);
create index if not exists messages_match_created_idx on messages(match_id, created_at);
create index if not exists reports_status_idx on reports(status, created_at);
create index if not exists audit_actor_created_idx on audit_logs(actor_user_id, created_at);
create index if not exists discovery_actor_idx on discovery_actions(actor_user_id, created_at);

insert into settings (key, value)
values
  ('matching.threshold', '{"default": 75}'::jsonb),
  ('media.requirements', '{"min_total": 3, "max_total": 6, "min_face": 2, "min_full_body": 1}'::jsonb)
on conflict (key) do nothing;
