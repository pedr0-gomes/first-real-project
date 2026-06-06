import Link from 'next/link'
import { projetos, type ProjetoId } from '@/config'
import { extrairAtividades } from './actions'

const ESTILO = { fontFamily: 'system-ui, sans-serif' }

export default async function CapturaPage({
  searchParams,
}: {
  searchParams: Promise<{ projeto?: string }>
}) {
  const { projeto } = await searchParams
  const projetoId: ProjetoId = projeto === 'cc0002' ? 'cc0002' : 'loobi'
  const config = projetos[projetoId]!

  return (
    <main style={{ ...ESTILO, maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}>
      <p>
        <Link href="/">← início</Link>
        {' · '}
        <Link href={`/atividades?projeto=${projetoId}`}>entrada manual →</Link>
      </p>

      <h1>Captura por texto livre</h1>
      <p style={{ color: '#777' }}>
        Escreva o que você fez nesta data. O Gemini estrutura em atividades; você
        revisa e confirma antes de salvar.
      </p>

      {/* Trocar de projeto = navegar (sem JS de cliente). */}
      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {Object.values(projetos).map((p) => (
          <Link
            key={p.id}
            href={`/captura?projeto=${p.id}`}
            style={{ fontWeight: p.id === projetoId ? 700 : 400 }}
          >
            {p.nome}
          </Link>
        ))}
      </nav>

      <form action={extrairAtividades} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input type="hidden" name="projeto" value={projetoId} />
        <label style={{ display: 'flex', flexDirection: 'column', width: 'fit-content' }}>
          Data
          <input type="date" name="data" required />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          O que você fez
          <textarea
            name="texto"
            required
            rows={5}
            placeholder="Ex: gravei um episódio de podcast de 2h e tive reunião com a equipe."
            style={{ fontFamily: 'inherit', padding: '0.5rem' }}
          />
        </label>
        <button type="submit" style={{ padding: '0.4rem 0.8rem', cursor: 'pointer', width: 'fit-content' }}>
          Extrair atividades →
        </button>
      </form>
    </main>
  )
}
