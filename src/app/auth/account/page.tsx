'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/AuthGuard'

export default function AccountPage() {
  return <AuthGuard><AccountContent /></AuthGuard>
}

function AccountContent() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleUpdateUsername(e: React.FormEvent) {
    e.preventDefault()
    setMsg(''); setErr(''); setSaving(true)
    const { error } = await supabase.from('profiles').update({ username }).eq('id', user!.id)
    setSaving(false)
    if (error) {
      if (error.code === '23505') setErr('用户名已被使用')
      else setErr(error.message)
    } else {
      await refreshProfile()
      setMsg('用户名已更新')
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg(''); setErr('')
    if (newPassword.length < 6) { setErr('密码至少 6 位'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (error) setErr(error.message)
    else { setNewPassword(''); setMsg('密码已更新') }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-fg mb-8">账号设置</h1>
        <div className="text-sm text-muted mb-6">登录邮箱：{user?.email}</div>

        {msg && <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm">{msg}</div>}
        {err && <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 rounded-lg text-sm">{err}</div>}

        {/* 修改用户名 */}
        <section className="bg-card border border-border rounded-xl p-5 mb-4">
          <h2 className="font-semibold text-fg mb-4">修改用户名</h2>
          <form onSubmit={handleUpdateUsername} className="flex gap-2">
            <input
              type="text" required value={username}
              onChange={e => setUsername(e.target.value)}
              maxLength={20}
              className="flex-1 bg-page border border-border rounded-lg px-3 py-2 text-fg text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="submit" disabled={saving}
              className="bg-primary-btn text-white text-sm px-4 rounded-lg hover:opacity-90 disabled:opacity-50"
            >保存</button>
          </form>
        </section>

        {/* 修改密码 */}
        <section className="bg-card border border-border rounded-xl p-5 mb-4">
          <h2 className="font-semibold text-fg mb-4">修改密码</h2>
          <form onSubmit={handleUpdatePassword} className="flex gap-2">
            <input
              type="password" value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="新密码（至少 6 位）"
              className="flex-1 bg-page border border-border rounded-lg px-3 py-2 text-fg text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="submit" disabled={saving}
              className="bg-primary-btn text-white text-sm px-4 rounded-lg hover:opacity-90 disabled:opacity-50"
            >更新</button>
          </form>
        </section>

        {/* 退出 */}
        <button
          onClick={handleSignOut}
          className="w-full border border-rose-300 text-rose-500 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
        >退出登录</button>
      </div>
    </div>
  )
}
