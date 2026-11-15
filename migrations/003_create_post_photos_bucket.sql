-- Public bucket for photos attached to wall posts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-photos', 'post-photos', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

-- No login: anyone can add a photo (new files only, no overwrite/delete). Reads are public.
create policy "post-photos insert" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'post-photos');
