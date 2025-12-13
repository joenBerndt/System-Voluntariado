create table if not exists activity_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  entity_type text not null,
  entity_id text,
  description text,
  details jsonb,
  user_id text,
  user_name text,
  user_email text,
  timestamp timestamptz default now()
);

-- Habilitar RLS es una buena práctica
alter table activity_logs enable row level security;

-- Permitir lectura a todos (para el panel admin)
create policy "Permitir lectura para todos" on activity_logs for select using (true);

-- Permitir inserción a anon, authenticated y service_role
create policy "Permitir inserción" on activity_logs for insert with check (true);
