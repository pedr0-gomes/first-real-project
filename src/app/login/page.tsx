import { entrar } from '@/app/actions/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; enviado?: string }>
}) {
  const { erro, enviado } = await searchParams

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 360, margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Entrar</h1>
      <p style={{ color: '#555' }}>Relatórios de Frequência</p>

      {enviado && (
        <p style={{ color: '#0a7' }}>Link enviado. Confira seu e-mail.</p>
      )}
      {erro && <p style={{ color: '#c00' }}>{erro}</p>}

      <form action={entrar} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
        <input
          type="email"
          name="email"
          required
          placeholder="seu@email.com"
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>
          Enviar link de acesso
        </button>
      </form>
    </main>
  )
}
