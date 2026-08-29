import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'


export const metadata: Metadata = {
  title: 'Texwich — 하루를 쌓는 텍스처 다이어리',
  description:
    '샌드위치처럼 내지를 쌓아 하루하루를 기록하는 콜라주 다이어리, Texwich (Texture + Swatch)',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#F3EFE3',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body class="antialiased">
        {children}
      </body>
    </html>
  )
}
