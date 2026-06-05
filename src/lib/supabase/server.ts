import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente de servidor: roda como o usuário logado (lê a sessão dos cookies),
// então a RLS do Postgres filtra as linhas. Usar em Server Components e
// Server Actions. Toda Server Action ainda deve chamar `auth.getUser()`
// para validar identidade no servidor (CVE-2025-29927).
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Chamado de um Server Component, que não pode escrever cookies.
            // Ignorável quando o middleware está refrescando a sessão.
          }
        },
      },
    },
  )
}
