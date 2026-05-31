import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCourse, getQuestionsByCourse } from '@/lib/data'
import { Breadcrumb } from '@/components/Breadcrumb'

interface Props {
  params: Promise<{ courseId: string }>
}

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params
  const course = getCourse(courseId)
  if (!course) notFound()

  const allQuestions = getQuestionsByCourse(courseId)

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumb crumbs={[{ label: '首页', href: '/' }, { label: course.title }]} />

        <h1 className="text-2xl font-bold text-fg mb-2">{course.title}</h1>
        <p className="text-muted mb-8">{course.description}</p>

        <div className="flex flex-col gap-3">
          {course.chapters.map((chapter) => {
            const count = allQuestions.filter((q) => q.chapterId === chapter.id).length
            return (
              <Link
                key={chapter.id}
                href={`/course/${courseId}/${chapter.id}`}
                className="flex items-center justify-between bg-card border border-border rounded-xl px-5 py-4 hover:border-primary/50 hover:shadow-sm transition-all duration-150 group"
              >
                <span className="font-medium text-fg group-hover:text-primary transition-colors duration-150">
                  {chapter.title}
                </span>
                <span className="text-sm text-muted">{count} 题 →</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
