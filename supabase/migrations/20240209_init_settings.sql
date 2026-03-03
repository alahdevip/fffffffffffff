create table if not exists public.project_settings (
  id text primary key, -- usually 'global'
  updated_at timestamptz default now(),
  prices jsonb default '{"main": "37", "upsell1": "16.90", "upsell2": "12"}'::jsonb,
  copy jsonb default '{"main_title": "VIP Stalkea", "upsell1_title": "Ghost Mode"}'::jsonb,
  banned_ips text[] default array[]::text[],
  pixels jsonb default '{"facebook": "", "tiktok": ""}'::jsonb
);

alter table public.project_settings enable row level security;

create policy "Allow public read settings" on public.project_settings
  for select
  using (true);

create policy "Allow anon update settings" on public.project_settings
  for update
  using (true);

create policy "Allow anon insert settings" on public.project_settings
  for insert
  with check (true);

-- Initialize default settings if not exists
insert into public.project_settings (id)
values ('global')
on conflict (id) do nothing;
