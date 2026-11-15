-- Run after 001_create_posts.sql: lets a post carry a photo.
alter table public.posts add column if not exists image_url text;

-- Allow photo-only posts (message may be empty), still capped at 280 characters.
alter table public.posts alter column message drop not null;
alter table public.posts drop constraint if exists posts_message_check;
alter table public.posts add constraint posts_message_check
  check (message is null or char_length(message) <= 280);
