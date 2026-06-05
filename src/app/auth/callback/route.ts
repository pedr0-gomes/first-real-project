import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Recebe o clique do magic link (template padrão do Supabase): troca o `code`
// por uma sessão (cookies) e redireciona. Validamos aqui — não confiamos no
// link cegamente.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(
    `${origin}/login?erro=${encodeURIComponent('Link inválido ou expirado.')}`,
  )
}
