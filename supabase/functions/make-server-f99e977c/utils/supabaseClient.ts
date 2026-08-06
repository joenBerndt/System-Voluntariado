// @ts-nocheck
import { createClient } from 'jsr:@supabase/supabase-js@2';

export const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
export const supabaseKey = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
export const supabase = createClient(supabaseUrl, supabaseKey);
