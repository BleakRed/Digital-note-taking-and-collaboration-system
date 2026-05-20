import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || 'notion-clone-files';
export const USE_SUPABASE = !!(supabaseUrl && supabaseServiceRoleKey);

if (!USE_SUPABASE) {
  console.warn('Supabase not configured. Local file storage will be used.');
}

export const supabase = USE_SUPABASE
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : (null as unknown as ReturnType<typeof createClient>);
