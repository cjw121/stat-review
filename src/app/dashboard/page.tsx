'use client'

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { AuthGuard } from "@/components/AuthGuard"
import { getAllCourses, getAllQuestions } from "@/lib/data"
import { STATUS_LABELS, STATUS_COLORS, type ProgressStatus } from "@/lib/sm2"
import { ArrowRightIcon, BarChartIcon, ShuffleIcon } from "@/components/icons"

const courses = getAllCourses()
const allQuestions = getAllQuestions()
const STATUS_ORDER: ProgressStatus[] = ["new", "learning", "familiar", "mastered"]

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
      const { data: progress } = await supabase
        .from("question_progress")
        .select("question_id, status")
        .eq("user_id", user!.id)

      const map: Record<string, ProgressStatus> = {}
      for (const p of progress ?? []) map[p.question_id] = p.status
      setProgressMap(map)

      const since = new Date()
      since.setDate(since.getDate() - 84)
      const { data: logs } = await supabase
        .from("review_log")
        .select("reviewed_at")
        .eq("user_id", user!.id)
        .gte("reviewed_at", since.toISOString())
        .order("reviewed_at", { ascending: true })

      const dayMap: Record<string, number> = {}
      for (const log of logs ?? []) {
        const day = log.reviewed_at.slice(0, 10)
        dayMap[day] = (dayMap[day] ?? 0) + 1
      }

      const result: { date: string; count: number }[] = []
      for (let i = 83; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        result.push({ date: key.slice(5), count: dayMap[key] ?? 0 })
      }
      setDailyData(result.slice(-30))
      setTotalReviews(Object.values(dayMap).reduce((a, b) => a + b, 0))

      let streakDays = 0
      const today = new Date().toISOString().slice(0, 10)
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      const hasToday = !!dayMap[today]
      let check = hasToday ? today : yesterday
      while (dayMap[check] > 0) {
        streakDays++
        const d = new Date(check)
        d.setDate(d.getDate() - 1)
        check = d.toISOString().slice(0, 10)
      }
      setStreak(streakDays)
      setLoading(false)
    }
    load()
  }, [user])

  const statusCount: Record<ProgressStatus, number> = { new: 0, learning: 0, familiar: 0, mastered: 0 }
  const total = allQuestions.length
  for (const question of allQuestions) {
    const status = progressMap[question.id] ?? "new"
    statusCount[status]++
  }
  const pieData = STATUS_ORDER.map((status) => ({
    name: STATUS_LABELS[status],
    value: statusCount[status],
    color: STATUS_COLORS[status],
  }))

  const courseProgress = courses.map((course) => {
    const questions = allQuestions.filter((q) => q.courseId === course.id)
    const touched = questions.filter((q) => progressMap[q.id] && progressMap[q.id] !== "new").length
    const mastered = questions.filter((q) => progressMap[q.id] === "mastered").length
    return { ...course, total: questions.length, touched, mastered }
  })

  return (
    <div className="min-h-screen bg-page">
      <section className="border-b border-border bg-card/45">
        <div className="container-page max-w-4xl px-5 py-10 md:py-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">Analytics</p>
              <h1 className="font-display mt-2 text-3xl tracking-tight text-fg md:text-4xl">学习统计</h1>
              <p className="mt-3 text-[15px] text-muted">{profile ? "你好，" + profile.username : "你的复习轨迹"}</p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <BarChartIcon size={22} />
            </span>
          </div>
        </div>
      </section>

      <section className="container-page max-w-4xl px-5 py-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "题库总量", value: total },
            { label: "已接触", value: Object.keys(progressMap).length },
            { label: "累计答题", value: totalReviews },
            { label: "连续打卡", value: streak + " 天" },
          ].map((card) => (
            <div key={card.label} className="card-base p-4">
              <div className="font-display text-2xl font-semibold text-fg">{card.value}</div>
              <div className="mt-1 text-xs text-muted">{card.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="card-base mt-6 py-20 text-center text-sm text-muted">加载中…</div>
        ) : (
          <>
            <div className="card-base mt-4 p-5 md:p-6">
              <h2 className="font-semibold text-fg">全局掌握分布</h2>
              {Object.keys(progressMap).length === 0 ? (
                <p className="mt-4 text-sm text-muted">还没有答题记录，先去做几道题吧。</p>
              ) : (
                <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={46} outerRadius={82} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value + " 题"} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-1 flex-col gap-2.5">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
                        <span className="text-fg">{item.name}</span>
                        <span className="ml-auto text-muted">{item.value} 题</span>
                        <span className="w-10 text-right text-muted">{Math.round((item.value / total) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card-base mt-4 p-5 md:p-6">
              <h2 className="font-semibold text-fg">各课程进度</h2>
              <div className="mt-5 flex flex-col gap-5">
                {courseProgress.map((course) => {
                  const percent = course.total ? Math.round((course.touched / course.total) * 100) : 0
                  return (
                    <div key={course.id}>
                      <div className="mb-2 flex items-end justify-between text-sm">
                        <span className="font-medium text-fg">{course.title}</span>
                        <span className="text-xs text-muted">{course.touched}/{course.total} 已接触 · {course.mastered} 已掌握</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-subtle">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: percent + "%" }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card-base mt-4 p-5 md:p-6">
              <h2 className="font-semibold text-fg">最近 30 天答题量</h2>
              {totalReviews === 0 ? (
                <p className="mt-4 text-sm text-muted">暂无答题记录</p>
              ) : (
                <div className="mt-5 h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} margin={{ left: -20, right: 8 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--fg-faint)" }} interval={4} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--fg-faint)" }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-col)", borderRadius: 10, fontSize: 12 }}
                        labelFormatter={(label) => "日期：" + label}
                        formatter={(value) => value + " 题"}
                      />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Link href="/review" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-accent-strong">
                开始今日复习
                <ArrowRightIcon size={15} />
              </Link>
              <Link href="/quiz" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-fg transition-colors hover:border-border-strong">
                <ShuffleIcon size={15} />
                随机抽题
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
