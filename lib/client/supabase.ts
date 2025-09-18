/**
 * Supabase client uses Latitude.sh Databases — Supabase Addon (DBaaS).
 * This is a product I built at Latitude.sh (https://latitude.sh).
*/
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}