-- Public bucket for avatar copies; one new file per shared post.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- No login: anyone can add an avatar copy (new files only, no overwrite/delete). Reads are public.
create policy "avatars insert" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'avatars');
