-- Each post stores the public URL of the avatar copy taken when it was shared.
alter table public.posts add column if not exists avatar_url text;
