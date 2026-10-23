import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllCourses, getCourse, getQuestionsByChapter } from "@/lib/data"
import { Breadcrumb } from "@/components/Breadcrumb"
import { QuestionCard } from "@/components/QuestionCard"
import { LayersIcon } from "@/components/icons"

interface Props {
  params: Promise<{ courseId: string; chapterId: string }>
}

export function generateStaticParams() {
  const params: { courseId: string; chapterId: string }[] = []
  for (const course of getAllCourses()) {
    for (const chapter of course.chapters) {
      params.push({ courseId: course.id, chapterId: chapter.id })
    }
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId, chapterId } = await params
  const course = getCourse(courseId)
  const chapter = course?.chapters.find((c) => c.id === chapterId)
  return {
    title: chapter ? chapter.title + " · " + course?.title : "章节",
    description: chapter ? chapter.title + " 面试题合集" : undefined,
  }
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
      <section className="border-b border-border bg-card/45">
        <div className="container-page max-w-3xl px-5 py-10 md:py-12">
          <Breadcrumb
            crumbs={[
              { label: "首页", href: "/" },
              { label: course.title, href: "/course/" + courseId },
              { label: chapter.title },
            ]}
          />
          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">{course.title}</p>
              <h1 className="font-display mt-2 text-3xl tracking-tight text-fg md:text-4xl">{chapter.title}</h1>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted shadow-soft">
              <LayersIcon size={16} className="text-primary" />
              {questions.length} 道题
            </div>
          </div>
        </div>
      </section>

      <section className="container-page max-w-3xl px-5 py-10">
        {questions.length === 0 ? (
          <div className="card-base py-16 text-center text-sm text-muted">本章节暂无题目</div>
        ) : (
          <div className="flex flex-col gap-3">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
