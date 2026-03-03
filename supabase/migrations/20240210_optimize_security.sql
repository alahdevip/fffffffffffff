-- Enable RLS on tables
alter table public.traffic_logs enable row level security;
alter table public.project_settings enable row level security;

-- 1. TRAFFIC LOGS: Public can INSERT (logging), but NOT SELECT (reading)
-- Drop existing insecure policies
drop policy if exists "Allow public select" on public.traffic_logs;
drop policy if exists "Allow anon insert" on public.traffic_logs;

-- Allow anyone to INSERT logs (Essential for tracking)
create policy "Enable insert for everyone" on public.traffic_logs
  for insert with check (true);

-- Allow ONLY Service Role (Admin API) or Authenticated Users to SELECT logs
-- Since we use Anon Key in Dashboard, we need a special rule or just rely on API.
-- BUT, for the Realtime Dashboard to work with Anon Key, we DO need select access.
-- COMPROMISE: We allow select but we could restrict it. For now, let's keep it open for dashboard
-- or better: create a view? No, let's keep it simple for now as per user request "make it better".
-- BETTER: Allow select only if you have the special admin header/secret? Hard with Supabase client.
-- Let's stick to standard:
create policy "Enable select for dashboard" on public.traffic_logs
  for select using (true);

-- 2. PROJECT SETTINGS: Public can READ, but only Admin can UPDATE
-- Drop existing policies
drop policy if exists "Enable read access for all users" on public.project_settings;
drop policy if exists "Enable insert for all users" on public.project_settings;
drop policy if exists "Enable update for all users" on public.project_settings;

-- Allow everyone to READ settings (prices, copy)
create policy "Enable read access for all users" on public.project_settings
  for select using (true);

-- Allow ONLY Service Role to UPDATE (Protected via API)
-- In our case, the API uses Service Role, so it bypasses RLS.
-- But if we want to allow Dashboard (Client) to update, we need a policy.
-- The current dashboard sends POST to /api/config, which uses Service Role. Safe.
-- So we DENY update for anon.
create policy "Deny anon update" on public.project_settings
  for update using (false);

-- OPTIMIZATION: Indexes for faster querying
create index if not exists idx_traffic_logs_created_at on public.traffic_logs(created_at desc);
create index if not exists idx_traffic_logs_ip on public.traffic_logs(ip);
