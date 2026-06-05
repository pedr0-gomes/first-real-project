import Link from 'next/link'
import { listarAtividades } from '@/app/actions/atividades'
import { projetos, type ProjetoId } from '@/config'
import { consolidar } from '@/motor/consolidar'
import { formatar } from '@/formatador/formatar'
import type { FlagSemana } from '@/motor/types'

const ESTILO = { fontFamily: 'system-ui, sans-serif' }

// Texto legível de cada flag (o motor sinaliza, a tela explica).
function descreverFlag(f: FlagSemana): string {
  switch (f.tipo) {
    case 'sem-atividade-real':
      return 'Sem atividade real capturada — preenchido só com grade e coringa.'
    case 'parcial-proporcional':
      return 'Semana parcial fechada por proporção — revisar à mão.'
    case 'acima-do-alvo':
      return `Horas reais (${f.real}h) acima do alvo (${f.alvo}h).`
    case 'carga-incompleta':
      return `Coringa não fechou a carga — faltam ${f.faltam}h.`
  }
}

export default async function RelatorioPage({
  searchParams,
}: {
  searchParams: Promise<{ projeto?: string; mes?: string }>
}) {
  const { projeto, mes } = await searchParams
  const projetoId: ProjetoId = projeto === 'cc0002' ? 'cc0002' : 'loobi'
  const config = projetos[projetoId]!

  // Mês via ?mes=YYYY-MM; default = mês corrente (UTC). Formato inválido cai no atual.
  const agora = new Date()
  const m = /^(\d{4})-(\d{2})$/.exec(mes ?? '')
  const ano = m ? Number(m[1]) : agora.getUTCFullYear()
  const mesNum = m ? Number(m[2]) : agora.getUTCMonth() + 1
  const mesStr = `${ano}-${String(mesNum).padStart(2, '0')}`

  // listarAtividades traz tudo do projeto; o motor recorta ao mês (ADR 0002).
  const atividades = await listarAtividades(projetoId)
  const consolidacao = consolidar(atividades, config, { ano, mes: mesNum })
  const relatorio = formatar(consolidacao, config)

  const semanasComFlags = consolidacao.semanas.filter((s) => s.flags.length > 0)

  return (
    <main style={{ ...ESTILO, maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <p>
        <Link href={`/atividades?projeto=${projetoId}`}>← atividades</Link>
        {' · '}
        <Link href="/">início</Link>
      </p>

      <h1>Relatório</h1>

      {/* Trocar de projeto preserva o mês. */}
      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {Object.values(projetos).map((p) => (
          <Link
            key={p.id}
            href={`/relatorio?projeto=${p.id}&mes=${mesStr}`}
            style={{ fontWeight: p.id === projetoId ? 700 : 400 }}
          >
            {p.nome}
          </Link>
        ))}
      </nav>

      {/* Escolher o mês = navegar (form GET, sem JS de cliente). */}
      <form method="GET" action="/relatorio" style={{ display: 'flex', gap: '0.5rem', alignItems: 'end', marginBottom: '1.5rem' }}>
        <input type="hidden" name="projeto" value={projetoId} />
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Mês
          <input type="month" name="mes" defaultValue={mesStr} />
        </label>
        <button type="submit" style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
          Gerar
        </button>
      </form>

      <pre
        style={{
          whiteSpace: 'pre-wrap',
          background: '#f6f6f6',
          border: '1px solid #ddd',
          borderRadius: 4,
          padding: '1rem',
          fontFamily: 'ui-monospace, monospace',
          fontSize: '0.9rem',
        }}
      >
        {relatorio}
      </pre>

      {semanasComFlags.length > 0 && (
        <section style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem' }}>Revisar</h2>
          {semanasComFlags.map((s) => (
            <div key={s.indice} style={{ marginBottom: '0.5rem' }}>
              <strong>Semana {s.indice}</strong>
              <ul style={{ margin: '0.25rem 0' }}>
                {s.flags.map((f, i) => (
                  <li key={i} style={{ color: '#a60' }}>
                    {descreverFlag(f)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
