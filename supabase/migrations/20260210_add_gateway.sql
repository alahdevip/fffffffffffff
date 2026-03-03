
alter table public.project_settings 
add column if not exists active_gateway text default 'syncpay';
