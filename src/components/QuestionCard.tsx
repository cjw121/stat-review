import Link from 'next/link'
import type { Question } from '@/types'

const difficultyColor: Record<string, string> = {
  基础: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
  进阶: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
  拔高: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30',
}

interface Props {
  question: Question
  showCourse?: boolean
}

export function QuestionCard({ question, showCourse = false }: Props) {
  return (
    <Link
      href={`/question/${question.id}`}
      className="block bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-fg text-[15px] leading-relaxed line-clamp-3 flex-1 group-hover:text-primary transition-colors duration-150">
          {stripLatex(question.question)}
        </p>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor[question.difficulty] ?? 'text-muted bg-page'}`}
        >
          {question.difficulty}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {question.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="text-xs text-muted bg-page px-2 py-0.5 rounded-full border border-border"
          >
            {tag}
          </span>
        ))}
        {showCourse && (
          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {question.courseId === 'math-analysis'
              ? '数学分析'
              : question.courseId === 'advanced-algebra'
              ? '高等代数'
              : '概率论'}
          </span>
        )}
      </div>
    </Link>
  )
}

// Remove LaTeX markers for card preview text
function stripLatex(text: string): string {
  return text
    .replace(/\$\$[\s\S]*?\$\$/g, '[公式]')
    .replace(/\$[^$]*?\$/g, '[公式]')
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
    .trim()
}
