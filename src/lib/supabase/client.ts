import { createBrowserClient } from '@supabase/ssr'

// Cliente de browser: usa a publishable key + a sessão do usuário.
// A RLS continua valendo — a publishable key não fura policy.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
