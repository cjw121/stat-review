'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getAllCourses, searchQuestions } from "@/lib/data"
import { cn, toPreview } from "@/lib/utils"
import { ArrowRightIcon, LayersIcon, SearchIcon, ShuffleIcon, XIcon } from "./icons"
import type { Question } from "@/types"

type CommandPaletteProps = {
  open: boolean
  onClose: () => void
}

type QuickAction = {
  id: string
  label: string
  hint: string
  href: string
  icon: ReactNode
}

const quickActions: QuickAction[] = [
  { id: "quiz", label: "随机抽题", hint: "模拟面试", href: "/quiz", icon: <ShuffleIcon size={16} /> },
  { id: "search", label: "高级搜索", hint: "按科目与难度筛选", href: "/search", icon: <SearchIcon size={16} /> },
  { id: "bookmarks", label: "我的收藏", hint: "本地保存", href: "/bookmarks", icon: <LayersIcon size={16} /> },
]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  const courses = useMemo(() => getAllCourses(), [])
  const results = useMemo<Question[]>(
    () => (query.trim() ? searchQuestions(query.trim()).slice(0, 8) : []),
    [query],
  )

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    window.setTimeout(() => inputRef.current?.focus(), 20)
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % (results.length || courses.length + quickActions.length))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const total = results.length || courses.length + quickActions.length
        setActiveIndex((i) => (i - 1 + total) % total)
      } else if (e.key === "Enter") {
        e.preventDefault()
        choose(results.length ? results[activeIndex] : null)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, results, activeIndex, courses, onClose, choose])

  if (!open) return null

  function choose(question: Question | null) {
    if (question) {
      router.push("/question/" + question.id)
    } else if (activeIndex < courses.length) {
      router.push("/course/" + courses[activeIndex].id)
    } else {
      router.push(quickActions[activeIndex - courses.length].href)
    }
    onClose()
  }

  const activeId = results.length
    ? results[activeIndex]?.id
    : activeIndex < courses.length
      ? "course-" + courses[activeIndex].id
      : quickActions[activeIndex - courses.length]?.id

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px] animate-fade"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="mx-auto mt-[13vh] w-[calc(100%-2rem)] max-w-xl animate-rise">
        <div className="card-base shadow-lift overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-4">
            <SearchIcon size={18} className="text-muted shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              placeholder="搜索题目、答案、知识点…"
              className="h-14 flex-1 bg-transparent text-[16px] text-fg placeholder:text-faint focus:outline-none"
            />
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-fg"
              aria-label="关闭"
            >
              <XIcon size={15} />
            </button>
          </div>

          <div className="max-h-[52vh] overflow-y-auto p-2">
            {query.trim() && results.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-muted">
                没有找到与 “{query.trim()}” 相关的内容
              </div>
            )}

            {!query.trim() && (
              <>
                <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-faint">科目</p>
                {courses.map((course, index) => (
                  <button
                    key={course.id}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      router.push("/course/" + course.id)
                      onClose()
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors",
                      activeId === "course-" + course.id && "bg-subtle",
                    )}
                  >
                    <div>
                      <div className="text-[15px] font-medium text-fg">{course.title}</div>
                      <div className="mt-0.5 text-xs text-muted">{course.description}</div>
                    </div>
                    <ArrowRightIcon size={16} className="text-faint" />
                  </button>
                ))}
                <p className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-faint">快捷入口</p>
                {quickActions.map((action, index) => {
                  const globalIndex = courses.length + index
                  return (
                    <button
                      key={action.id}
                      onMouseEnter={() => setActiveIndex(globalIndex)}
                      onClick={() => {
                        router.push(action.href)
                        onClose()
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        activeId === action.id && "bg-subtle",
                      )}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        {action.icon}
                      </span>
                      <div className="flex-1">
                        <div className="text-[15px] font-medium text-fg">{action.label}</div>
                        <div className="text-xs text-muted">{action.hint}</div>
                      </div>
                      <ArrowRightIcon size={15} className="text-faint" />
                    </button>
                  )
                })}
              </>
            )}

            {query.trim() && results.length > 0 && (
              <>
                <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
                  题目 · {results.length}
                </p>
                {results.map((question, index) => (
                  <button
                    key={question.id}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(question)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                      activeId === question.id && "bg-subtle",
                    )}
                  >
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-soft text-[11px] font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block text-[14px] leading-snug text-fg">{toPreview(question.question, 120)}</span>
                      <span className="mt-1 block text-xs text-muted">{getCourseLabel(question.courseId)}</span>
                    </span>
                    <ArrowRightIcon size={15} className="mt-1 text-faint" />
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-faint">
            <span className="flex items-center gap-1"><kbd className="rounded bg-subtle px-1.5 py-0.5">↑↓</kbd> 选择</span>
            <span className="flex items-center gap-1"><kbd className="rounded bg-subtle px-1.5 py-0.5">Enter</kbd> 打开</span>
            <span className="flex items-center gap-1"><kbd className="rounded bg-subtle px-1.5 py-0.5">Esc</kbd> 关闭</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCourseLabel(courseId: string) {
  const map: Record<string, string> = {
    "math-analysis": "数学分析",
    "advanced-algebra": "高等代数",
    probability: "概率论与数理统计",
  }
  return map[courseId] ?? courseId
}

