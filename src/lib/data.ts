import type { Course, Question } from "@/types"
import coursesData from "@/data/courses.json"
import mathAnalysisData from "@/data/questions/math-analysis.json"
import advancedAlgebraData from "@/data/questions/advanced-algebra.json"
import probabilityData from "@/data/questions/probability.json"

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
  return getAllQuestions().filter((q) => q.courseId === courseId && q.chapterId === chapterId)
}

export function getQuestion(questionId: string): Question | undefined {
  return getAllQuestions().find((q) => q.id === questionId)
}

export function getChapterTitle(courseId: string, chapterId: string): string {
  const course = getCourse(courseId)
  return course?.chapters.find((c) => c.id === chapterId)?.title ?? chapterId
}

export function getCourseLabel(courseId: string): string {
  return getCourse(courseId)?.title ?? courseId
}

export function getAllTags(): string[] {
  const set = new Set<string>()
  for (const question of getAllQuestions()) {
    for (const tag of question.tags) set.add(tag)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "zh-CN"))
}

export type Difficulty = "基础" | "进阶" | "拔高"

export interface SearchFilters {
  courseId?: "all" | string
  difficulty?: "all" | Difficulty
  tags?: string[]
}

export function searchQuestions(query: string, filters: SearchFilters = {}): Question[] {
  const q = query.trim().toLowerCase()
  const all = getAllQuestions()

  const filtered = all.filter((question) => {
    if (filters.courseId && filters.courseId !== "all" && question.courseId !== filters.courseId) return false
    if (filters.difficulty && filters.difficulty !== "all" && question.difficulty !== filters.difficulty) return false
    if (filters.tags && filters.tags.length > 0 && !question.tags.some((t) => filters.tags!.includes(t))) return false
    return true
  })

  if (!q) return filtered

  const courseLabel = filters.courseId && filters.courseId !== "all" ? getCourseLabel(filters.courseId).toLowerCase() : ""

  return filtered
    .map((question) => {
      const haystack = [
        question.question,
        question.answer,
        question.tags.join(" "),
        question.id,
        getCourseLabel(question.courseId),
        getChapterTitle(question.courseId, question.chapterId),
        courseLabel,
      ]
        .join(" ")
        .toLowerCase()

      let score = 0
      const terms = q.split(/s+/).filter(Boolean)
      for (const term of terms) {
        if (question.id.toLowerCase() === term) score += 8
        if (question.question.toLowerCase().includes(term)) score += 6
        if (question.tags.some((t) => t.toLowerCase() === term)) score += 5
        if (question.answer.toLowerCase().includes(term)) score += 3
        if (haystack.includes(term)) score += 2
      }
      return { question, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.question)
}

export interface CourseStats {
  course: Course
  total: number
  chapters: { id: string; title: string; count: number }[]
}

export function getCourseStats(): CourseStats[] {
  const all = getAllQuestions()
  return getAllCourses().map((course) => {
    const questions = all.filter((q) => q.courseId === course.id)
    return {
      course,
      total: questions.length,
      chapters: course.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        count: questions.filter((q) => q.chapterId === chapter.id).length,
      })),
    }
  })
}
