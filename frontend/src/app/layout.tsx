import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#E8F4FD',
}

export const metadata: Metadata = {
  title: 'Reporta Viseu - Comunique Problemas na Cidade',
  description: 'Aplicação de reporte de problemas urbanos para a cidade de Viseu. Comunique buracos, iluminação, lixo e outros problemas.',
  keywords: ['Viseu', 'câmara municipal', 'reporte', 'problemas', 'cidade', 'urbano'],
  authors: [{ name: 'Say What?' }],
  openGraph: {
    title: 'Reporta Viseu',
    description: 'Comunique problemas na sua cidade',
    type: 'website',
    locale: 'pt_PT',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className={poppins.variable}>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
