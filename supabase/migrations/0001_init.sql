-- ===========================================================================
-- MODA BARBER CLUB — booking schema
--
-- Apply with the Supabase SQL editor, or:
--   supabase db push
--
-- The site runs happily without this (demo mode, localStorage). Run it when
-- you want appointments stored for real, then fill in NEXT_PUBLIC_SUPABASE_URL
-- and NEXT_PUBLIC_SUPABASE_ANON_KEY.
--
-- Services, barbers and opening hours also live in config/siteConfig.ts, which
-- is what the site actually renders. The `services`, `barbers` and
-- `business_settings` tables here exist so the data can be moved into the
-- database later (or edited by an admin UI) without reshaping anything.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- barbers --
create table if not exists public.barbers (
  id            text primary key,
  name_en       text not null,
  name_he       text not null,
  role_en       text,
  role_he       text,
  specialty_en  text,
  specialty_he  text,
  bio_en        text,
  bio_he        text,
  image_url     text,
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

-- --------------------------------------------------------------- services --
create table if not exists public.services (
  id               text primary key,
  name_en          text not null,
  name_he          text not null,
  description_en   text,
  description_he   text,
  price            numeric(10, 2) not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  icon             text,
  image_url        text,
  is_featured      boolean not null default false,
  is_active        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

-- Which barber performs which service. No rows for a barber = performs all.
create table if not exists public.barber_services (
  barber_id  text not null references public.barbers(id) on delete cascade,
  service_id text not null references public.services(id) on delete cascade,
  primary key (barber_id, service_id)
);

-- ----------------------------------------------------------- availability --
-- One row per barber per weekday per shift. weekday: 0 = Sunday … 6 = Saturday.
create table if not exists public.availability (
  id            uuid primary key default gen_random_uuid(),
  barber_id     text not null references public.barbers(id) on delete cascade,
  weekday       smallint not null check (weekday between 0 and 6),
  start_minutes integer not null check (start_minutes between 0 and 1440),
  end_minutes   integer not null check (end_minutes between 0 and 1440),
  constraint availability_range_valid check (end_minutes > start_minutes)
);

create index if not exists availability_barber_weekday_idx
  on public.availability (barber_id, weekday);

-- ---------------------------------------------------------- appointments --
create type appointment_status as enum ('confirmed', 'completed', 'cancelled', 'no_show');

create table if not exists public.appointments (
  id                uuid primary key default gen_random_uuid(),
  confirmation_code text not null unique,
  service_id        text not null references public.services(id),
  barber_id         text not null references public.barbers(id),
  date              date not null,
  start_minutes     integer not null check (start_minutes between 0 and 1440),
  end_minutes       integer not null check (end_minutes between 0 and 1440),
  duration_minutes  integer not null check (duration_minutes > 0),
  customer_name     text not null check (length(trim(customer_name)) > 1),
  customer_phone    text not null,
  customer_email    text,
  notes             text,
  price             numeric(10, 2) not null check (price >= 0),
  status            appointment_status not null default 'confirmed',
  created_at        timestamptz not null default now(),
  constraint appointment_range_valid check (end_minutes > start_minutes)
);

create index if not exists appointments_date_idx on public.appointments (date);
create index if not exists appointments_barber_date_idx on public.appointments (barber_id, date);

-- The real double-booking guard. Two live appointments for the same barber may
-- never overlap; cancelled ones are excluded so a slot frees up again.
create extension if not exists btree_gist;

alter table public.appointments
  drop constraint if exists appointments_no_overlap;

alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    barber_id with =,
    date with =,
    int4range(start_minutes, end_minutes) with &&
  )
  where (status <> 'cancelled');

-- --------------------------------------------------------- blocked times --
create table if not exists public.blocked_times (
  id            uuid primary key default gen_random_uuid(),
  -- null = the whole shop is closed for this window
  barber_id     text references public.barbers(id) on delete cascade,
  date          date not null,
  start_minutes integer not null check (start_minutes between 0 and 1440),
  end_minutes   integer not null check (end_minutes between 0 and 1440),
  reason        text,
  created_at    timestamptz not null default now(),
  constraint blocked_range_valid check (end_minutes > start_minutes)
);

create index if not exists blocked_times_date_idx on public.blocked_times (date);

-- ------------------------------------------------------ business settings --
create table if not exists public.business_settings (
  id                     boolean primary key default true check (id),
  business_name          text not null default 'MODA BARBER CLUB',
  timezone               text not null default 'Asia/Jerusalem',
  currency               text not null default 'ILS',
  slot_interval_minutes  integer not null default 15,
  minimum_notice_hours   integer not null default 2,
  max_advance_days       integer not null default 45,
  buffer_minutes         integer not null default 5,
  -- Opening hours as [{ weekday, ranges: [{ start, end }] }], mirroring siteConfig.
  opening_hours          jsonb not null default '[]'::jsonb,
  updated_at             timestamptz not null default now()
);

insert into public.business_settings (id) values (true) on conflict (id) do nothing;

-- ===========================================================================
-- Row Level Security
--
-- ⚠️  READ THIS BEFORE GOING LIVE.
--
-- The policies below are the minimum a public booking form needs: anonymous
-- visitors may read the catalogue and create an appointment, and nothing else.
-- Customer details are NOT readable anonymously.
--
-- The demo admin page at /admin has no authentication, so with these policies
-- it will show nothing once Supabase is connected — which is deliberate.
-- Before using the admin for real:
--   1. Add Supabase Auth and give staff accounts a role claim (e.g. 'staff').
--   2. Add the staff policies at the bottom of this file.
--   3. Put /admin behind a server-side session check.
-- ===========================================================================

alter table public.barbers           enable row level security;
alter table public.services          enable row level security;
alter table public.barber_services   enable row level security;
alter table public.availability      enable row level security;
alter table public.appointments      enable row level security;
alter table public.blocked_times     enable row level security;
alter table public.business_settings enable row level security;

-- Public catalogue: readable by anyone.
create policy "catalogue is public" on public.barbers
  for select using (is_active);
create policy "services are public" on public.services
  for select using (is_active);
create policy "barber services are public" on public.barber_services
  for select using (true);
create policy "availability is public" on public.availability
  for select using (true);
create policy "settings are public" on public.business_settings
  for select using (true);

-- Booked-out times must be visible so the grid can hide them, but the customer
-- columns must not be. Expose only what the availability maths needs.
create or replace view public.busy_slots as
  select barber_id, date, start_minutes, end_minutes
  from public.appointments
  where status <> 'cancelled';

grant select on public.busy_slots to anon, authenticated;

create policy "blocked times are public" on public.blocked_times
  for select using (true);

-- Anyone may book. Nobody anonymous may read, change or delete a booking.
create policy "anyone may book" on public.appointments
  for insert with check (status = 'confirmed');

-- ---------------------------------------------------------------------------
-- Staff policies — uncomment once real authentication is in place.
-- ---------------------------------------------------------------------------
-- create policy "staff read appointments" on public.appointments
--   for select using (auth.jwt() ->> 'role' = 'staff');
-- create policy "staff update appointments" on public.appointments
--   for update using (auth.jwt() ->> 'role' = 'staff');
-- create policy "staff manage blocked times" on public.blocked_times
--   for all using (auth.jwt() ->> 'role' = 'staff');
