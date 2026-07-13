create table if not exists public.fisiovision_analyses (
  id uuid primary key,
  consumer_id text not null,
  exercise_id text not null check (exercise_id in ('pilates-the-hundred','pilates-single-leg-stretch','pilates-swimming','pilates-swan','pilates-teaser')),
  status text not null check (status in ('queued','processing','completed','failed')),
  video_url text not null,
  idempotency_key text not null,
  callback_url text,
  metadata jsonb not null default '{}'::jsonb,
  result jsonb,
  error jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (consumer_id,idempotency_key)
);
create index if not exists fisiovision_analyses_queue_idx on public.fisiovision_analyses(status,created_at);
alter table public.fisiovision_analyses enable row level security;
revoke all on public.fisiovision_analyses from anon,authenticated;

create or replace function public.claim_fisiovision_analysis()
returns setof public.fisiovision_analyses
language plpgsql security definer set search_path=public as $$
declare selected_id uuid;
begin
  select id into selected_id from public.fisiovision_analyses
  where status='queued' order by created_at for update skip locked limit 1;
  if selected_id is null then return; end if;
  return query update public.fisiovision_analyses
    set status='processing',updated_at=now()
    where id=selected_id returning *;
end $$;
revoke all on function public.claim_fisiovision_analysis() from public,anon,authenticated;
grant execute on function public.claim_fisiovision_analysis() to service_role;
