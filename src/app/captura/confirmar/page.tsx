import Link from 'next/link'
import { projetos, type ProjetoId } from '@/config'
import { salvarAtividades } from '../actions'
import { decodificar } from '../dados'

const ESTILO = { fontFamily: 'system-ui, sans-serif' }

export default async function ConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>
}) {
  const { d } = await searchParams
  if (!d) {
    return (
      <main style={{ ...ESTILO, maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}>
        <p>Nada para confirmar. <Link href="/captura">Voltar à captura</Link>.</p>
      </main>
    )
  }

  const dados = decodificar(d)
  const config = projetos[dados.projeto as ProjetoId]!

  return (
    <main style={{ ...ESTILO, maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}>
      <p>
        <Link href={`/captura?projeto=${dados.projeto}`}>← refazer captura</Link>
      </p>

      <h1>Confirmar atividades</h1>
      <p style={{ color: '#777' }}>
        {config.nome} · {dados.data}. Revise as horas antes de salvar.
      </p>
      <blockquote style={{ borderLeft: '3px solid #ddd', margin: '1rem 0', padding: '0.25rem 0.75rem', color: '#555' }}>
        {dados.texto}
      </blockquote>

      {dados.atividades.length === 0 ? (
        <p>Nenhuma atividade reconhecida no texto. <Link href={`/captura?projeto=${dados.projeto}`}>Tentar de novo</Link>.</p>
      ) : (
        <form action={salvarAtividades} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input type="hidden" name="projeto" value={dados.projeto} />
          <input type="hidden" name="data" value={dados.data} />
          <input type="hidden" name="texto" value={dados.texto} />
          <input type="hidden" name="total" value={dados.atividades.length} />

          {dados.atividades.map((a, i) => {
            const cat = config.vocabulario[a.categoria]
            const descricao = cat && !cat.descartada ? cat.descricaoOficial : ''
            return (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
                <input type="hidden" name={`cat-${i}`} value={a.categoria} />
                <div style={{ flex: 1 }}>
                  <strong>{a.categoria}</strong>
                  {descricao && <div style={{ color: '#777', fontSize: '0.85em' }}>{descricao}</div>}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input type="number" name={`horas-${i}`} defaultValue={a.horas} step="0.5" min="0.5" required style={{ width: 70 }} />
                  h
                </label>
              </div>
            )
          })}

          <button type="submit" style={{ padding: '0.4rem 0.8rem', cursor: 'pointer', width: 'fit-content' }}>
            Salvar {dados.atividades.length} atividade{dados.atividades.length > 1 ? 's' : ''}
          </button>
        </form>
      )}

      {dados.descartes.length > 0 && (
        <p style={{ marginTop: '1rem', color: '#a60' }}>
          Descartado (categoria excluída): {dados.descartes.map((x) => x.categoria).join(', ')}.
          O motor compensa essas horas com o coringa na geração.
        </p>
      )}
    </main>
  )
}
