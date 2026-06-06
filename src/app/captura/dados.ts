// Dados que viajam da extração para a confirmação, num só hop pela URL (base64).
// Módulo comum (sem 'use server') — num arquivo de Server Actions todo export
// precisa ser função async, e isto aqui é tipo + helper síncrono.
export interface DadosConfirmacao {
  projeto: string
  data: string
  texto: string
  atividades: { categoria: string; horas: number }[]
  descartes: { categoria: string }[]
}

export function decodificar(d: string): DadosConfirmacao {
  return JSON.parse(Buffer.from(d, 'base64url').toString('utf8')) as DadosConfirmacao
}
