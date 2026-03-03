// @ts-nocheck
import { createClient } from 'jsr:@supabase/supabase-js@2';

export const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
export const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
export const supabase = createClient(supabaseUrl, supabaseKey);
