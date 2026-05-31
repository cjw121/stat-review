import { notFound } from 'next/navigation'
import { getQuestion, getCourse } from '@/lib/data'
import { Breadcrumb } from '@/components/Breadcrumb'
import { QuestionDetail } from './QuestionDetail'

interface Props {
  params: Promise<{ questionId: string }>
}

export default async function QuestionPage({ params }: Props) {
  const { questionId } = await params
  const question = getQuestion(questionId)
  if (!question) notFound()

  const course = getCourse(question.courseId)
  const chapter = course?.chapters.find((c) => c.id === question.chapterId)

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumb
          crumbs={[
            { label: '首页', href: '/' },
            { label: course?.title ?? question.courseId, href: `/course/${question.courseId}` },
            {
              label: chapter?.title ?? question.chapterId,
              href: `/course/${question.courseId}/${question.chapterId}`,
            },
            { label: '题目详情' },
          ]}
        />
        <QuestionDetail question={question} />
      </div>
    </div>
  )
}
