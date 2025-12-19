import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn("Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
}

// Create client with fallback empty strings (will fail gracefully)
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

export const STORAGE_BUCKETS = {
  AVATARS: "avatars",
  THUMBNAILS: "thumbnails",
  RESOURCES: "resources",
  CERTIFICATES: "certificates",
  ATTACHMENTS: "attachments",
} as const;

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
}
