import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sky Persia - リサイクル回収申込 | Recycling Pickup Request',
  description: 'スカイペルシアのリサイクル品回収申込フォーム | Sky Persia recycling item pickup submission form',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  )
}
