'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('密码至少 6 位'); return }
    setLoading(true)

    const { data, error: signUpErr } = await supabase.auth.signUp({ email, password })
    if (signUpErr || !data.user) {
      setLoading(false)
      setError(signUpErr?.message ?? '注册失败，请重试')
      return
    }

    // 写入 profiles 表
    const { error: profileErr } = await supabase.from('profiles').insert({
      id: data.user.id,
      username: username.trim(),
      email,
    })
    setLoading(false)
    if (profileErr) {
      if (profileErr.code === '23505') setError('用户名已被使用，请换一个')
      else setError('注册成功，但保存用户名失败：' + profileErr.message)
      return
    }

    router.push('/?registered=1')
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8">
        <h1 className="text-xl font-bold text-fg mb-6 text-center">注册</h1>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-muted mb-1">邮箱</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-page border border-border rounded-lg px-3 py-2 text-fg text-sm focus:outline-none focus:border-primary"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">用户名</label>
            <input
              type="text" required value={username}
              onChange={e => setUsername(e.target.value)}
              maxLength={20}
              pattern="[A-Za-z0-9_一-龥]+"
              title="字母、数字、下划线或中文"
              className="w-full bg-page border border-border rounded-lg px-3 py-2 text-fg text-sm focus:outline-none focus:border-primary"
              placeholder="你的昵称"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">密码（至少 6 位）</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-page border border-border rounded-lg px-3 py-2 text-fg text-sm focus:outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="bg-primary-btn text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? '注册中…' : '注册'}
          </button>
        </form>
        <p className="text-center text-sm text-muted mt-4">
          已有账号？{' '}
          <Link href="/auth/login" className="text-primary hover:underline">登录</Link>
        </p>
      </div>
    </div>
  )
}
