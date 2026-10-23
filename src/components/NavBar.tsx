'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getAllCourses } from "@/lib/data"
import { useTheme } from "./ThemeProvider"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { CommandPalette } from "./CommandPalette"
import {
  BarChartIcon,
  BookmarkIcon,
  CommandIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  ShuffleIcon,
  SigmaIcon,
  SunIcon,
  XIcon,
} from "./icons"

const courses = getAllCourses()

export function NavBar() {
  const { theme, toggle } = useTheme()
  const { user, profile, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()



  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandOpen((v) => !v)
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-page/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-soft transition-transform duration-300 group-hover:-rotate-3">
            <SigmaIcon size={19} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold tracking-tight text-fg">统计面试题库</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">Stat Prep</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {courses.map((course) => {
            const active = pathname.startsWith("/course/" + course.id)
            return (
              <Link
                key={course.id}
                href={"/course/" + course.id}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  active ? "bg-subtle text-fg" : "text-muted hover:bg-subtle hover:text-fg",
                )}
              >
                {course.title}
              </Link>
            )
          })}
          <Link
            href="/quiz"
            className={cn(
              "rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === "/quiz" ? "bg-subtle text-fg" : "text-muted hover:bg-subtle hover:text-fg",
            )}
          >
            随机抽题
          </Link>
          {user && (
            <>
              <Link
                href="/review"
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === "/review" ? "bg-subtle text-fg" : "text-muted hover:bg-subtle hover:text-fg",
                )}
              >
                今日复习
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === "/dashboard" ? "bg-subtle text-fg" : "text-muted hover:bg-subtle hover:text-fg",
                )}
              >
                学习统计
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted shadow-soft transition-colors hover:border-border-strong hover:text-fg sm:flex"
          >
            <SearchIcon size={15} />
            <span>搜索</span>
            <kbd className="rounded border border-border bg-subtle px-1.5 py-0.5 text-[10px] font-medium text-faint">⌘K</kbd>
          </button>

          <button
            onClick={() => setCommandOpen(true)}
            aria-label="搜索"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-fg sm:hidden"
          >
            <SearchIcon size={18} />
          </button>

          <button
            onClick={toggle}
            aria-label="切换深浅色"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-fg"
          >
            {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>

          {!loading && (
            user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-fg transition-colors hover:bg-subtle"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                    {(profile?.username ?? user.email ?? "?")[0].toUpperCase()}
                  </span>
                  <span className="hidden max-w-[76px] truncate md:inline">{profile?.username ?? "我"}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-11 w-40 rounded-xl border border-border bg-card py-1.5 shadow-lift animate-rise">
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-fg hover:bg-subtle">
                      <BarChartIcon size={15} /> 学习统计
                    </Link>
                    <Link href="/review" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-fg hover:bg-subtle">
                      <ShuffleIcon size={15} /> 今日复习
                    </Link>
                    <Link href="/bookmarks" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-fg hover:bg-subtle">
                      <BookmarkIcon size={15} /> 收藏夹
                    </Link>
                    <Link href="/auth/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-fg hover:bg-subtle">
                      <CommandIcon size={15} /> 账号设置
                    </Link>
                    <div className="my-1 border-t border-border" />
                    <button onClick={handleSignOut} className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-subtle">
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link href="/auth/login" className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-subtle hover:text-fg">
                  登录
                </Link>
                <Link href="/auth/register" className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white shadow-soft transition-colors hover:bg-accent-strong">
                  注册
                </Link>
              </div>
            )
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="菜单"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-fg lg:hidden"
          >
            {menuOpen ? <XIcon size={19} /> : <MenuIcon size={19} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-card px-4 py-3 lg:hidden animate-fade">
          <nav className="grid gap-1">
            {courses.map((course) => (
              <Link key={course.id} href={"/course/" + course.id} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-subtle hover:text-fg">
                {course.title}
              </Link>
            ))}
            <div className="my-1 border-t border-border" />
            <Link href="/quiz" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-subtle hover:text-fg">随机抽题</Link>
            <Link href="/search" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-subtle hover:text-fg">搜索</Link>
            <Link href="/bookmarks" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-subtle hover:text-fg">收藏夹</Link>
            {user ? (
              <>
                <Link href="/review" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-subtle hover:text-fg">今日复习</Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-subtle hover:text-fg">学习统计</Link>
              </>
            ) : (
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="rounded-lg bg-accent px-3 py-2.5 text-center text-sm font-medium text-white">注册并开始复习</Link>
            )}
          </nav>
        </div>
      )}

      <CommandPalette key={commandOpen ? "open" : "closed"} open={commandOpen} onClose={() => setCommandOpen(false)} />
    </header>
  )
}



