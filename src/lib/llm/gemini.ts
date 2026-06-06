import { GoogleGenAI } from '@google/genai'
import type { ClienteLLM } from '@/mapeador/types'

// Borda do produto: o adaptador real da fronteira LLM (slice 05). É o ÚNICO
// arquivo que conhece um provider concreto. O `mapear` puro recebe esta função
// injetada e faz o resto (prompt, parse, validação) — trocar de provider é
// reescrever só este one-liner. Efeito colateral (rede, chave) fica aqui, na borda.

// Modelo pequeno do free tier do Gemini — folgado de sobra pro volume (uma
// captura/semana). Trocável por outro flash sem tocar em mais nada.
// Por que este: smoke test mostrou 2.0-flash com cota grátis zerada nesta conta
// e 2.5-flash-lite devolvendo horas como string ("2h"); 2.5-flash devolve número.
const MODELO = 'gemini-2.5-flash'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' })

/**
 * Implementa `ClienteLLM`: recebe o prompt pronto, devolve o texto cru (JSON).
 * `responseMimeType: 'application/json'` força JSON válido sem cercas markdown —
 * é o que aposenta a dívida de parse do slice 05 sem mexer na assinatura da fronteira.
 */
export const clienteGemini: ClienteLLM = async (prompt) => {
  const resposta = await ai.models.generateContent({
    model: MODELO,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  })
  const texto = resposta.text
  if (!texto) throw new Error('Gemini devolveu resposta vazia.')
  return texto
}
