import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_API_SERVICE_ROLE_KEY!;
  return createSupabaseClient(url, serviceKey);
}


