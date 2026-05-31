'use client'
import { getAllQuestions } from '@/lib/data'
import { QuestionCard } from '@/components/QuestionCard'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useMastery } from '@/hooks/useMastery'

const allQuestions = getAllQuestions()

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks()
  const { masteryMap } = useMastery()

  const bookmarked = allQuestions.filter((q) => bookmarks.includes(q.id))
  const mastered = allQuestions.filter((q) => masteryMap[q.id] === 'mastered')
  const unsure = allQuestions.filter((q) => masteryMap[q.id] === 'unsure')

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-fg mb-8">我的收藏</h1>

        <Section title="收藏的题目" count={bookmarked.length} emptyText="还没有收藏任何题目">
          {bookmarked.map((q) => <QuestionCard key={q.id} question={q} showCourse />)}
        </Section>

        <Section title="标记为「已掌握」" count={mastered.length} emptyText="还没有标记已掌握的题目">
          {mastered.map((q) => <QuestionCard key={q.id} question={q} showCourse />)}
        </Section>

        <Section title="标记为「不熟练」" count={unsure.length} emptyText="还没有标记不熟练的题目">
          {unsure.map((q) => <QuestionCard key={q.id} question={q} showCourse />)}
        </Section>
      </div>
    </div>
  )
}

function Section({
  title,
  count,
  emptyText,
  children,
}: {
  title: string
  count: number
  emptyText: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-fg mb-1">
        {title}
        <span className="ml-2 text-sm text-muted font-normal">({count})</span>
      </h2>
      {count === 0 ? (
        <p className="text-muted text-sm py-4">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-3 mt-3">{children}</div>
      )}
    </section>
  )
}
