'use server'

import { createClient } from '@/lib/supabase/server'
import { linhaParaAtividade } from '@/persistencia/mapa'
import type { Atividade, AtividadePatch, NovaAtividade } from '@/persistencia/types'

// Valida identidade no servidor. Toda ação passa por aqui — nunca confiar só
// no middleware (CVE-2025-29927). A RLS é a segunda trava: filtra as linhas
// por auth.uid(), então as queries abaixo não precisam repetir o user_id.
async function exigirUsuario() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Não autenticado.')
  return { supabase, user }
}

export async function criarAtividade(nova: NovaAtividade): Promise<Atividade> {
  const { supabase, user } = await exigirUsuario()
  const { data, error } = await supabase
    .from('atividades')
    .insert({
      user_id: user.id, // do servidor, nunca do cliente
      project_id: nova.projeto,
      date: nova.data,
      category: nova.categoria,
      hours: nova.horas,
      raw_text: nova.textoBruto ?? null,
      mapped_activity: nova.atividadeMapeada ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return linhaParaAtividade(data)
}

export async function listarAtividades(projeto: string): Promise<Atividade[]> {
  const { supabase } = await exigirUsuario()
  const { data, error } = await supabase
    .from('atividades')
    .select('*')
    .eq('project_id', projeto)
    .order('date', { ascending: true })
  if (error) throw new Error(error.message)
  return data.map(linhaParaAtividade)
}

export async function editarAtividade(id: string, patch: AtividadePatch): Promise<Atividade> {
  const { supabase } = await exigirUsuario()
  const campos: Record<string, unknown> = {}
  if (patch.data !== undefined) campos.date = patch.data
  if (patch.categoria !== undefined) campos.category = patch.categoria
  if (patch.horas !== undefined) campos.hours = patch.horas
  if (patch.textoBruto !== undefined) campos.raw_text = patch.textoBruto
  if (patch.atividadeMapeada !== undefined) campos.mapped_activity = patch.atividadeMapeada

  const { data, error } = await supabase
    .from('atividades')
    .update(campos)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return linhaParaAtividade(data)
}

export async function apagarAtividade(id: string): Promise<void> {
  const { supabase } = await exigirUsuario()
  const { error } = await supabase.from('atividades').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
