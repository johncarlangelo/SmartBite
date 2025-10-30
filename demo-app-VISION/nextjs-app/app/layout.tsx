import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SmartBite',
  description: 'Identify dishes, ingredients, nutrition and recipes from a photo',
  icons: {
    icon: [
      { url: '/images/favicon.svg', sizes: '256x256', type: 'image/svg' }, // Large, high quality
      { url: '/images/favicon.svg', sizes: '192x192', type: 'image/svg' }, // Android Chrome
      { url: '/images/favicon.svg', sizes: '128x128', type: 'image/svg' }, // Chrome Web Store
      { url: '/images/favicon.svg', sizes: '96x96', type: 'image/svg' },   // Google TV
      { url: '/images/favicon.svg', sizes: '64x64', type: 'image/svg' },   // Standard
      { url: '/images/favicon.svg', sizes: '32x32', type: 'image/svg' },   // Taskbar
      { url: '/images/favicon.svg', sizes: '16x16', type: 'image/svg' },   // Browser tab
    ],
    apple: [
      { url: '/images/favicon.svg', sizes: '180x180', type: 'image/svg' }, // iPhone/iPad
      { url: '/images/favicon.svg', sizes: '152x152', type: 'image/svg' }, // iPad
      { url: '/images/favicon.svg', sizes: '120x120', type: 'image/svg' }, // iPhone
    ],
    shortcut: [
      { url: '/images/favicon.svg', sizes: '196x196', type: 'image/svg' }, // Android home screen (larger)
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 