-- One table holds every wall entry.
create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  author     text not null default 'Random Person',
  message    text not null check (char_length(message) between 1 and 280),
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx
  on public.posts (created_at desc);

-- Anyone (no login) can read and add posts; nobody can edit or delete.
alter table public.posts enable row level security;

create policy "posts are readable by everyone"
  on public.posts for select
  to anon, authenticated
  using (true);

create policy "posts can be added by everyone"
  on public.posts for insert
  to anon, authenticated
  with check (true);

-- Turn on Realtime for the table.
alter publication supabase_realtime add table public.posts;
