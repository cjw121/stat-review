'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { AuthGuard } from "@/components/AuthGuard"

export default function AccountPage() {
  return <AuthGuard><AccountContent /></AuthGuard>
}

function AccountContent() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState(profile?.username ?? "")
  const [newPassword, setNewPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleUpdateUsername(e: React.FormEvent) {
    e.preventDefault()
    setMsg("")
    setErr("")
    setSaving(true)
    const { error } = await supabase.from("profiles").update({ username }).eq("id", user!.id)
    setSaving(false)
    if (error) {
      if (error.code === "23505") setErr("用户名已被使用")
      else setErr(error.message)
    } else {
      await refreshProfile()
      setMsg("用户名已更新")
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg("")
    setErr("")
    if (newPassword.length < 6) {
      setErr("密码至少 6 位")
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (error) setErr(error.message)
    else {
      setNewPassword("")
      setMsg("密码已更新")
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-page">
      <section className="border-b border-border bg-card/45">
        <div className="container-page max-w-lg px-5 py-10 md:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">Account</p>
          <h1 className="font-display mt-2 text-3xl tracking-tight text-fg md:text-4xl">账号设置</h1>
          <p className="mt-3 text-sm text-muted">登录邮箱：{user?.email}</p>
        </div>
      </section>

      <section className="container-page max-w-lg px-5 py-8">
        {msg && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{msg}</div>}
        {err && <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">{err}</div>}

        <div className="card-base p-5">
          <h2 className="font-semibold text-fg">修改用户名</h2>
          <p className="mt-1 text-sm text-muted">用于展示在你的个人主页与统计中。</p>
          <form onSubmit={handleUpdateUsername} className="mt-4 flex gap-2">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              className="h-11 flex-1 rounded-xl border border-border bg-page px-3 text-[15px] text-fg focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-xl bg-accent px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-accent-strong disabled:opacity-50"
            >
              保存
            </button>
          </form>
        </div>

        <div className="card-base mt-4 p-5">
          <h2 className="font-semibold text-fg">修改密码</h2>
          <p className="mt-1 text-sm text-muted">建议使用至少 6 位且不易猜测的密码。</p>
          <form onSubmit={handleUpdatePassword} className="mt-4 flex gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="新密码（至少 6 位）"
              className="h-11 flex-1 rounded-xl border border-border bg-page px-3 text-[15px] text-fg placeholder:text-faint focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-xl bg-accent px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-accent-strong disabled:opacity-50"
            >
              更新
            </button>
          </form>
        </div>

        <button
          onClick={handleSignOut}
          className="mt-6 w-full rounded-xl border border-rose-200 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-900/20"
        >
          退出登录
        </button>
      </section>
    </div>
  )
}
