'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { ArrowRightIcon } from "@/components/icons"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message === "Invalid login credentials" ? "邮箱或密码错误" : error.message)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-page px-5 py-10">
      <div className="card-base w-full max-w-sm p-7 shadow-lift md:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <ArrowRightIcon size={20} />
          </div>
          <h1 className="font-display mt-4 text-3xl text-fg">欢迎回来</h1>
          <p className="mt-2 text-sm text-muted">登录后同步学习进度与复习计划</p>
        </div>

        <form onSubmit={handleLogin} className="mt-7 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg">邮箱</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border border-border bg-page px-3 text-[15px] text-fg placeholder:text-faint focus:border-primary focus:outline-none"
              placeholder="your@email.com"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg">密码</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border border-border bg-page px-3 text-[15px] text-fg placeholder:text-faint focus:border-primary focus:outline-none"
              placeholder="••••••••"
            />
          </label>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-accent font-semibold text-white shadow-soft transition-colors hover:bg-accent-strong disabled:opacity-50"
          >
            {loading ? "登录中…" : "登录"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          还没有账号？{" "}
          <Link href="/auth/register" className="font-medium text-primary hover:underline">注册</Link>
        </p>
      </div>
    </div>
  )
}
