'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Question } from "@/types"
import { MathContent } from "@/components/MathContent"
import { useBookmarks } from "@/hooks/useBookmarks"
import { useMastery } from "@/hooks/useMastery"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { computeNextReview, defaultSM2State, STATUS_LABELS, STATUS_COLORS, type Rating, type SM2State } from "@/lib/sm2"
import { cn, toPreview } from "@/lib/utils"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkFilledIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
} from "@/components/icons"

const difficultyColor: Record<string, string> = {
  基础: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  进阶: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  拔高: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
}

type QuestionDetailProps = {
  question: Question
  prevQuestion: Question | null
  nextQuestion: Question | null
}

export function QuestionDetail({ question, prevQuestion, nextQuestion }: QuestionDetailProps) {
  const [answerOpen, setAnswerOpen] = useState(false)
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks()
  const { getStatus, setStatus } = useMastery()
  const mastery = getStatus(question.id)
  const { user } = useAuth()

  const [sm2State, setSm2State] = useState<SM2State>(defaultSM2State)
  const [ratingDone, setRatingDone] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from("question_progress")
      .select("repetitions, interval_days, ease_factor, status")
      .eq("user_id", user.id)
      .eq("question_id", question.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setSm2State({
            repetitions: data.repetitions,
            interval_days: data.interval_days,
            ease_factor: data.ease_factor,
            status: data.status,
          })
        }
      })
  }, [user, question.id])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === " " || e.code === "Space") {
        e.preventDefault()
        setAnswerOpen((v) => !v)
      } else if (e.key.toLowerCase() === "b") {
        toggleBookmark(question.id)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [question.id, toggleBookmark])

  async function handleRating(rating: Rating) {
    if (!user || saving) return
    setSaving(true)
    const newState = computeNextReview(sm2State, rating)
    await supabase.from("question_progress").upsert(
      {
        user_id: user.id,
        question_id: question.id,
        course_id: question.courseId,
        ...newState,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,question_id" },
    )
    await supabase.from("review_log").insert({
      user_id: user.id,
      question_id: question.id,
      course_id: question.courseId,
      result: rating,
    })
    setSm2State(newState)
    setRatingDone(true)
    setSaving(false)
  }

  return (
    <article className="animate-rise">
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", difficultyColor[question.difficulty] ?? "bg-subtle text-muted")}>
          {question.difficulty}
        </span>
        {question.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted">
            {tag}
          </span>
        ))}
        {user && sm2State.status !== "new" && (
          <span
            className="rounded-full border px-2.5 py-1 text-xs font-medium"
            style={{
              color: STATUS_COLORS[sm2State.status],
              borderColor: STATUS_COLORS[sm2State.status],
              background: STATUS_COLORS[sm2State.status] + "1f",
            }}
          >
            {STATUS_LABELS[sm2State.status]}
          </span>
        )}
      </div>

      <div className="card-base mt-5 p-5 md:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">面试题</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="text-[17px] leading-relaxed text-fg">
          <MathContent content={question.question} block />
        </div>
      </div>

      <div className="sticky bottom-3 z-20 mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setAnswerOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-accent-strong"
        >
          {answerOpen ? "收起答案" : "查看答案"}
          <ChevronDownIcon size={15} className={cn("transition-transform", answerOpen && "rotate-180")} />
        </button>
        <button
          onClick={() => toggleBookmark(question.id)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors",
            isBookmarked(question.id)
              ? "border-primary bg-primary-soft text-primary"
              : "border-border bg-card text-muted hover:border-border-strong hover:text-fg",
          )}
        >
          {isBookmarked(question.id) ? <BookmarkFilledIcon size={16} /> : <BookmarkIcon size={16} />}
          {isBookmarked(question.id) ? "已收藏" : "收藏"}
          <kbd className="hidden rounded border border-border bg-subtle px-1 text-[10px] text-faint sm:inline">B</kbd>
        </button>

        {!user && (
          <>
            {([
              { value: "mastered" as const, label: "已掌握", active: "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
              { value: "unsure" as const, label: "不熟练", active: "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(question.id, mastery === opt.value ? null : opt.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors",
                  mastery === opt.value ? opt.active : "border-border bg-card text-muted hover:border-border-strong hover:text-fg",
                )}
              >
                {mastery === opt.value && <CheckIcon size={15} />}
                {opt.label}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="card-base mt-4 overflow-hidden">
        <div className="answer-collapse" style={{ maxHeight: answerOpen ? "9999px" : "0", opacity: answerOpen ? 1 : 0 }}>
          <div className="border-t border-border p-5 md:p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">参考答案</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="text-[16px] leading-relaxed text-fg">
              <MathContent content={question.answer} block />
            </div>
          </div>
        </div>
      </div>

      {user && (
        <div className="card-base mt-4 p-4">
          {ratingDone ? (
            <div className="flex items-center justify-between gap-3 text-sm text-muted">
              <span>
                已记录！下次复习：
                {new Date(computeNextReview(sm2State, "remember").next_review_at).toLocaleDateString("zh-CN")}
              </span>
              <button onClick={() => setRatingDone(false)} className="font-medium text-primary hover:underline">
                重新评分
              </button>
            </div>
          ) : (
            <>
              <p className="mb-3 text-center text-xs text-muted">自评掌握程度，将自动纳入复习计划</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { rating: "forget" as Rating, label: "忘记了", style: "border-rose-200 text-rose-600 hover:border-rose-400 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-900/20" },
                  { rating: "vague" as Rating, label: "模糊", style: "border-amber-200 text-amber-600 hover:border-amber-400 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-900/20" },
                  { rating: "remember" as Rating, label: "记得", style: "border-emerald-200 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-900/20" },
                ]).map((opt) => (
                  <button
                    key={opt.rating}
                    onClick={() => {
                      setAnswerOpen(true)
                      handleRating(opt.rating)
                    }}
                    disabled={saving}
                    className={cn("rounded-xl border-2 py-2.5 text-sm font-semibold transition-all disabled:opacity-50", opt.style)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {question.followups.length > 0 && (
        <div className="card-base mt-4 p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">面试官可能的追问</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <ul className="flex flex-col gap-3">
            {question.followups.map((followup, index) => (
              <li key={index} className="flex items-start gap-3 text-[15px] leading-relaxed text-fg">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <MathContent content={followup} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {prevQuestion ? (
          <Link href={"/question/" + prevQuestion.id} className="group card-base hover-lift p-4">
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <ArrowLeftIcon size={13} /> 上一题
            </span>
            <span className="mt-2 block line-clamp-2 text-sm text-fg group-hover:text-primary">{toPreview(prevQuestion.question, 80)}</span>
          </Link>
        ) : <span />}
        {nextQuestion ? (
          <Link href={"/question/" + nextQuestion.id} className="group card-base hover-lift p-4 text-right">
            <span className="flex items-center justify-end gap-1.5 text-xs text-muted">
              下一题 <ArrowRightIcon size={13} />
            </span>
            <span className="mt-2 block line-clamp-2 text-sm text-fg group-hover:text-primary">{toPreview(nextQuestion.question, 80)}</span>
          </Link>
        ) : <span />}
      </div>
    </article>
  )
}
