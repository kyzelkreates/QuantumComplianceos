-- ============================================================================
-- QUANTUM COMPLIANCE OS™ — Supabase Backend Setup — Run 15
-- ============================================================================
-- Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
-- Repository: https://github.com/kyzelkreates/QuantumComplianceos
--
-- PURPOSE:
-- This file sets up the Supabase PostgreSQL schema for Quantum Compliance OS™.
-- Execute this file in the Supabase SQL Editor (Project > SQL Editor > New Query).
--
-- RLS STATUS:
-- ENABLED on all app data tables.
-- All data access is restricted to authenticated users (owner_id = auth.uid()).
--
-- IMPORTANT SECURITY NOTICE:
-- ⚠ Use the Supabase anon/public key only in frontend configuration.
-- ⚠ NEVER expose SUPABASE_SERVICE_ROLE_KEY in frontend or client-side code.
-- ⚠ Authentication integration is required before production use.
-- ⚠ These RLS policies are backend-ready and must be reviewed by a qualified
--   Supabase/PostgreSQL administrator before live deployment.
-- ⚠ Review all policies for your specific compliance requirements.
--
-- EXECUTION ORDER (SAFE):
--   1. Extensions
--   2. Trigger function (updated_at)
--   3. Tables (parent → child dependency order)
--   4. Indexes
--   5. Triggers
--   6. Enable RLS
--   7. Policies
--   8. Verification queries
--   9. Rollback (commented — execute manually only if required)
--
-- DISCLAIMER:
-- This schema is advisory and requires qualified technical review before
-- production deployment. Backend connection enables persistence and sync
-- but does not guarantee legal, regulatory, or security compliance.
-- Risk scores and recommendations require qualified human review.
-- ============================================================================


-- ============================================================================
-- STEP 1: EXTENSIONS
-- ============================================================================

create extension if not exists "pgcrypto";


-- ============================================================================
-- STEP 2: TRIGGER FUNCTION — update_updated_at
-- (Must exist before triggers reference it)
-- ============================================================================

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================================
-- STEP 3: TABLES
-- (Ordered: independent tables first, then tables with foreign key deps)
-- ============================================================================

-- ── 3a. clients ──────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id                      uuid primary key default gen_random_uuid(),
  owner_id                uuid references auth.users(id) on delete cascade not null,
  name                    text not null,
  sector                  text,
  contact_name            text,
  contact_email           text,
  status                  text default 'active',
  risk_level              text,
  quantum_readiness_score integer,
  security_score          integer,
  evidence_status         text,
  assessment_status       text,
  last_assessment_date    date,
  report_count            integer default 0,
  notes                   text,
  archived                boolean default false,
  is_demo                 boolean default false,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);
comment on table public.clients is 'Client workspaces for Quantum Compliance OS™. Rows are isolated by owner_id via RLS.';

-- ── 3b. reports ──────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id                      uuid primary key default gen_random_uuid(),
  owner_id                uuid references auth.users(id) on delete cascade not null,
  client_id               uuid references public.clients(id) on delete cascade,
  title                   text not null,
  type                    text,
  status                  text default 'draft',
  risk_level              text,
  quantum_readiness_score integer,
  security_score          integer,
  evidence_status         text,
  summary                 text,
  recommendations         jsonb,
  is_demo                 boolean default false,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);
comment on table public.reports is 'Assessment reports linked to client workspaces.';

-- ── 3c. evidence_items ───────────────────────────────────────────────────────
create table if not exists public.evidence_items (
  id                      uuid primary key default gen_random_uuid(),
  owner_id                uuid references auth.users(id) on delete cascade not null,
  client_id               uuid references public.clients(id) on delete cascade,
  report_id               uuid references public.reports(id) on delete set null,
  title                   text not null,
  category                text,
  status                  text default 'missing',
  priority                text,
  owner                   text,
  due_date                date,
  last_updated            date,
  notes                   text,
  is_demo                 boolean default false,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);
comment on table public.evidence_items is 'Evidence items for compliance and security assessment reports.';

-- ── 3d. assessment_snapshots ─────────────────────────────────────────────────
create table if not exists public.assessment_snapshots (
  id                         uuid primary key default gen_random_uuid(),
  owner_id                   uuid references auth.users(id) on delete cascade not null,
  client_id                  uuid references public.clients(id) on delete cascade,
  report_id                  uuid references public.reports(id) on delete set null,
  snapshot_date              date,
  risk_level                 text,
  quantum_readiness_score    integer,
  security_score             integer,
  evidence_completion_percent integer,
  priority_action_count      integer,
  notes                      text,
  is_demo                    boolean default false,
  created_at                 timestamptz default now(),
  updated_at                 timestamptz default now()
);
comment on table public.assessment_snapshots is 'Point-in-time assessment snapshots for risk trend tracking.';

-- ── 3e. agency_settings ──────────────────────────────────────────────────────
create table if not exists public.agency_settings (
  id                           uuid primary key default gen_random_uuid(),
  owner_id                     uuid references auth.users(id) on delete cascade not null,
  agency_name                  text,
  agency_display_name          text,
  agency_logo_url              text,
  agency_primary_color         text,
  agency_secondary_color       text,
  agency_accent_color          text,
  agency_contact_name          text,
  agency_contact_email         text,
  agency_website               text,
  agency_sector_focus          jsonb,
  agency_tier                  text default 'starter',
  client_limit                 integer,
  white_label_reports_enabled  boolean default false,
  portfolio_analytics_enabled  boolean default false,
  client_archive_enabled       boolean default false,
  priority_actions_enabled     boolean default false,
  is_demo                      boolean default false,
  created_at                   timestamptz default now(),
  updated_at                   timestamptz default now()
);
comment on table public.agency_settings is 'Agency-level branding and configuration settings (Run 13+).';

-- ── 3f. white_label_settings ─────────────────────────────────────────────────
create table if not exists public.white_label_settings (
  id                               uuid primary key default gen_random_uuid(),
  owner_id                         uuid references auth.users(id) on delete cascade not null,
  enabled                          boolean default false,
  mode                             text default 'preview',
  public_product_name              text,
  public_brand_line                text,
  internal_ownership_line          text,
  allow_client_facing_white_label  boolean default true,
  show_kyzel_branding_in_reports   boolean default true,
  show_kyzel_branding_in_internal_app boolean default true,
  custom_domain_ready              boolean default false,
  custom_domain_value              text,
  onboarding_wizard_enabled        boolean default false,
  sla_support_layer_enabled        boolean default false,
  support_email                    text,
  is_demo                          boolean default false,
  created_at                       timestamptz default now(),
  updated_at                       timestamptz default now()
);
comment on table public.white_label_settings is 'White-label branding configuration. Kyzel Kreates™ / 4P3X ownership preserved.';

-- ── 3g. product_mode_settings ────────────────────────────────────────────────
create table if not exists public.product_mode_settings (
  id                      uuid primary key default gen_random_uuid(),
  owner_id                uuid references auth.users(id) on delete cascade not null,
  mode                    text default 'demo',
  demo_mode_enabled       boolean default true,
  live_mode_enabled       boolean default false,
  active_data_provider    text default 'localStorage',
  allow_demo_data         boolean default true,
  allow_live_data         boolean default false,
  prevent_demo_live_mixing boolean default true,
  status_message          text,
  is_demo                 boolean default false,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);
comment on table public.product_mode_settings is 'Demo/live product mode configuration per user (Run 14+).';

-- ── 3h. sync_events ──────────────────────────────────────────────────────────
create table if not exists public.sync_events (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references auth.users(id) on delete cascade not null,
  entity_type     text not null,
  entity_id       text not null,
  operation       text not null,
  provider        text not null,
  status          text default 'pending',
  error_message   text,
  payload_preview text,
  is_demo         boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
comment on table public.sync_events is 'Backend sync event queue for tracking local-to-backend sync operations (Run 15+).';


-- ============================================================================
-- STEP 4: INDEXES
-- ============================================================================

-- clients
create index if not exists idx_clients_owner_id    on public.clients(owner_id);
create index if not exists idx_clients_status      on public.clients(status);
create index if not exists idx_clients_risk_level  on public.clients(risk_level);
create index if not exists idx_clients_is_demo     on public.clients(is_demo);
create index if not exists idx_clients_created_at  on public.clients(created_at desc);

-- reports
create index if not exists idx_reports_owner_id    on public.reports(owner_id);
create index if not exists idx_reports_client_id   on public.reports(client_id);
create index if not exists idx_reports_status      on public.reports(status);
create index if not exists idx_reports_is_demo     on public.reports(is_demo);
create index if not exists idx_reports_created_at  on public.reports(created_at desc);

-- evidence_items
create index if not exists idx_evidence_owner_id   on public.evidence_items(owner_id);
create index if not exists idx_evidence_client_id  on public.evidence_items(client_id);
create index if not exists idx_evidence_report_id  on public.evidence_items(report_id);
create index if not exists idx_evidence_status     on public.evidence_items(status);
create index if not exists idx_evidence_is_demo    on public.evidence_items(is_demo);

-- assessment_snapshots
create index if not exists idx_snapshots_owner_id  on public.assessment_snapshots(owner_id);
create index if not exists idx_snapshots_client_id on public.assessment_snapshots(client_id);
create index if not exists idx_snapshots_date      on public.assessment_snapshots(snapshot_date desc);
create index if not exists idx_snapshots_is_demo   on public.assessment_snapshots(is_demo);

-- agency_settings
create index if not exists idx_agency_owner_id     on public.agency_settings(owner_id);

-- white_label_settings
create index if not exists idx_wl_owner_id         on public.white_label_settings(owner_id);

-- product_mode_settings
create index if not exists idx_pms_owner_id        on public.product_mode_settings(owner_id);

-- sync_events
create index if not exists idx_sync_owner_id       on public.sync_events(owner_id);
create index if not exists idx_sync_entity_type    on public.sync_events(entity_type);
create index if not exists idx_sync_status         on public.sync_events(status);
create index if not exists idx_sync_created_at     on public.sync_events(created_at desc);


-- ============================================================================
-- STEP 5: TRIGGERS — update updated_at on each table
-- (Trigger function must already exist from Step 2)
-- ============================================================================

create or replace trigger trg_clients_updated_at
  before update on public.clients
  for each row execute function public.update_updated_at_column();

create or replace trigger trg_reports_updated_at
  before update on public.reports
  for each row execute function public.update_updated_at_column();

create or replace trigger trg_evidence_updated_at
  before update on public.evidence_items
  for each row execute function public.update_updated_at_column();

create or replace trigger trg_snapshots_updated_at
  before update on public.assessment_snapshots
  for each row execute function public.update_updated_at_column();

create or replace trigger trg_agency_settings_updated_at
  before update on public.agency_settings
  for each row execute function public.update_updated_at_column();

create or replace trigger trg_wl_settings_updated_at
  before update on public.white_label_settings
  for each row execute function public.update_updated_at_column();

create or replace trigger trg_pms_updated_at
  before update on public.product_mode_settings
  for each row execute function public.update_updated_at_column();

create or replace trigger trg_sync_events_updated_at
  before update on public.sync_events
  for each row execute function public.update_updated_at_column();


-- ============================================================================
-- STEP 6: ENABLE RLS
-- ============================================================================
-- RLS STATUS: ENABLED on all 8 app data tables.

alter table public.clients               enable row level security;
alter table public.reports               enable row level security;
alter table public.evidence_items        enable row level security;
alter table public.assessment_snapshots  enable row level security;
alter table public.agency_settings       enable row level security;
alter table public.white_label_settings  enable row level security;
alter table public.product_mode_settings enable row level security;
alter table public.sync_events           enable row level security;


-- ============================================================================
-- STEP 7: RLS POLICIES
-- ============================================================================
-- Policy design:
--   - Authenticated users can only access their own rows (owner_id = auth.uid())
--   - No public read or write policies
--   - No service role instructions for frontend
--   - Separate policies for SELECT / INSERT / UPDATE / DELETE per table
--
-- IMPORTANT:
--   Authentication integration is required before production use.
--   These policies are backend-ready and must be reviewed before live deployment.

-- ── clients ──────────────────────────────────────────────────────────────────
create policy "clients_select_own"  on public.clients for select  using (owner_id = auth.uid());
create policy "clients_insert_own"  on public.clients for insert  with check (owner_id = auth.uid());
create policy "clients_update_own"  on public.clients for update  using (owner_id = auth.uid());
create policy "clients_delete_own"  on public.clients for delete  using (owner_id = auth.uid());

-- ── reports ──────────────────────────────────────────────────────────────────
create policy "reports_select_own"  on public.reports for select  using (owner_id = auth.uid());
create policy "reports_insert_own"  on public.reports for insert  with check (owner_id = auth.uid());
create policy "reports_update_own"  on public.reports for update  using (owner_id = auth.uid());
create policy "reports_delete_own"  on public.reports for delete  using (owner_id = auth.uid());

-- ── evidence_items ────────────────────────────────────────────────────────────
create policy "evidence_select_own" on public.evidence_items for select  using (owner_id = auth.uid());
create policy "evidence_insert_own" on public.evidence_items for insert  with check (owner_id = auth.uid());
create policy "evidence_update_own" on public.evidence_items for update  using (owner_id = auth.uid());
create policy "evidence_delete_own" on public.evidence_items for delete  using (owner_id = auth.uid());

-- ── assessment_snapshots ──────────────────────────────────────────────────────
create policy "snapshots_select_own" on public.assessment_snapshots for select  using (owner_id = auth.uid());
create policy "snapshots_insert_own" on public.assessment_snapshots for insert  with check (owner_id = auth.uid());
create policy "snapshots_update_own" on public.assessment_snapshots for update  using (owner_id = auth.uid());
create policy "snapshots_delete_own" on public.assessment_snapshots for delete  using (owner_id = auth.uid());

-- ── agency_settings ──────────────────────────────────────────────────────────
create policy "agency_select_own"   on public.agency_settings for select  using (owner_id = auth.uid());
create policy "agency_insert_own"   on public.agency_settings for insert  with check (owner_id = auth.uid());
create policy "agency_update_own"   on public.agency_settings for update  using (owner_id = auth.uid());
create policy "agency_delete_own"   on public.agency_settings for delete  using (owner_id = auth.uid());

-- ── white_label_settings ─────────────────────────────────────────────────────
create policy "wl_select_own"       on public.white_label_settings for select  using (owner_id = auth.uid());
create policy "wl_insert_own"       on public.white_label_settings for insert  with check (owner_id = auth.uid());
create policy "wl_update_own"       on public.white_label_settings for update  using (owner_id = auth.uid());
create policy "wl_delete_own"       on public.white_label_settings for delete  using (owner_id = auth.uid());

-- ── product_mode_settings ─────────────────────────────────────────────────────
create policy "pms_select_own"      on public.product_mode_settings for select  using (owner_id = auth.uid());
create policy "pms_insert_own"      on public.product_mode_settings for insert  with check (owner_id = auth.uid());
create policy "pms_update_own"      on public.product_mode_settings for update  using (owner_id = auth.uid());
create policy "pms_delete_own"      on public.product_mode_settings for delete  using (owner_id = auth.uid());

-- ── sync_events ───────────────────────────────────────────────────────────────
create policy "sync_select_own"     on public.sync_events for select  using (owner_id = auth.uid());
create policy "sync_insert_own"     on public.sync_events for insert  with check (owner_id = auth.uid());
create policy "sync_update_own"     on public.sync_events for update  using (owner_id = auth.uid());
create policy "sync_delete_own"     on public.sync_events for delete  using (owner_id = auth.uid());


-- ============================================================================
-- STEP 8: VERIFICATION QUERIES
-- (Run these to confirm schema, RLS, and policies are correctly applied)
-- ============================================================================

-- List all tables created by this script
select table_name, table_type
from   information_schema.tables
where  table_schema = 'public'
  and  table_name in (
    'clients', 'reports', 'evidence_items', 'assessment_snapshots',
    'agency_settings', 'white_label_settings', 'product_mode_settings', 'sync_events'
  )
order by table_name;

-- Confirm RLS is enabled (rowsecurity = true)
select tablename, rowsecurity
from   pg_tables
where  schemaname = 'public'
  and  tablename in (
    'clients', 'reports', 'evidence_items', 'assessment_snapshots',
    'agency_settings', 'white_label_settings', 'product_mode_settings', 'sync_events'
  )
order by tablename;

-- Confirm policies exist and their definitions
select schemaname, tablename, policyname, permissive, roles, cmd
from   pg_policies
where  schemaname = 'public'
  and  tablename in (
    'clients', 'reports', 'evidence_items', 'assessment_snapshots',
    'agency_settings', 'white_label_settings', 'product_mode_settings', 'sync_events'
  )
order by tablename, policyname;

-- Confirm trigger function exists
select routine_name, routine_type
from   information_schema.routines
where  routine_schema = 'public'
  and  routine_name = 'update_updated_at_column';

-- Confirm triggers exist
select trigger_name, event_object_table, event_manipulation, action_timing
from   information_schema.triggers
where  trigger_schema = 'public'
order by event_object_table, trigger_name;

-- Confirm indexes
select indexname, tablename, indexdef
from   pg_indexes
where  schemaname = 'public'
  and  tablename in (
    'clients', 'reports', 'evidence_items', 'assessment_snapshots',
    'agency_settings', 'white_label_settings', 'product_mode_settings', 'sync_events'
  )
order by tablename, indexname;


-- ============================================================================
-- STEP 9: ROLLBACK (COMMENTED — DO NOT RUN UNLESS REQUIRED)
-- ============================================================================
-- ⚠ WARNING: The following commands are DESTRUCTIVE.
-- ⚠ Only execute if you need to completely remove this schema.
-- ⚠ All data in these tables will be permanently deleted.
-- ⚠ This action cannot be undone.
-- ⚠ Ensure all data is exported/backed up before proceeding.
--
-- -- Drop policies first
-- drop policy if exists "clients_select_own"  on public.clients;
-- drop policy if exists "clients_insert_own"  on public.clients;
-- drop policy if exists "clients_update_own"  on public.clients;
-- drop policy if exists "clients_delete_own"  on public.clients;
-- drop policy if exists "reports_select_own"  on public.reports;
-- drop policy if exists "reports_insert_own"  on public.reports;
-- drop policy if exists "reports_update_own"  on public.reports;
-- drop policy if exists "reports_delete_own"  on public.reports;
-- drop policy if exists "evidence_select_own" on public.evidence_items;
-- drop policy if exists "evidence_insert_own" on public.evidence_items;
-- drop policy if exists "evidence_update_own" on public.evidence_items;
-- drop policy if exists "evidence_delete_own" on public.evidence_items;
-- drop policy if exists "snapshots_select_own" on public.assessment_snapshots;
-- drop policy if exists "snapshots_insert_own" on public.assessment_snapshots;
-- drop policy if exists "snapshots_update_own" on public.assessment_snapshots;
-- drop policy if exists "snapshots_delete_own" on public.assessment_snapshots;
-- drop policy if exists "agency_select_own"   on public.agency_settings;
-- drop policy if exists "agency_insert_own"   on public.agency_settings;
-- drop policy if exists "agency_update_own"   on public.agency_settings;
-- drop policy if exists "agency_delete_own"   on public.agency_settings;
-- drop policy if exists "wl_select_own"       on public.white_label_settings;
-- drop policy if exists "wl_insert_own"       on public.white_label_settings;
-- drop policy if exists "wl_update_own"       on public.white_label_settings;
-- drop policy if exists "wl_delete_own"       on public.white_label_settings;
-- drop policy if exists "pms_select_own"      on public.product_mode_settings;
-- drop policy if exists "pms_insert_own"      on public.product_mode_settings;
-- drop policy if exists "pms_update_own"      on public.product_mode_settings;
-- drop policy if exists "pms_delete_own"      on public.product_mode_settings;
-- drop policy if exists "sync_select_own"     on public.sync_events;
-- drop policy if exists "sync_insert_own"     on public.sync_events;
-- drop policy if exists "sync_update_own"     on public.sync_events;
-- drop policy if exists "sync_delete_own"     on public.sync_events;
--
-- -- Drop tables (child tables before parent tables)
-- drop table if exists public.sync_events             cascade;
-- drop table if exists public.product_mode_settings   cascade;
-- drop table if exists public.white_label_settings    cascade;
-- drop table if exists public.agency_settings         cascade;
-- drop table if exists public.assessment_snapshots    cascade;
-- drop table if exists public.evidence_items          cascade;
-- drop table if exists public.reports                 cascade;
-- drop table if exists public.clients                 cascade;
--
-- -- Drop trigger function
-- drop function if exists public.update_updated_at_column() cascade;
--
-- ============================================================================
-- END OF ROLLBACK SECTION
-- ============================================================================


-- ============================================================================
-- END OF FILE
-- ============================================================================
-- Quantum Compliance OS™ · Run 15 — Backend Connectors + Live Sync Layer
-- Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™
-- RLS STATUS: ENABLED on all 8 tables.
-- Authentication required before production deployment.
-- Review all policies with a qualified Supabase administrator.
-- ============================================================================
