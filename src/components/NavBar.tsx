'use client'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { getAllCourses } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const courses = getAllCourses()

export function NavBar() {
  const { theme, toggle } = useTheme()
  const { user, profile, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-primary text-lg shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span className="hidden sm:inline">保研统计备考站</span>
          <span className="sm:hidden">备考站</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm text-muted">
          {courses.map((c) => (
            <Link key={c.id} href={`/course/${c.id}`} className="hover:text-primary transition-colors duration-150">
              {c.title}
            </Link>
          ))}
          <Link href="/quiz" className="hover:text-primary transition-colors duration-150">随机抽题</Link>
          <Link href="/search" className="hover:text-primary transition-colors duration-150">搜索</Link>
          {user && (
            <>
              <Link href="/review" className="hover:text-primary transition-colors duration-150">复习</Link>
              <Link href="/dashboard" className="hover:text-primary transition-colors duration-150">统计</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label="切换深色/浅色模式"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-fg hover:bg-page transition-all duration-150"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Auth area */}
          {!loading && (
            user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-1.5 text-sm text-fg font-medium px-3 py-1.5 rounded-lg hover:bg-page transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    {(profile?.username ?? user.email ?? '?')[0].toUpperCase()}
                  </span>
                  <span className="hidden sm:inline max-w-[80px] truncate">{profile?.username ?? '我'}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-lg py-1 w-36 z-50 text-sm">
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-fg hover:bg-page">学习统计</Link>
                    <Link href="/review" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-fg hover:bg-page">今日复习</Link>
                    <Link href="/bookmarks" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-fg hover:bg-page">收藏夹</Link>
                    <Link href="/auth/account" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-fg hover:bg-page">账号设置</Link>
                    <hr className="border-border my-1" />
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-rose-500 hover:bg-page">退出登录</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link href="/auth/login" className="text-sm text-muted hover:text-fg px-3 py-1.5 rounded-lg hover:bg-page transition-colors">登录</Link>
                <Link href="/auth/register" className="text-sm bg-primary-btn text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">注册</Link>
              </div>
            )
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="菜单"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-fg hover:bg-page transition-all duration-150"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-3 text-sm">
          {courses.map((c) => (
            <Link key={c.id} href={`/course/${c.id}`} onClick={() => setMenuOpen(false)} className="text-muted hover:text-primary transition-colors">
              {c.title}
            </Link>
          ))}
          <Link href="/quiz" onClick={() => setMenuOpen(false)} className="text-muted hover:text-primary transition-colors">随机抽题</Link>
          <Link href="/search" onClick={() => setMenuOpen(false)} className="text-muted hover:text-primary transition-colors">搜索</Link>
          <Link href="/bookmarks" onClick={() => setMenuOpen(false)} className="text-muted hover:text-primary transition-colors">收藏</Link>
          {user ? (
            <>
              <Link href="/review" onClick={() => setMenuOpen(false)} className="text-muted hover:text-primary transition-colors">今日复习</Link>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-muted hover:text-primary transition-colors">学习统计</Link>
              <Link href="/auth/account" onClick={() => setMenuOpen(false)} className="text-muted hover:text-primary transition-colors">账号设置</Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="text-primary font-medium">登录</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="text-primary font-medium">注册</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
