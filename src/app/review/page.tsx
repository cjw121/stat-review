'use client'

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { AuthGuard } from "@/components/AuthGuard"
import { computeNextReview, defaultSM2State, type Rating, type SM2State } from "@/lib/sm2"
import { getQuestion } from "@/lib/data"
import type { Question } from "@/types"
import { MathContent } from "@/components/MathContent"
import { ChevronDownIcon, ClockIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

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

    const { data: due } = await supabase
      .from("question_progress")
      .select("question_id, repetitions, interval_days, ease_factor, status")
      .eq("user_id", user.id)
      .lte("next_review_at", now)
      .order("next_review_at", { ascending: true })

    const items: ReviewItem[] = (due ?? []).map((row) => ({
      question_id: row.question_id,
      state: {
        repetitions: row.repetitions,
        interval_days: row.interval_days,
        ease_factor: row.ease_factor,
        status: row.status,
      },
    }))
    setDueItems(items)

    const upcoming: { days: number; count: number }[] = []
    for (let day = 1; day <= 7; day++) {
      const from = new Date(Date.now() + (day - 1) * 86400000).toISOString()
      const to = new Date(Date.now() + day * 86400000).toISOString()
      const { count } = await supabase
        .from("question_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gt("next_review_at", day === 1 ? now : from)
        .lte("next_review_at", to)
      upcoming.push({ days: day, count: count ?? 0 })
    }
    setUpcomingCount(upcoming)

    if (items.length > 0) {
      const first = items[0]
      setCurrent(getQuestion(first.question_id) ?? null)
      setCurrentState(first.state)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  async function handleRating(rating: Rating) {
    if (!current || !user || saving) return
    setSaving(true)
    const newState = computeNextReview(currentState, rating)

    await supabase.from("question_progress").upsert(
      {
        user_id: user.id,
        question_id: current.id,
        course_id: current.courseId,
        ...newState,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,question_id" },
    )
    await supabase.from("review_log").insert({
      user_id: user.id,
      question_id: current.id,
      course_id: current.courseId,
      result: rating,
    })

    setSaving(false)
    setSessionCount((count) => count + 1)
    setAnswerOpen(false)

    const remaining = dueItems.slice(1)
    setDueItems(remaining)
    if (remaining.length > 0) {
      setCurrent(getQuestion(remaining[0].question_id) ?? null)
      setCurrentState(remaining[0].state)
    } else {
      setDone(true)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-page text-sm text-muted">加载中…</div>
  }

  return (
    <div className="min-h-screen bg-page">
      <section className="border-b border-border bg-card/45">
        <div className="container-page max-w-2xl px-5 py-10 md:py-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">Spaced Repetition</p>
              <h1 className="font-display mt-2 text-3xl tracking-tight text-fg md:text-4xl">今日复习</h1>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <ClockIcon size={22} />
            </span>
          </div>
        </div>
      </section>

      <section className="container-page max-w-2xl px-5 py-8">
        <div className="card-base flex gap-4 overflow-x-auto p-4">
          <div className="shrink-0 pr-4 text-center">
            <div className="font-display text-2xl font-semibold text-fg">{dueItems.length}</div>
            <div className="mt-1 text-xs text-muted">今日待复习</div>
          </div>
          <div className="w-px shrink-0 bg-border" />
          {upcomingCount.map((item) => (
            <div key={item.days} className="shrink-0 px-3 text-center">
              <div className="font-display text-lg font-semibold text-fg">{item.count}</div>
              <div className="mt-1 text-xs text-muted">+{item.days} 天</div>
            </div>
          ))}
        </div>

        {done || dueItems.length === 0 ? (
          <div className="card-base mt-6 px-6 py-16 text-center">
            <div className="text-5xl">🎉</div>
            <h2 className="mt-5 font-display text-2xl text-fg">
              {sessionCount > 0 ? "今日复习完成！共复习 " + sessionCount + " 题" : "今天没有待复习的题目"}
            </h2>
            <p className="mt-2 text-sm text-muted">保持节奏，明天再来。</p>
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/quiz" className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-accent-strong">
                随机刷题
              </Link>
              <Link href="/" className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:border-border-strong">
                回首页
              </Link>
            </div>
          </div>
        ) : current ? (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>剩余 {dueItems.length} 题</span>
              <span>本次已复习 {sessionCount} 题</span>
            </div>

            <div className="card-base p-5 md:p-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">面试题</p>
              <div className="text-[17px] leading-relaxed text-fg">
                <MathContent content={current.question} block />
              </div>
            </div>

            {!answerOpen ? (
              <button
                onClick={() => setAnswerOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-accent-strong"
              >
                查看答案
                <ChevronDownIcon size={15} />
              </button>
            ) : (
              <>
                <div className="card-base p-5 md:p-6">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">参考答案</p>
                  <div className="text-[16px] leading-relaxed text-fg">
                    <MathContent content={current.answer} block />
                  </div>
                  {current.followups.length > 0 && (
                    <div className="mt-5 border-t border-border pt-4">
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">可能的追问</p>
                      <ul className="flex flex-col gap-2">
                        {current.followups.map((followup, index) => (
                          <li key={index} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-fg">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <MathContent content={followup} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="card-base p-4">
                  <p className="mb-3 text-center text-sm text-muted">你掌握得怎么样？</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { rating: "forget" as Rating, label: "忘记了", style: "border-rose-200 text-rose-600 hover:border-rose-400 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-900/20" },
                      { rating: "vague" as Rating, label: "模糊", style: "border-amber-200 text-amber-600 hover:border-amber-400 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-900/20" },
                      { rating: "remember" as Rating, label: "记得", style: "border-emerald-200 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-900/20" },
                    ]).map((option) => (
                      <button
                        key={option.rating}
                        onClick={() => handleRating(option.rating)}
                        disabled={saving}
                        className={cn("rounded-xl border-2 py-3 text-sm font-semibold transition-all disabled:opacity-50", option.style)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </section>
    </div>
  )
}




