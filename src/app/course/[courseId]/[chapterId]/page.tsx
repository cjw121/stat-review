import { notFound } from 'next/navigation'
import { getCourse, getQuestionsByChapter } from '@/lib/data'
import { Breadcrumb } from '@/components/Breadcrumb'
import { QuestionCard } from '@/components/QuestionCard'

interface Props {
  params: Promise<{ courseId: string; chapterId: string }>
}

export default async function ChapterPage({ params }: Props) {
  const { courseId, chapterId } = await params
  const course = getCourse(courseId)
  if (!course) notFound()

  const chapter = course.chapters.find((c) => c.id === chapterId)
  if (!chapter) notFound()

  const questions = getQuestionsByChapter(courseId, chapterId)

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumb
          crumbs={[
            { label: '首页', href: '/' },
            { label: course.title, href: `/course/${courseId}` },
            { label: chapter.title },
          ]}
        />

        <h1 className="text-2xl font-bold text-fg mb-1">{chapter.title}</h1>
        <p className="text-muted text-sm mb-6">{course.title} · {questions.length} 道题</p>

        {questions.length === 0 ? (
          <div className="text-center py-20 text-muted">本章节暂无题目</div>
        ) : (
          <div className="flex flex-col gap-3">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
