'use server'

import { revalidatePath } from 'next/cache'
import { criarAtividade, apagarAtividade } from '@/app/actions/atividades'
import { projetos, type ProjetoId } from '@/config'

// Validação no servidor: o form só oferece categorias ativas, mas nunca
// confiamos no cliente. Projeto existe? Categoria ativa nesse projeto? Horas > 0?
export async function adicionarAtividade(formData: FormData) {
  const projeto = String(formData.get('projeto') ?? '')
  const categoria = String(formData.get('categoria') ?? '')
  const data = String(formData.get('data') ?? '')
  const horas = Number(formData.get('horas'))

  const config = projetos[projeto as ProjetoId]
  if (!config) throw new Error('Projeto inválido.')

  const cat = config.vocabulario[categoria]
  if (!cat || cat.descartada) throw new Error('Categoria inválida para este projeto.')
  if (!data) throw new Error('Data obrigatória.')
  if (!Number.isFinite(horas) || horas <= 0) throw new Error('Horas devem ser maiores que zero.')

  await criarAtividade({ projeto, data, categoria, horas })
  revalidatePath('/atividades')
}

export async function removerAtividade(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (id) await apagarAtividade(id)
  revalidatePath('/atividades')
}
