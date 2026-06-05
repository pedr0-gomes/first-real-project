'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Envia o magic link. Cadastro fechado: shouldCreateUser=false → quem não tem
// conta não recebe nada (a conta do Pedro é criada à mão no dashboard).
export async function entrar(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) redirect('/login?erro=' + encodeURIComponent('Informe um e-mail.'))

  const supabase = await createClient()
  const origin = (await headers()).get('origin') ?? ''

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) redirect('/login?erro=' + encodeURIComponent(error.message))
  redirect('/login?enviado=1')
}

export async function sair() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
