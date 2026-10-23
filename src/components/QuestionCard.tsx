import Link from "next/link"
import type { Question } from "@/types"
import { cn, toPreview } from "@/lib/utils"
import { ArrowRightIcon } from "./icons"

const difficultyStyles: Record<string, string> = {
  基础: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  进阶: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  拔高: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
}

const courseLabels: Record<string, string> = {
  "math-analysis": "数学分析",
  "advanced-algebra": "高等代数",
  probability: "概率论",
}

interface QuestionCardProps {
  question: Question
  showCourse?: boolean
}

export function QuestionCard({ question, showCourse = false }: QuestionCardProps) {
  return (
    <Link
      href={"/question/" + question.id}
      className="group card-base hover-lift block p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="line-clamp-3 flex-1 text-[15px] leading-relaxed text-fg transition-colors group-hover:text-primary">
          {toPreview(question.question, 160)}
        </p>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", difficultyStyles[question.difficulty] ?? "bg-subtle text-muted")}>
          {question.difficulty}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {question.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full border border-border bg-subtle px-2 py-0.5 text-[11px] text-muted">
            {tag}
          </span>
        ))}
        {showCourse && (
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">
            {courseLabels[question.courseId] ?? question.courseId}
          </span>
        )}
        <ArrowRightIcon size={14} className="ml-auto text-faint opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  )
}
