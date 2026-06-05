import type { ReactNode } from 'react'

export const metadata = {
  title: 'Relatórios de Frequência',
  description: 'Captura semanal em texto livre → relatório mensal no template fixo.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
