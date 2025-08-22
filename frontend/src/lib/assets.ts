import { supabase } from './supabase';

const HOMEPAGE_BUCKET = 'homePage';

type Transform = {
  width?: number;
  height?: number;
  resize?: 'cover' | 'contain';
  quality?: number;
  format?: 'webp' | 'jpeg';
};

export function assetUrl(path: string, transform?: Transform) {
  const options = transform ? { transform } : undefined;
  const { data } = supabase.storage.from(HOMEPAGE_BUCKET).getPublicUrl(path, options as any);
  return data.publicUrl;
}


