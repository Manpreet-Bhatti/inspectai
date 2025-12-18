-- supabase/migrations/00004_storage_buckets.sql

-- Create storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('inspection-photos', 'inspection-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('voice-notes', 'voice-notes', false, 52428800, array['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']),
  ('reports', 'reports', false, 52428800, array['application/pdf']),
  ('thumbnails', 'thumbnails', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- ============================================
-- Storage policies for inspection-photos bucket
-- ============================================

-- Users can upload photos to their own folder (userId/inspectionId/filename)
create policy "Users can upload photos to own inspections"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'inspection-photos' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own photos
create policy "Users can view own photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'inspection-photos' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own photos
create policy "Users can update own photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'inspection-photos' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own photos
create policy "Users can delete own photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'inspection-photos' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- Storage policies for voice-notes bucket
-- ============================================

-- Users can upload voice notes to their own folder
create policy "Users can upload voice notes to own inspections"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'voice-notes' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own voice notes
create policy "Users can view own voice notes"
on storage.objects for select
to authenticated
using (
  bucket_id = 'voice-notes' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own voice notes
create policy "Users can update own voice notes"
on storage.objects for update
to authenticated
using (
  bucket_id = 'voice-notes' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own voice notes
create policy "Users can delete own voice notes"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'voice-notes' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- Storage policies for reports bucket
-- ============================================

-- Users can upload reports to their own folder
create policy "Users can upload reports to own inspections"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'reports' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own reports
create policy "Users can view own reports"
on storage.objects for select
to authenticated
using (
  bucket_id = 'reports' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own reports
create policy "Users can update own reports"
on storage.objects for update
to authenticated
using (
  bucket_id = 'reports' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own reports
create policy "Users can delete own reports"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'reports' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- Storage policies for thumbnails bucket (public)
-- ============================================

-- Thumbnails are publicly readable (bucket is public)
-- But only authenticated users can upload to their own folder

-- Users can upload thumbnails to their own folder
create policy "Users can upload thumbnails to own inspections"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'thumbnails' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Anyone can view thumbnails (public bucket)
create policy "Anyone can view thumbnails"
on storage.objects for select
to public
using (bucket_id = 'thumbnails');

-- Users can update their own thumbnails
create policy "Users can update own thumbnails"
on storage.objects for update
to authenticated
using (
  bucket_id = 'thumbnails' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own thumbnails
create policy "Users can delete own thumbnails"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'thumbnails' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- Service role access
-- ============================================
-- Note: The service_role key automatically bypasses RLS
-- This allows the ML service to read/write files for processing
