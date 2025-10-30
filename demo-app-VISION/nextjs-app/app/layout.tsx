import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SmartBite',
  description: 'Identify dishes, ingredients, nutrition and recipes from a photo',
  icons: {
    icon: [
      { url: '/images/smartbite-logo.png', sizes: '64x64', type: 'image/png' },
      { url: '/images/smartbite-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/smartbite-logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/images/smartbite-logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [
      { url: '/images/smartbite-logo.png', sizes: '64x64', type: 'image/png' },
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