'use client'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/AuthGuard'
import { getAllCourses, getAllQuestions } from '@/lib/data'
import { STATUS_LABELS, STATUS_COLORS, type ProgressStatus } from '@/lib/sm2'
import Link from 'next/link'

const courses = getAllCourses()
const allQ = getAllQuestions()

const STATUS_ORDER: ProgressStatus[] = ['new', 'learning', 'familiar', 'mastered']

export default function DashboardPage() {
  return <AuthGuard><DashboardContent /></AuthGuard>
}

function DashboardContent() {
  const { user, profile } = useAuth()
  const [progressMap, setProgressMap] = useState<Record<string, ProgressStatus>>({})
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [totalReviews, setTotalReviews] = useState(0)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!user) return
    async function load() {
      // 查询题目进度
      const { data: progress } = await supabase
        .from('question_progress')
        .select('question_id, status')
        .eq('user_id', user!.id)

      const map: Record<string, ProgressStatus> = {}
      for (const p of progress ?? []) map[p.question_id] = p.status
      setProgressMap(map)

      // 查询最近 84 天（12 周）的答题日志
      const since = new Date()
      since.setDate(since.getDate() - 84)
      const { data: logs } = await supabase
        .from('review_log')
        .select('reviewed_at')
        .eq('user_id', user!.id)
        .gte('reviewed_at', since.toISOString())
        .order('reviewed_at', { ascending: true })

      // 按日期聚合
      const dayMap: Record<string, number> = {}
      for (const log of logs ?? []) {
        const day = log.reviewed_at.slice(0, 10)
        dayMap[day] = (dayMap[day] ?? 0) + 1
      }
      // 填充最近 12 周的空日期
      const result: { date: string; count: number }[] = []
      for (let i = 83; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        result.push({ date: key.slice(5), count: dayMap[key] ?? 0 })
      }
      // 只展示最近 30 天（柱状图）
      setDailyData(result.slice(-30))
      setTotalReviews(Object.values(dayMap).reduce((a, b) => a + b, 0))

      // 计算连续打卡天数
      let s = 0
      const today = new Date().toISOString().slice(0, 10)
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      const hasToday = !!dayMap[today]
      let check = hasToday ? today : yesterday
      while (dayMap[check] > 0) {
        s++
        const d = new Date(check); d.setDate(d.getDate() - 1)
        check = d.toISOString().slice(0, 10)
      }
      setStreak(s)
      setLoading(false)
    }
    load()
  }, [user])

  // 全局掌握分布
  const statusCount: Record<ProgressStatus, number> = { new: 0, learning: 0, familiar: 0, mastered: 0 }
  const total = allQ.length
  for (const q of allQ) {
    const s = progressMap[q.id] ?? 'new'
    statusCount[s]++
  }
  const pieData = STATUS_ORDER.map(s => ({ name: STATUS_LABELS[s], value: statusCount[s], color: STATUS_COLORS[s] }))

  // 各课程进度
  const courseProgress = courses.map(c => {
    const qs = allQ.filter(q => q.courseId === c.id)
    const touched = qs.filter(q => progressMap[q.id] && progressMap[q.id] !== 'new').length
    const mastered = qs.filter(q => progressMap[q.id] === 'mastered').length
    return { ...c, total: qs.length, touched, mastered }
  })

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-fg mb-2">学习统计</h1>
        <p className="text-muted text-sm mb-8">
          {profile ? `你好，${profile.username}` : ''}
        </p>

        {/* 小指标卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: '题库总量', value: total },
            { label: '已接触', value: Object.keys(progressMap).length },
            { label: '累计答题', value: totalReviews },
            { label: '连续打卡', value: `${streak} 天` },
          ].map(card => (
            <div key={card.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary">{card.value}</div>
              <div className="text-xs text-muted mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted">加载中…</div>
        ) : (
          <>
            {/* 掌握情况总览 */}
            <div className="bg-card border border-border rounded-xl p-5 mb-4">
              <h2 className="font-semibold text-fg mb-4">全局掌握分布</h2>
              {Object.keys(progressMap).length === 0 ? (
                <p className="text-muted text-sm">还没有答题记录，去做几道题吧！</p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `${v} 题`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 text-sm flex-1">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-fg">{d.name}</span>
                        <span className="ml-auto text-muted">{d.value} 题</span>
                        <span className="text-muted w-10 text-right">{Math.round(d.value/total*100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 各课程进度 */}
            <div className="bg-card border border-border rounded-xl p-5 mb-4">
              <h2 className="font-semibold text-fg mb-4">各课程进度</h2>
              <div className="flex flex-col gap-4">
                {courseProgress.map(c => (
                  <div key={c.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-fg font-medium">{c.title}</span>
                      <span className="text-muted">{c.touched}/{c.total} 已接触 · {c.mastered} 已掌握</span>
                    </div>
                    <div className="h-2 bg-page rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${c.total ? c.touched/c.total*100 : 0}%`, background: '#1A6B7A' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 每日答题量 */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-fg mb-4">最近 30 天答题量</h2>
              {totalReviews === 0 ? (
                <p className="text-muted text-sm">暂无答题记录</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={dailyData} margin={{ left: -20, right: 8 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-col)', borderRadius: 8, fontSize: 12 }}
                      labelFormatter={l => `日期：${l}`}
                      formatter={(v) => `${v} 题`}
                    />
                    <Bar dataKey="count" fill="#1A6B7A" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Link href="/review" className="flex-1 text-center bg-primary-btn text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                开始今日复习
              </Link>
              <Link href="/quiz" className="flex-1 text-center border border-border text-fg py-2.5 rounded-xl text-sm font-semibold hover:border-primary/50 transition-colors">
                随机抽题
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
