// SM-2 间隔重复算法（基于艾宾浩斯遗忘曲线）
// 输入：旧状态 + 自评结果 → 输出：新状态（纯函数，便于测试）

export type Rating = 'forget' | 'vague' | 'remember'
export type ProgressStatus = 'new' | 'learning' | 'familiar' | 'mastered'

export interface SM2State {
  repetitions: number    // 连续答对次数
  interval_days: number  // 当前复习间隔（天）
  ease_factor: number    // 难度系数（初始 2.5）
  status: ProgressStatus
}

export interface SM2Result extends SM2State {
  last_reviewed_at: string
  next_review_at: string
}

export function computeNextReview(current: SM2State, rating: Rating): SM2Result {
  let { repetitions, interval_days, ease_factor } = current
  const now = new Date()

  if (rating === 'forget') {
    repetitions = 0
    interval_days = 1
    ease_factor = Math.max(1.3, ease_factor - 0.2)
  } else if (rating === 'vague') {
    repetitions += 1
    interval_days = Math.max(1, Math.round(interval_days * 1.2))
    ease_factor = Math.max(1.3, ease_factor - 0.05)
  } else {
    // remember
    repetitions += 1
    if (repetitions === 1) interval_days = 1
    else if (repetitions === 2) interval_days = 4
    else interval_days = Math.round(interval_days * ease_factor)
    ease_factor = Math.min(2.8, ease_factor + 0.1)
  }

  const status = deriveStatus(repetitions, rating)
  const nextReview = new Date(now.getTime() + interval_days * 86_400_000)

  return {
    repetitions,
    interval_days,
    ease_factor,
    status,
    last_reviewed_at: now.toISOString(),
    next_review_at: nextReview.toISOString(),
  }
}

function deriveStatus(repetitions: number, rating: Rating): ProgressStatus {
  if (rating === 'forget') return 'learning'
  if (rating === 'vague') return repetitions >= 3 ? 'familiar' : 'learning'
  // remember
  if (repetitions >= 5) return 'mastered'
  if (repetitions >= 2) return 'familiar'
  return 'learning'
}

export const defaultSM2State: SM2State = {
  repetitions: 0,
  interval_days: 0,
  ease_factor: 2.5,
  status: 'new',
}

export const STATUS_LABELS: Record<ProgressStatus, string> = {
  new: '未学',
  learning: '学习中',
  familiar: '较熟',
  mastered: '已掌握',
}

export const STATUS_COLORS: Record<ProgressStatus, string> = {
  new: '#9CA3AF',
  learning: '#F59E0B',
  familiar: '#3B82F6',
  mastered: '#10B981',
}
