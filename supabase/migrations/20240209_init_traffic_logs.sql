create table if not exists public.traffic_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  ip text,
  target_user text,
  city text,
  device text,
  event_type text,
  metadata jsonb
);

alter table public.traffic_logs enable row level security;

create policy "Allow anon insert" on public.traffic_logs
  for insert
  with check (true);

create policy "Allow public select" on public.traffic_logs
  for select
  using (true);
