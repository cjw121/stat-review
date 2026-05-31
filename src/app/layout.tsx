import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { NavBar } from '@/components/NavBar'
import { GoogleFontsLink } from '@/components/GoogleFontsLink'

export const metadata: Metadata = {
  title: '保研统计备考站 — 应用统计面试题库',
  description: '应用统计 / 统计学方向保研面试备考，含数学分析、高等代数、概率论题库，支持随机抽题、公式渲染与收藏标记。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <GoogleFontsLink />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <NavBar />
            <main className="flex-1">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
