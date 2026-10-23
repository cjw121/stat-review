import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import { NavBar } from "@/components/NavBar"
import { GoogleFontsLink } from "@/components/GoogleFontsLink"

export const metadata: Metadata = {
  title: {
    default: "统计面试题库 · 保研应用统计备考站",
    template: "%s · 统计面试题库",
  },
  description: "面向应用统计与统计学保研面试的备考站，覆盖数学分析、高等代数、概率论与数理统计，支持随机抽题、公式渲染、收藏与间隔复习。",
  keywords: ["保研", "应用统计", "统计学", "数学分析", "高等代数", "概率论", "数理统计", "面试题"],
  openGraph: {
    title: "统计面试题库 · 保研应用统计备考站",
    description: "261 道高频保研面试题，系统拆解数学分析、高等代数与概率论。",
    type: "website",
    locale: "zh_CN",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#111211" },
  ],
  width: "device-width",
  initialScale: 1,
}

const themeInitScript = "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <GoogleFontsLink />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
