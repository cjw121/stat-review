'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { ArrowRightIcon } from "@/components/icons"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password.length < 6) {
      setError("密码至少 6 位")
      return
    }
    setLoading(true)

    const { data, error: signUpErr } = await supabase.auth.signUp({ email, password })
    if (signUpErr || !data.user) {
      setLoading(false)
      setError(signUpErr?.message ?? "注册失败，请重试")
      return
    }

    const { error: profileErr } = await supabase.from("profiles").insert({
      id: data.user.id,
      username: username.trim(),
      email,
    })
    setLoading(false)
    if (profileErr) {
      if (profileErr.code === "23505") setError("用户名已被使用，请换一个")
      else setError("注册成功，但保存用户名失败：" + profileErr.message)
      return
    }

    router.push("/?registered=1")
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-page px-5 py-10">
      <div className="card-base w-full max-w-sm p-7 shadow-lift md:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <ArrowRightIcon size={20} />
          </div>
          <h1 className="font-display mt-4 text-3xl text-fg">创建账号</h1>
          <p className="mt-2 text-sm text-muted">开始记录你的复习进度</p>
        </div>

        <form onSubmit={handleRegister} className="mt-7 flex flex-col gap-4">
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
            <span className="text-sm font-medium text-fg">用户名</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              pattern="[A-Za-z0-9_一-龥]+"
              title="字母、数字、下划线或中文"
              className="h-11 rounded-xl border border-border bg-page px-3 text-[15px] text-fg placeholder:text-faint focus:border-primary focus:outline-none"
              placeholder="你的昵称"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg">密码（至少 6 位）</span>
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
            {loading ? "注册中…" : "创建账号"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          已有账号？{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">登录</Link>
        </p>
      </div>
    </div>
  )
}
