'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/AuthGuard'
import { computeNextReview, defaultSM2State, type Rating, type SM2State } from '@/lib/sm2'
import { getQuestion, getAllQuestions } from '@/lib/data'
import type { Question } from '@/types'
import { MathContent } from '@/components/MathContent'
import Link from 'next/link'

export default function ReviewPage() {
  return <AuthGuard><ReviewContent /></AuthGuard>
}

type ReviewItem = { question_id: string; state: SM2State }

function ReviewContent() {
  const { user } = useAuth()
  const [dueItems, setDueItems] = useState<ReviewItem[]>([])
  const [upcomingCount, setUpcomingCount] = useState<{ days: number; count: number }[]>([])
  const [current, setCurrent] = useState<Question | null>(null)
  const [currentState, setCurrentState] = useState<SM2State>(defaultSM2State)
  const [answerOpen, setAnswerOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  const load = useCallback(async () => {
    if (!user) return
    const now = new Date().toISOString()

    // 今日待复习
    const { data: due } = await supabase
      .from('question_progress')
      .select('question_id, repetitions, interval_days, ease_factor, status')
      .eq('user_id', user.id)
      .lte('next_review_at', now)
      .order('next_review_at', { ascending: true })

    const items: ReviewItem[] = (due ?? []).map(r => ({
      question_id: r.question_id,
      state: { repetitions: r.repetitions, interval_days: r.interval_days, ease_factor: r.ease_factor, status: r.status },
    }))
    setDueItems(items)

    // 未来 7 天预告
    const upcoming: { days: number; count: number }[] = []
    for (let d = 1; d <= 7; d++) {
      const from = new Date(Date.now() + (d-1)*86400000).toISOString()
      const to = new Date(Date.now() + d*86400000).toISOString()
      const { count } = await supabase
        .from('question_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('next_review_at', d===1 ? now : from)
        .lte('next_review_at', to)
      upcoming.push({ days: d, count: count ?? 0 })
    }
    setUpcomingCount(upcoming)

    if (items.length > 0) {
      const first = items[0]
      setCurrent(getQuestion(first.question_id) ?? null)
      setCurrentState(first.state)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  async function handleRating(rating: Rating) {
    if (!current || !user || saving) return
    setSaving(true)
    const newState = computeNextReview(currentState, rating)

    // upsert question_progress
    await supabase.from('question_progress').upsert({
      user_id: user.id,
      question_id: current.id,
      course_id: current.courseId,
      ...newState,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,question_id' })

    // insert review_log
    await supabase.from('review_log').insert({
      user_id: user.id,
      question_id: current.id,
      course_id: current.courseId,
      result: rating,
    })

    setSaving(false)
    setSessionCount(c => c + 1)
    setAnswerOpen(false)

    // 移到下一题
    const remaining = dueItems.slice(1)
    setDueItems(remaining)
    if (remaining.length > 0) {
      setCurrent(getQuestion(remaining[0].question_id) ?? null)
      setCurrentState(remaining[0].state)
    } else {
      setDone(true)
    }
  }

  if (loading) return <div className="min-h-screen bg-page flex items-center justify-center text-muted">加载中…</div>

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-fg">今日复习</h1>
          <Link href="/dashboard" className="text-sm text-primary hover:underline">查看统计</Link>
        </div>

        {/* 未来预告 */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 flex gap-3 overflow-x-auto">
          <div className="shrink-0 text-center">
            <div className="text-xl font-bold text-primary">{dueItems.length}</div>
            <div className="text-xs text-muted">今日待复习</div>
          </div>
          <div className="w-px bg-border shrink-0" />
          {upcomingCount.map(u => (
            <div key={u.days} className="shrink-0 text-center min-w-[40px]">
              <div className="text-base font-semibold text-fg">{u.count}</div>
              <div className="text-xs text-muted">+{u.days}天</div>
            </div>
          ))}
        </div>

        {done || dueItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🎉</div>
            {sessionCount > 0
              ? <p className="text-fg font-semibold text-lg">今日复习完成！共复习 {sessionCount} 题</p>
              : <p className="text-fg font-semibold text-lg">今天没有待复习的题目</p>}
            <p className="text-muted text-sm mt-2">继续保持，明天再来！</p>
            <div className="flex gap-3 mt-8 justify-center">
              <Link href="/quiz" className="bg-primary-btn text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                随机刷题
              </Link>
              <Link href="/" className="border border-border text-fg px-6 py-2.5 rounded-xl text-sm hover:border-primary/50 transition-colors">
                回首页
              </Link>
            </div>
          </div>
        ) : current ? (
          <div className="flex flex-col gap-4">
            <div className="text-sm text-muted">剩余 {dueItems.length} 题 · 本次已复习 {sessionCount} 题</div>

            {/* 题目 */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="text-xs text-muted uppercase tracking-wider mb-3">面试题</div>
              <div className="text-fg text-[17px] leading-relaxed">
                <MathContent content={current.question} block />
              </div>
            </div>

            {/* 查看答案 */}
            {!answerOpen ? (
              <button
                onClick={() => setAnswerOpen(true)}
                className="bg-primary-btn text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >查看答案</button>
            ) : (
              <>
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="text-xs text-muted uppercase tracking-wider mb-3">参考答案</div>
                  <div className="text-fg text-[16px] leading-relaxed">
                    <MathContent content={current.answer} block />
                  </div>
                  {current.followups.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="text-xs text-muted uppercase tracking-wider mb-2">可能的追问</div>
                      <ul className="flex flex-col gap-1.5 text-[15px] text-fg">
                        {current.followups.map((f, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary shrink-0">→</span>
                            <MathContent content={f} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 三档自评 */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-sm text-muted mb-3 text-center">你掌握得怎么样？</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { rating: 'forget' as Rating, label: '忘记了', color: 'border-rose-400 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30' },
                      { rating: 'vague' as Rating, label: '模糊', color: 'border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30' },
                      { rating: 'remember' as Rating, label: '记得', color: 'border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' },
                    ]).map(opt => (
                      <button
                        key={opt.rating}
                        onClick={() => handleRating(opt.rating)}
                        disabled={saving}
                        className={`border-2 py-3 rounded-xl font-semibold text-sm transition-all duration-150 disabled:opacity-50 ${opt.color}`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
