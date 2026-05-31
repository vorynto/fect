-- Migration v5: Fix Storage for image uploads
-- Run in Supabase SQL Editor

-- 1. Create the public upload bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fect-uploads',
  'fect-uploads',
  true,
  10485760,   -- 10 MB limit
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do update set public = true;

-- 2. Storage RLS policies
-- Allow public reads (needed to display images on the site)
create policy "Public read fect-uploads"
  on storage.objects for select
  using (bucket_id = 'fect-uploads');

-- Allow authenticated (admin) users to upload
create policy "Admin upload fect-uploads"
  on storage.objects for insert
  with check (bucket_id = 'fect-uploads' and auth.role() = 'authenticated');

-- Allow authenticated users to update/replace files
create policy "Admin update fect-uploads"
  on storage.objects for update
  using (bucket_id = 'fect-uploads' and auth.role() = 'authenticated');

-- Allow authenticated users to delete files
create policy "Admin delete fect-uploads"
  on storage.objects for delete
  using (bucket_id = 'fect-uploads' and auth.role() = 'authenticated');
