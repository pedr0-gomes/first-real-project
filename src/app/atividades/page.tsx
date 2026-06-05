import Link from 'next/link'
import { listarAtividades } from '@/app/actions/atividades'
import { projetos, type ProjetoId } from '@/config'
import { adicionarAtividade, removerAtividade } from './actions'

const ESTILO = { fontFamily: 'system-ui, sans-serif' }

export default async function AtividadesPage({
  searchParams,
}: {
  searchParams: Promise<{ projeto?: string }>
}) {
  const { projeto } = await searchParams
  const projetoId: ProjetoId = projeto === 'cc0002' ? 'cc0002' : 'loobi'
  // projetoId é sempre uma chave real (o ternário garante); o ! só satisfaz o
  // noUncheckedIndexedAccess diante da index signature inferida em `projetos`.
  const config = projetos[projetoId]!

  const atividades = await listarAtividades(projetoId)
  const categoriasAtivas = Object.entries(config.vocabulario)
    .filter(([, v]) => !v.descartada)
    .map(([nome]) => nome)

  return (
    <main style={{ ...ESTILO, maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}>
      <p>
        <Link href="/">← início</Link>
        {' · '}
        <Link href={`/relatorio?projeto=${projetoId}`}>gerar relatório →</Link>
      </p>

      <h1>Atividades</h1>

      {/* Trocar de projeto = navegar (sem JS de cliente). */}
      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {Object.values(projetos).map((p) => (
          <Link
            key={p.id}
            href={`/atividades?projeto=${p.id}`}
            style={{ fontWeight: p.id === projetoId ? 700 : 400 }}
          >
            {p.nome}
          </Link>
        ))}
      </nav>

      <form
        action={adicionarAtividade}
        style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'end', marginBottom: '1.5rem' }}
      >
        <input type="hidden" name="projeto" value={projetoId} />
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Data
          <input type="date" name="data" required />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Categoria
          <select name="categoria" required>
            {categoriasAtivas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Horas
          <input type="number" name="horas" step="0.5" min="0.5" required style={{ width: 80 }} />
        </label>
        <button type="submit" style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
          Adicionar
        </button>
      </form>

      {atividades.length === 0 ? (
        <p style={{ color: '#777' }}>Nenhuma atividade ainda neste projeto.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th>Data</th>
              <th>Categoria</th>
              <th>Horas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {atividades.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td>{a.data}</td>
                <td>{a.categoria}</td>
                <td>{a.horas}</td>
                <td>
                  <form action={removerAtividade}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" style={{ cursor: 'pointer' }}>
                      apagar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
