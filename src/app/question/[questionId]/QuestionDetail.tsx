'use client'
import { useState, useEffect } from 'react'
import type { Question } from '@/types'
import { MathContent } from '@/components/MathContent'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useMastery } from '@/hooks/useMastery'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { computeNextReview, defaultSM2State, STATUS_LABELS, STATUS_COLORS, type Rating, type SM2State } from '@/lib/sm2'

const difficultyColor: Record<string, string> = {
  基础: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
  进阶: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
  拔高: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30',
}

export function QuestionDetail({ question }: { question: Question }) {
  const [answerOpen, setAnswerOpen] = useState(false)
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks()
  const { getStatus, setStatus } = useMastery()
  const mastery = getStatus(question.id)
  const { user } = useAuth()

  // Supabase-based progress state (logged-in users)
  const [sm2State, setSm2State] = useState<SM2State>(defaultSM2State)
  const [ratingDone, setRatingDone] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('question_progress')
      .select('repetitions, interval_days, ease_factor, status')
      .eq('user_id', user.id)
      .eq('question_id', question.id)
      .single()
      .then(({ data }) => {
        if (data) setSm2State({ repetitions: data.repetitions, interval_days: data.interval_days, ease_factor: data.ease_factor, status: data.status })
      })
  }, [user, question.id])

  async function handleRating(rating: Rating) {
    if (!user || saving) return
    setSaving(true)
    const newState = computeNextReview(sm2State, rating)
    await supabase.from('question_progress').upsert({
      user_id: user.id, question_id: question.id, course_id: question.courseId,
      ...newState, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,question_id' })
    await supabase.from('review_log').insert({
      user_id: user.id, question_id: question.id, course_id: question.courseId, result: rating,
    })
    setSm2State(newState)
    setRatingDone(true)
    setSaving(false)
  }

  return (
    <article>
      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[question.difficulty] ?? 'text-muted'}`}>
          {question.difficulty}
        </span>
        {question.tags.map((tag) => (
          <span key={tag} className="text-xs text-muted bg-page border border-border px-2.5 py-1 rounded-full">{tag}</span>
        ))}
        {/* 登录用户显示当前掌握状态 */}
        {user && sm2State.status !== 'new' && (
          <span className="text-xs px-2.5 py-1 rounded-full border" style={{ color: STATUS_COLORS[sm2State.status], borderColor: STATUS_COLORS[sm2State.status], background: STATUS_COLORS[sm2State.status] + '20' }}>
            {STATUS_LABELS[sm2State.status]}
          </span>
        )}
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">面试题</h2>
        <div className="text-fg text-[17px] leading-relaxed">
          <MathContent content={question.question} block />
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => toggleBookmark(question.id)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-all duration-150 ${
            isBookmarked(question.id)
              ? 'text-primary border-primary bg-primary/10'
              : 'text-muted border-border hover:border-primary/50'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked(question.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
          {isBookmarked(question.id) ? '已收藏' : '收藏'}
        </button>

        {/* 未登录：原有两档标记 */}
        {!user && ([
          { value: 'mastered' as const, label: '✓ 已掌握', color: 'text-emerald-600 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' },
          { value: 'unsure' as const, label: '△ 不熟练', color: 'text-amber-600 border-amber-400 bg-amber-50 dark:bg-amber-900/30' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatus(question.id, mastery === opt.value ? null : opt.value)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-all duration-150 ${mastery === opt.value ? opt.color : 'text-muted border-border hover:border-primary/50'}`}
          >{opt.label}</button>
        )))}
      </div>

      {/* Answer */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
        <button
          onClick={() => setAnswerOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-page transition-colors duration-150"
        >
          <span className="font-semibold text-fg">参考答案</span>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`text-muted transition-transform duration-200 ${answerOpen ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
        <div className="answer-collapse" style={{ maxHeight: answerOpen ? '9999px' : '0', opacity: answerOpen ? 1 : 0 }}>
          <div className="px-5 pb-5 border-t border-border pt-4">
            <div className="text-fg text-[16px] leading-relaxed">
              <MathContent content={question.answer} block />
            </div>
          </div>
        </div>
      </div>

      {/* 登录用户：三档自评 */}
      {user && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          {ratingDone ? (
            <div className="text-center text-sm text-muted">
              已记录！下次复习：{new Date(computeNextReview(sm2State, 'remember').next_review_at).toLocaleDateString('zh-CN')}
              <button onClick={() => setRatingDone(false)} className="ml-2 text-primary hover:underline">重新评分</button>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted text-center mb-3">自评掌握程度（将纳入复习计划）</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { rating: 'forget' as Rating, label: '忘记了', style: 'border-rose-400 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30' },
                  { rating: 'vague' as Rating, label: '模糊', style: 'border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30' },
                  { rating: 'remember' as Rating, label: '记得', style: 'border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' },
                ]).map(opt => (
                  <button
                    key={opt.rating}
                    onClick={() => { setAnswerOpen(true); handleRating(opt.rating) }}
                    disabled={saving}
                    className={`border-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-50 ${opt.style}`}
                  >{opt.label}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Followups */}
      {question.followups.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">面试官可能的追问</h3>
          <ul className="flex flex-col gap-2">
            {question.followups.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[15px] text-fg">
                <span className="text-primary mt-0.5 shrink-0">→</span>
                <MathContent content={f} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
