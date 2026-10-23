import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllQuestions, getCourse, getChapterTitle, getQuestion, getQuestionsByChapter } from "@/lib/data"
import { Breadcrumb } from "@/components/Breadcrumb"
import { QuestionDetail } from "./QuestionDetail"
import { toPreview } from "@/lib/utils"

interface Props {
  params: Promise<{ questionId: string }>
}

export function generateStaticParams() {
  return getAllQuestions().map((question) => ({ questionId: question.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { questionId } = await params
  const question = getQuestion(questionId)
  if (!question) return { title: "题目不存在" }
  const course = getCourse(question.courseId)
  return {
    title: toPreview(question.question, 52),
    description: course?.title + " · " + getChapterTitle(question.courseId, question.chapterId),
  }
}

export default async function QuestionPage({ params }: Props) {
  const { questionId } = await params
  const question = getQuestion(questionId)
  if (!question) notFound()

  const course = getCourse(question.courseId)
  const chapter = course?.chapters.find((c) => c.id === question.chapterId)
  const siblings = getQuestionsByChapter(question.courseId, question.chapterId)
  const index = siblings.findIndex((q) => q.id === questionId)
  const prevQuestion = index > 0 ? siblings[index - 1] : null
  const nextQuestion = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null

  return (
    <div className="min-h-screen bg-page">
      <div className="container-page max-w-3xl px-5 py-8 md:py-10">
        <Breadcrumb
          crumbs={[
            { label: "首页", href: "/" },
            { label: course?.title ?? question.courseId, href: "/course/" + question.courseId },
            {
              label: chapter?.title ?? question.chapterId,
              href: "/course/" + question.courseId + "/" + question.chapterId,
            },
            { label: "题目详情" },
          ]}
        />
        <QuestionDetail question={question} prevQuestion={prevQuestion} nextQuestion={nextQuestion} />
      </div>
    </div>
  )
}
