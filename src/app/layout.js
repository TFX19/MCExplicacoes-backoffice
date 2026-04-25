import './globals.css'

export const metadata = {
  title: 'Explicações — Backoffice',
  description: 'Gestão de explicações',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}
