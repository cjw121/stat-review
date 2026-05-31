import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ---- 数据库类型 ----
export interface Profile {
  id: string
  username: string
  email: string | null
  created_at: string
}

export interface QuestionProgress {
  id: number
  user_id: string
  question_id: string
  course_id: string
  status: 'new' | 'learning' | 'familiar' | 'mastered'
  repetitions: number
  interval_days: number
  ease_factor: number
  last_reviewed_at: string | null
  next_review_at: string | null
  updated_at: string
}

export interface ReviewLog {
  id: number
  user_id: string
  question_id: string
  course_id: string
  result: 'forget' | 'vague' | 'remember'
  reviewed_at: string
}
