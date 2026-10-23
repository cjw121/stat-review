'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import { getAllCourses, getAllQuestions, getQuestionsByChapter, getQuestionsByCourse } from "@/lib/data"
import type { Question } from "@/types"
import { MathContent } from "@/components/MathContent"
import { useBookmarks } from "@/hooks/useBookmarks"
import { useMastery } from "@/hooks/useMastery"
import { cn } from "@/lib/utils"
import {
  BookmarkFilledIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  ShuffleIcon,
  ArrowRightIcon,
} from "@/components/icons"

const courses = getAllCourses()

function pickRandom(arr: Question[]): Question | null {
  if (arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function QuizPage() {
  const [courseId, setCourseId] = useState<string>("all")
  const [chapterId, setChapterId] = useState<string>("all")
  const [current, setCurrent] = useState<Question | null>(null)
  const [answerOpen, setAnswerOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const [seenCount, setSeenCount] = useState(0)

  const { isBookmarked, toggle: toggleBookmark } = useBookmarks()
  const { getStatus, setStatus } = useMastery()

  const selectedCourse = courses.find((c) => c.id === courseId)

  const pool = useMemo(() => {
    if (courseId === "all") return getAllQuestions()
    if (chapterId === "all") return getQuestionsByCourse(courseId)
    return getQuestionsByChapter(courseId, chapterId)
  }, [courseId, chapterId])

  const showNext = useCallback(() => {
    setCurrent(pickRandom(pool))
    setAnswerOpen(false)
    setStarted(true)
    setSeenCount((count) => count + 1)
  }, [pool])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      if (e.key === " " || e.code === "Space") {
        e.preventDefault()
        setAnswerOpen((v) => !v)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        showNext()
      } else if (e.key.toLowerCase() === "b" && current) {
        toggleBookmark(current.id)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [current, showNext, toggleBookmark])

  const mastery = current ? getStatus(current.id) : null

  return (
    <div className="min-h-screen bg-page">
      <section className="border-b border-border bg-card/45">
        <div className="container-page max-w-2xl px-5 py-10 md:py-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">Mock Interview</p>
              <h1 className="font-display mt-2 text-3xl tracking-tight text-fg md:text-4xl">随机抽题</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">先独立思考，再展开答案。像真实面试一样训练表达能力。</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
              <ShuffleIcon size={22} />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page max-w-2xl px-5 py-8">
        <div className="card-base p-4">
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-1 flex-col gap-1.5 min-w-[150px]">
              <span className="text-xs font-medium text-muted">科目</span>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value)
                  setChapterId("all")
                }}
                className="h-10 rounded-xl border border-border bg-page px-3 text-sm text-fg focus:border-primary focus:outline-none"
              >
                <option value="all">全部科目</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1.5 min-w-[150px]">
              <span className="text-xs font-medium text-muted">章节</span>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                disabled={courseId === "all"}
                className="h-10 rounded-xl border border-border bg-page px-3 text-sm text-fg focus:border-primary focus:outline-none disabled:opacity-50"
              >
                <option value="all">全部章节</option>
                {selectedCourse?.chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
                ))}
              </select>
            </label>
            <button
              onClick={showNext}
              className="inline-flex h-10 items-center gap-2 self-end rounded-xl bg-accent px-4 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-accent-strong"
            >
              <ShuffleIcon size={15} />
              {started ? "换一批" : "开始抽题"}
            </button>
          </div>
        </div>

        {!started ? (
          <div className="card-base mt-6 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <ShuffleIcon size={24} />
            </div>
            <h2 className="mt-5 font-display text-2xl text-fg">准备好了吗？</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
              选择范围后点击“开始抽题”。快捷键：空格显示答案，→ 下一题，B 收藏。
            </p>
          </div>
        ) : current ? (
          <div className="mt-6 flex flex-col gap-4 animate-rise">
            <div className="card-base p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-subtle px-2.5 py-1 text-[11px] font-medium text-muted">
                    第 {seenCount} 题
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium",
                      current.difficulty === "基础"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : current.difficulty === "进阶"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
                    )}
                  >
                    {current.difficulty}
                  </span>
                </div>
                <span className="text-xs text-faint">题库 {pool.length} 题</span>
              </div>
              <div className="text-[17px] leading-relaxed text-fg">
                <MathContent content={current.question} block />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAnswerOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-accent-strong"
              >
                {answerOpen ? "收起答案" : "查看答案"}
                <ChevronDownIcon size={15} className={cn("transition-transform", answerOpen && "rotate-180")} />
              </button>
              <button
                onClick={showNext}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:border-border-strong"
              >
                下一题
                <ArrowRightIcon size={15} />
              </button>
              <button
                onClick={() => toggleBookmark(current.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isBookmarked(current.id)
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-card text-muted hover:border-border-strong hover:text-fg",
                )}
              >
                {isBookmarked(current.id) ? <BookmarkFilledIcon size={16} /> : <BookmarkIcon size={16} />}
                收藏
              </button>
            </div>

            <div className="flex gap-2">
              {([
                { value: "mastered" as const, label: "已掌握", active: "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
                { value: "unsure" as const, label: "不熟练", active: "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(current.id, mastery === opt.value ? null : opt.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
                    mastery === opt.value ? opt.active : "border-border bg-card text-muted hover:border-border-strong hover:text-fg",
                  )}
                >
                  {mastery === opt.value && <CheckIcon size={15} />}
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="card-base overflow-hidden">
              <div className="answer-collapse" style={{ maxHeight: answerOpen ? "9999px" : "0", opacity: answerOpen ? 1 : 0 }}>
                <div className="border-t border-border p-5">
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
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4 text-[11px] text-faint">
              <span><kbd className="rounded bg-subtle px-1.5 py-0.5">Space</kbd> 答案</span>
              <span><kbd className="rounded bg-subtle px-1.5 py-0.5">→</kbd> 下一题</span>
              <span><kbd className="rounded bg-subtle px-1.5 py-0.5">B</kbd> 收藏</span>
            </div>
          </div>
        ) : (
          <div className="card-base mt-6 px-6 py-16 text-center text-sm text-muted">所选范围内暂无题目</div>
        )}
      </section>
    </div>
  )
}
