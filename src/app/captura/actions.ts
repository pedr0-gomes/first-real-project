'use server'

import { redirect } from 'next/navigation'
import { criarAtividade } from '@/app/actions/atividades'
import { projetos, type ProjetoId } from '@/config'
import { clienteGemini } from '@/lib/llm/gemini'
import { mapear } from '@/mapeador/mapear'
import type { DadosConfirmacao } from './dados'

// Passo 1: texto livre → LLM (NL→structured) → tela de confirmação. Nada é salvo
// aqui. A data é uma só (a da captura), atribuída agora — o mapeador sai sem data.
export async function extrairAtividades(formData: FormData) {
  const projeto = String(formData.get('projeto') ?? '')
  const data = String(formData.get('data') ?? '')
  const texto = String(formData.get('texto') ?? '').trim()

  const config = projetos[projeto as ProjetoId]
  if (!config) throw new Error('Projeto inválido.')
  if (!data) throw new Error('Data obrigatória.')
  if (!texto) throw new Error('Escreva o que você fez.')

  const { atividades, descartes } = await mapear(texto, config, clienteGemini)

  const dados: DadosConfirmacao = {
    projeto,
    data,
    texto,
    atividades: atividades.map((a) => ({ categoria: a.categoria, horas: a.horas })),
    descartes,
  }
  const d = Buffer.from(JSON.stringify(dados)).toString('base64url')
  redirect(`/captura/confirmar?d=${d}`)
}

// Passo 2: salvar SÓ as atividades reais (grade e coringa não viram linha — são
// derivados de config/motor). Horas vêm do form (Pedro pôde editar). Mesma
// validação server-side da entrada manual: categoria ativa, horas > 0.
export async function salvarAtividades(formData: FormData) {
  const projeto = String(formData.get('projeto') ?? '')
  const data = String(formData.get('data') ?? '')
  const texto = String(formData.get('texto') ?? '')
  const total = Number(formData.get('total'))

  const config = projetos[projeto as ProjetoId]
  if (!config) throw new Error('Projeto inválido.')
  if (!data) throw new Error('Data obrigatória.')

  for (let i = 0; i < total; i++) {
    const categoria = String(formData.get(`cat-${i}`) ?? '')
    const horas = Number(formData.get(`horas-${i}`))

    const cat = config.vocabulario[categoria]
    if (!cat || cat.descartada) throw new Error('Categoria inválida para este projeto.')
    if (!Number.isFinite(horas) || horas <= 0) throw new Error('Horas devem ser maiores que zero.')

    await criarAtividade({ projeto, data, categoria, horas, textoBruto: texto })
  }

  redirect(`/atividades?projeto=${projeto}`)
}
