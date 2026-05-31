'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message === 'Invalid login credentials' ? '邮箱或密码错误' : error.message)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8">
        <h1 className="text-xl font-bold text-fg mb-6 text-center">登录</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
            <label className="block text-sm text-muted mb-1">密码</label>
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
            {loading ? '登录中…' : '登录'}
          </button>
        </form>
        <p className="text-center text-sm text-muted mt-4">
          还没有账号？{' '}
          <Link href="/auth/register" className="text-primary hover:underline">注册</Link>
        </p>
      </div>
    </div>
  )
}
