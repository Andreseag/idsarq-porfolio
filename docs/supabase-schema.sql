-- =========================================================
-- Estudio K — Esquema Supabase (Leads + Proyectos)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- LEADS
-- ---------------------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  empresa text,
  email text not null,
  telefono text not null,
  tipo_proyecto text not null,
  metros text not null,
  presupuesto text not null,
  ciudad text not null,
  direccion text not null,
  fecha_estimada date,
  servicios text[] not null default '{}',
  comentarios text,
  status text not null default 'nuevo'
    check (status in ('nuevo','contactado','negociacion','cotizacion_enviada','aceptado','rechazado','perdido','convertido')),
  costo_sugerido numeric,
  costo_final numeric,
  costo_ajustado_manualmente boolean not null default false,
  asignado_a text,
  proximo_seguimiento date,
  tags text[] not null default '{}',
  converted_to_project_id uuid
);

create table if not exists lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  status text not null,
  changed_at timestamptz not null default now(),
  note text
);

create table if not exists lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  author text not null default 'Equipo',
  note text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- PROYECTOS
-- ---------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references leads(id) on delete set null,
  nombre_cliente text not null,
  email text,
  telefono text,
  tipo_proyecto text not null,
  ciudad text,
  direccion text,
  servicios text[] not null default '{}',
  costo_original numeric not null default 0,
  costo_actual numeric not null default 0,
  fecha_entrega_estimada date,
  porcentaje_avance int not null default 0 check (porcentaje_avance between 0 and 100),
  responsable text,
  status text not null default 'planeacion'
    check (status in ('planeacion','diseno','permisos','construccion','acabados','entregado','pausado','cancelado')),
  proximo_hito text
);

create table if not exists project_cost_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  costo numeric not null,
  motivo text,
  changed_at timestamptz not null default now()
);

create table if not exists project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  author text not null default 'Equipo',
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  fecha date not null default current_date,
  descripcion text not null,
  porcentaje_avance int,
  created_at timestamptz not null default now()
);

create table if not exists project_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  update_id uuid references project_updates(id) on delete set null,
  titulo text not null,
  file_path text not null, -- path dentro del bucket 'project-reports'
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- RLS
-- ---------------------------------------------------------
alter table leads enable row level security;
alter table lead_status_history enable row level security;
alter table lead_notes enable row level security;
alter table projects enable row level security;
alter table project_cost_history enable row level security;
alter table project_notes enable row level security;
alter table project_updates enable row level security;
alter table project_reports enable row level security;

-- El público (rol anon, formulario de cotización) SOLO puede insertar leads
create policy "public_insert_leads" on leads
  for insert to anon with check (true);

-- Usuarios autenticados (equipo admin) tienen acceso total
create policy "auth_all_leads" on leads
  for all to authenticated using (true) with check (true);
create policy "auth_all_lead_status_history" on lead_status_history
  for all to authenticated using (true) with check (true);
create policy "auth_all_lead_notes" on lead_notes
  for all to authenticated using (true) with check (true);
create policy "auth_all_projects" on projects
  for all to authenticated using (true) with check (true);
create policy "auth_all_project_cost_history" on project_cost_history
  for all to authenticated using (true) with check (true);
create policy "auth_all_project_notes" on project_notes
  for all to authenticated using (true) with check (true);
create policy "auth_all_project_updates" on project_updates
  for all to authenticated using (true) with check (true);
create policy "auth_all_project_reports" on project_reports
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------
-- STORAGE (crear manualmente en Dashboard → Storage si prefieres UI):
--   Bucket: project-reports  (privado, NO público)
-- Políticas del bucket (Storage → Policies):
--   - INSERT/SELECT/UPDATE/DELETE solo para rol authenticated
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('project-reports', 'project-reports', false)
  on conflict (id) do nothing;

create policy "auth_all_storage_reports" on storage.objects
  for all to authenticated
  using (bucket_id = 'project-reports')
  with check (bucket_id = 'project-reports');
