import Link from 'next/link'
import { redirect } from 'next/navigation'
import { sair } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  // Trava de verdade: sem sessão válida no servidor, não passa daqui.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Relatórios de Frequência</h1>
      <p>Logado como {user.email}.</p>
      <p>
        <Link href="/atividades">Capturar atividades →</Link>
      </p>
      <form action={sair}>
        <button type="submit" style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
          Sair
        </button>
      </form>
    </main>
  )
}
