import { createClient } from "./client";

export type StorageBucket =
  | "inspection-photos"
  | "voice-notes"
  | "reports"
  | "thumbnails";

/**
 * Upload a photo to the inspection-photos bucket
 * Path format: userId/inspectionId/filename
 */
export async function uploadPhoto(
  userId: string,
  inspectionId: string,
  file: File
): Promise<{ path: string; url: string }> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${userId}/${inspectionId}/${fileName}`;

  const { error } = await supabase.storage
    .from("inspection-photos")
    .upload(filePath, file);

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("inspection-photos").getPublicUrl(filePath);

  return { path: filePath, url: publicUrl };
}

/**
 * Upload a voice note to the voice-notes bucket
 * Path format: userId/inspectionId/filename
 */
export async function uploadVoiceNote(
  userId: string,
  inspectionId: string,
  blob: Blob
): Promise<{ path: string }> {
  const supabase = createClient();
  const fileName = `${crypto.randomUUID()}.webm`;
  const filePath = `${userId}/${inspectionId}/${fileName}`;

  const { error } = await supabase.storage
    .from("voice-notes")
    .upload(filePath, blob);

  if (error) throw error;
  return { path: filePath };
}

/**
 * Upload a report to the reports bucket
 * Path format: userId/inspectionId/filename
 */
export async function uploadReport(
  userId: string,
  inspectionId: string,
  blob: Blob,
  fileName: string
): Promise<{ path: string }> {
  const supabase = createClient();
  const filePath = `${userId}/${inspectionId}/${fileName}`;

  const { error } = await supabase.storage.from("reports").upload(filePath, blob);

  if (error) throw error;
  return { path: filePath };
}

/**
 * Upload a thumbnail to the thumbnails bucket
 * Path format: userId/inspectionId/filename
 */
export async function uploadThumbnail(
  userId: string,
  inspectionId: string,
  file: File | Blob
): Promise<{ path: string; url: string }> {
  const supabase = createClient();
  const fileName = `${crypto.randomUUID()}.webp`;
  const filePath = `${userId}/${inspectionId}/${fileName}`;

  const { error } = await supabase.storage
    .from("thumbnails")
    .upload(filePath, file);

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("thumbnails").getPublicUrl(filePath);

  return { path: filePath, url: publicUrl };
}

/**
 * Get a signed URL for accessing private bucket files
 * Use this for inspection-photos, voice-notes, and reports
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn = 3600
): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Get the public URL for a file (only works for public buckets like thumbnails)
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

/**
 * Delete a file from a storage bucket
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/**
 * Delete multiple files from a storage bucket
 */
export async function deleteFiles(
  bucket: StorageBucket,
  paths: string[]
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
}

/**
 * List files in a folder within a bucket
 */
export async function listFiles(
  bucket: StorageBucket,
  folderPath: string
): Promise<{ name: string; id: string; created_at: string }[]> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucket).list(folderPath);

  if (error) throw error;
  return data.map((file) => ({
    name: file.name,
    id: file.id || "",
    created_at: file.created_at || "",
  }));
}

/**
 * Download a file from a storage bucket
 */
export async function downloadFile(
  bucket: StorageBucket,
  path: string
): Promise<Blob> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) throw error;
  return data;
}
