-- ============================================================
-- Filament Inventory Management — Initial Schema Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type material_type as enum ('PLA', 'PETG', 'ABS', 'TPU');
create type print_status as enum ('success', 'failed');

-- ============================================================
-- TABLES
-- ============================================================

-- Filament Profiles (templates)
create table filament_profiles (
  id            uuid        default uuid_generate_v4() primary key,
  user_id       uuid        references auth.users not null,
  brand         text        not null,
  material_type material_type not null,
  color         text        not null,
  default_weight numeric    not null default 1000,
  default_cost   numeric    not null default 0,
  image_url      text,
  created_at     timestamptz default now()
);

-- Filament Spools (inventory instances)
create table filament_spools (
  id               uuid    default uuid_generate_v4() primary key,
  user_id          uuid    references auth.users not null,
  profile_id       uuid    references filament_profiles(id) on delete restrict not null,
  filament_number  text    not null,
  total_weight     numeric not null,
  available_weight numeric not null,
  cost             numeric not null default 0,
  cost_per_gram    numeric generated always as (
    case when total_weight > 0 then cost / total_weight else 0 end
  ) stored,
  purchase_date    date,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique (user_id, filament_number)
);

-- Prints
create table prints (
  id                uuid        default uuid_generate_v4() primary key,
  user_id           uuid        references auth.users not null,
  print_number      text        not null,
  spool_id          uuid        references filament_spools(id) on delete set null,
  filament_required numeric     not null,
  total_layers      integer     not null,
  status            print_status not null default 'success',
  created_at        timestamptz default now(),
  unique (user_id, print_number)
);

-- Failed Prints (1:1 with prints)
create table failed_prints (
  id             uuid    default uuid_generate_v4() primary key,
  print_id       uuid    references prints(id) on delete cascade unique not null,
  layers_printed integer not null,
  consumed_grams numeric not null,
  leftover_grams numeric not null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- User Settings
create table settings (
  user_id                    uuid    references auth.users primary key,
  low_stock_threshold_grams  numeric not null default 100
);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger filament_spools_updated_at
  before update on filament_spools
  for each row execute function update_updated_at();

create trigger failed_prints_updated_at
  before update on failed_prints
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table filament_profiles enable row level security;
alter table filament_spools   enable row level security;
alter table prints            enable row level security;
alter table failed_prints     enable row level security;
alter table settings          enable row level security;

-- filament_profiles
create policy "profiles_select" on filament_profiles for select using (auth.uid() = user_id);
create policy "profiles_insert" on filament_profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update" on filament_profiles for update using (auth.uid() = user_id);
create policy "profiles_delete" on filament_profiles for delete using (auth.uid() = user_id);

-- filament_spools
create policy "spools_select" on filament_spools for select using (auth.uid() = user_id);
create policy "spools_insert" on filament_spools for insert with check (auth.uid() = user_id);
create policy "spools_update" on filament_spools for update using (auth.uid() = user_id);
create policy "spools_delete" on filament_spools for delete using (auth.uid() = user_id);

-- prints
create policy "prints_select" on prints for select using (auth.uid() = user_id);
create policy "prints_insert" on prints for insert with check (auth.uid() = user_id);
create policy "prints_update" on prints for update using (auth.uid() = user_id);
create policy "prints_delete" on prints for delete using (auth.uid() = user_id);

-- failed_prints (access via join to prints)
create policy "failed_prints_select" on failed_prints for select using (
  exists (
    select 1 from prints
    where prints.id = failed_prints.print_id
      and prints.user_id = auth.uid()
  )
);
create policy "failed_prints_insert" on failed_prints for insert with check (
  exists (
    select 1 from prints
    where prints.id = failed_prints.print_id
      and prints.user_id = auth.uid()
  )
);
create policy "failed_prints_update" on failed_prints for update using (
  exists (
    select 1 from prints
    where prints.id = failed_prints.print_id
      and prints.user_id = auth.uid()
  )
);
create policy "failed_prints_delete" on failed_prints for delete using (
  exists (
    select 1 from prints
    where prints.id = failed_prints.print_id
      and prints.user_id = auth.uid()
  )
);

-- settings
create policy "settings_select" on settings for select using (auth.uid() = user_id);
create policy "settings_insert" on settings for insert with check (auth.uid() = user_id);
create policy "settings_update" on settings for update using (auth.uid() = user_id);

-- ============================================================
-- STORAGE
-- ============================================================

-- Create the filament-images bucket (public read)
insert into storage.buckets (id, name, public)
values ('filament-images', 'filament-images', true)
on conflict (id) do nothing;

-- Storage RLS: each user can only write to their own user_id/ prefix
create policy "storage_insert" on storage.objects for insert with check (
  bucket_id = 'filament-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "storage_select" on storage.objects for select using (
  bucket_id = 'filament-images'
);
create policy "storage_update" on storage.objects for update using (
  bucket_id = 'filament-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "storage_delete" on storage.objects for delete using (
  bucket_id = 'filament-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
