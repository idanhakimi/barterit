import { supabase } from '@/lib/supabase';

const UNSPLASH_PORTRAITS = [
  'photo-1554151228-14d9def656e4','photo-1500648767791-00dcc994a43e',
  'photo-1494790108377-be9c29b29330','photo-1507003211169-0a1dd7228f2d',
  'photo-1539571696357-5a69c17a67c6','photo-1544005313-94ddf0286df2',
  'photo-1531427186611-ecfd6d936c79','photo-1438761681033-6461ffad8d80',
  'photo-1534528741775-53994a69daeb','photo-1506794778202-cad84cf45f1d',
];

/**
 * Stub for GenerateImage – returns a random Unsplash portrait instead of
 * calling an AI image API (BASE44-specific feature not available in Supabase).
 */
export async function GenerateImage({ prompt } = {}) {
  const id = UNSPLASH_PORTRAITS[Math.floor(Math.random() * UNSPLASH_PORTRAITS.length)];
  return { url: `https://images.unsplash.com/${id}?q=80&w=400&h=400&auto=format&fit=crop` };
}

/**
 * Upload a file to Supabase Storage.
 * Mirrors the BASE44 UploadFile({ file }) → { file_url } API.
 * Files are stored in the 'avatars' bucket (public).
 */
export async function UploadFile({ file, bucket = 'avatars', folder = 'profiles' }) {
  if (!file) throw new Error('No file provided');

  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return { file_url: data.publicUrl };
}
