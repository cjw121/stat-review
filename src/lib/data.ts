import type { Course, Question } from '@/types'
import coursesData from '@/data/courses.json'
import mathAnalysisData from '@/data/questions/math-analysis.json'
import advancedAlgebraData from '@/data/questions/advanced-algebra.json'
import probabilityData from '@/data/questions/probability.json'

export function getAllCourses(): Course[] {
  return coursesData as Course[]
}

export function getCourse(courseId: string): Course | undefined {
  return getAllCourses().find((c) => c.id === courseId)
}

export function getAllQuestions(): Question[] {
  return [
    ...(mathAnalysisData as Question[]),
    ...(advancedAlgebraData as Question[]),
    ...(probabilityData as Question[]),
  ]
}

export function getQuestionsByCourse(courseId: string): Question[] {
  return getAllQuestions().filter((q) => q.courseId === courseId)
}

export function getQuestionsByChapter(courseId: string, chapterId: string): Question[] {
  return getAllQuestions().filter(
    (q) => q.courseId === courseId && q.chapterId === chapterId
  )
}

export function getQuestion(questionId: string): Question | undefined {
  return getAllQuestions().find((q) => q.id === questionId)
}

export function searchQuestions(query: string): Question[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return getAllQuestions().filter(
    (item) =>
      item.question.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
  )
}
