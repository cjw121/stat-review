'use client'
import { useState, useCallback } from 'react'
import { getAllCourses, getAllQuestions, getQuestionsByCourse, getQuestionsByChapter } from '@/lib/data'
import type { Question } from '@/types'
import { MathContent } from '@/components/MathContent'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useMastery } from '@/hooks/useMastery'

const courses = getAllCourses()

function pickRandom(arr: Question[]): Question | null {
  if (arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function QuizPage() {
  const [courseId, setCourseId] = useState<string>('all')
  const [chapterId, setChapterId] = useState<string>('all')
  const [current, setCurrent] = useState<Question | null>(null)
  const [answerOpen, setAnswerOpen] = useState(false)
  const [started, setStarted] = useState(false)

  const { isBookmarked, toggle: toggleBookmark } = useBookmarks()
  const { getStatus, setStatus } = useMastery()

  const selectedCourse = courses.find((c) => c.id === courseId)

  const getPool = useCallback((): Question[] => {
    if (courseId === 'all') return getAllQuestions()
    if (chapterId === 'all') return getQuestionsByCourse(courseId)
    return getQuestionsByChapter(courseId, chapterId)
  }, [courseId, chapterId])

  const start = () => {
    const pool = getPool()
    setCurrent(pickRandom(pool))
    setAnswerOpen(false)
    setStarted(true)
  }

  const next = () => {
    const pool = getPool()
    setCurrent(pickRandom(pool))
    setAnswerOpen(false)
  }

  const mastery = current ? getStatus(current.id) : null

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-fg mb-1">随机抽题</h1>
        <p className="text-muted text-sm mb-6">模拟面试官随机提问，先独立思考再查看答案</p>

        {/* Filter */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label className="text-xs text-muted font-medium">科目</label>
            <select
              value={courseId}
              onChange={(e) => { setCourseId(e.target.value); setChapterId('all') }}
              className="bg-page border border-border rounded-lg px-3 py-2 text-sm text-fg focus:outline-none focus:border-primary"
            >
              <option value="all">全部科目</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label className="text-xs text-muted font-medium">章节</label>
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              disabled={courseId === 'all'}
              className="bg-page border border-border rounded-lg px-3 py-2 text-sm text-fg focus:outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="all">全部章节</option>
              {selectedCourse?.chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.title}</option>
              ))}
            </select>
          </div>
          <button
            onClick={start}
            className="bg-primary-btn text-white font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity duration-150 text-sm shrink-0"
          >
            {started ? '换一批' : '开始抽题'}
          </button>
        </div>

        {/* Question display */}
        {!started ? (
          <div className="text-center py-20 text-muted">
            选择范围后点击"开始抽题"
          </div>
        ) : current ? (
          <div className="flex flex-col gap-4">
            {/* Question */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-muted font-medium uppercase tracking-wider">面试题</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  current.difficulty === '基础' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' :
                  current.difficulty === '进阶' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' :
                  'text-rose-600 bg-rose-50 dark:bg-rose-900/30'
                }`}>{current.difficulty}</span>
              </div>
              <div className="text-fg text-[17px] leading-relaxed">
                <MathContent content={current.question} block />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAnswerOpen((v) => !v)}
                className="flex-1 sm:flex-none bg-primary-btn text-white font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity duration-150 text-sm"
              >
                {answerOpen ? '收起答案' : '查看答案'}
              </button>
              <button
                onClick={next}
                className="flex-1 sm:flex-none border border-border text-fg font-semibold px-5 py-2.5 rounded-lg hover:border-primary/50 hover:text-primary transition-all duration-150 text-sm"
              >
                下一题 →
              </button>
              <button
                onClick={() => toggleBookmark(current.id)}
                className={`px-3 py-2.5 rounded-lg border transition-all duration-150 ${
                  isBookmarked(current.id)
                    ? 'text-primary border-primary bg-primary/10'
                    : 'text-muted border-border hover:border-primary/50'
                }`}
                title={isBookmarked(current.id) ? '取消收藏' : '收藏'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked(current.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
              </button>
            </div>

            {/* Mastery buttons */}
            <div className="flex gap-2 text-sm">
              {[
                { value: 'mastered' as const, label: '✓ 已掌握', active: 'text-emerald-600 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' },
                { value: 'unsure' as const, label: '△ 不熟练', active: 'text-amber-600 border-amber-400 bg-amber-50 dark:bg-amber-900/30' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(current.id, mastery === opt.value ? null : opt.value)}
                  className={`px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                    mastery === opt.value ? opt.active : 'text-muted border-border hover:border-primary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Answer */}
            <div
              className="answer-collapse bg-card border border-border rounded-xl overflow-hidden"
              style={{ maxHeight: answerOpen ? '9999px' : '0', opacity: answerOpen ? 1 : 0, border: answerOpen ? undefined : 'none' }}
            >
              <div className="px-5 py-4">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">参考答案</h3>
                <div className="text-fg text-[16px] leading-relaxed">
                  <MathContent content={current.answer} block />
                </div>
                {current.followups.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">可能的追问</h3>
                    <ul className="flex flex-col gap-1.5 text-[15px] text-fg">
                      {current.followups.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary shrink-0">→</span>
                          <MathContent content={f} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted">所选范围内暂无题目</div>
        )}
      </div>
    </div>
  )
}
