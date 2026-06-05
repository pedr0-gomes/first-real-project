import { NextResponse, type NextRequest } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// Atalho de DESENVOLVIMENTO. Loga sem e-mail (driblando o rate limit do plano
// free do Supabase) usando a service_role para gerar um token e trocá-lo por
// sessão via verifyOtp — caminho que não depende do code_verifier do PKCE.
//
// SEGURANÇA: morre fora de desenvolvimento (404) e depende da SUPABASE_SECRET_KEY,
// que só existe no .env.local local. NUNCA vai para produção.
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not found', { status: 404 })
  }

  const secret = process.env.SUPABASE_SECRET_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!secret || !url) {
    return new NextResponse('Faltam SUPABASE_SECRET_KEY / NEXT_PUBLIC_SUPABASE_URL.', {
      status: 500,
    })
  }

  const { searchParams, origin } = new URL(request.url)
  const email = searchParams.get('email') ?? 'gomes.pedro@aluno.ufca.edu.br'
  const next = searchParams.get('next') ?? '/atividades'

  // Admin: gera o token do magic link sem enviar e-mail.
  const admin = createAdminClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
  if (error || !data.properties) {
    return new NextResponse(`Falha ao gerar link: ${error?.message ?? 'sem properties'}`, {
      status: 500,
    })
  }

  // Cliente do app: troca o token por sessão e grava nos cookies.
  const supabase = await createClient()
  const { error: erroVerify } = await supabase.auth.verifyOtp({
    type: 'email',
    token_hash: data.properties.hashed_token,
  })
  if (erroVerify) {
    return new NextResponse(`Falha ao logar: ${erroVerify.message}`, { status: 500 })
  }

  return NextResponse.redirect(`${origin}${next}`)
}
