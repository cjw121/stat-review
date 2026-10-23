import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getAllCourses, getCourse, getQuestionsByCourse } from "@/lib/data"
import { Breadcrumb } from "@/components/Breadcrumb"
import { ArrowRightIcon, LayersIcon } from "@/components/icons"

interface Props {
  params: Promise<{ courseId: string }>
}

export function generateStaticParams() {
  return getAllCourses().map((course) => ({ courseId: course.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params
  const course = getCourse(courseId)
  return {
    title: course?.title,
    description: course?.description,
  }
}

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params
  const course = getCourse(courseId)
  if (!course) notFound()

  const questions = getQuestionsByCourse(courseId)

  return (
    <div className="min-h-screen bg-page">
      <section className="border-b border-border bg-card/45">
        <div className="container-page max-w-4xl px-5 py-10 md:py-14">
          <Breadcrumb crumbs={[{ label: "首页", href: "/" }, { label: course.title }]} />
          <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">Course</p>
              <h1 className="font-display mt-2 text-4xl tracking-tight text-fg md:text-5xl">{course.title}</h1>
              <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">{course.description}</p>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <LayersIcon size={19} />
              </span>
              <div>
                <div className="font-display text-2xl font-semibold leading-none text-fg">{questions.length}</div>
                <div className="mt-1 text-xs text-muted">道题目</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page max-w-4xl px-5 py-10">
        <div className="flex flex-col gap-3">
          {course.chapters.map((chapter, index) => {
            const count = questions.filter((q) => q.chapterId === chapter.id).length
            return (
              <Link
                key={chapter.id}
                href={"/course/" + courseId + "/" + chapter.id}
                className="group card-base hover-lift flex items-center gap-4 p-4"
              >
                <span className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-subtle text-lg font-semibold text-muted transition-colors group-hover:bg-primary-soft group-hover:text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-fg group-hover:text-primary">{chapter.title}</span>
                  <span className="mt-1 block text-xs text-muted">{count} 道题</span>
                </span>
                <ArrowRightIcon size={16} className="text-faint opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
