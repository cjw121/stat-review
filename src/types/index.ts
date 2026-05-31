export interface Chapter {
  id: string
  title: string
}

export interface Course {
  id: string
  title: string
  description: string
  chapters: Chapter[]
}

export interface Question {
  id: string
  courseId: string
  chapterId: string
  question: string
  answer: string
  followups: string[]
  difficulty: '基础' | '进阶' | '拔高'
  tags: string[]
  isPremium?: boolean
}

export type MasteryStatus = 'mastered' | 'unsure' | null
