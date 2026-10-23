import type { ReactNode } from "react"
import Link from "next/link"
import { getCourseStats, getAllQuestions } from "@/lib/data"
import { ArrowRightIcon, BookmarkIcon, SearchIcon, ShuffleIcon, SigmaIcon, SparklesIcon, ClockIcon } from "@/components/icons"

const courseStats = getCourseStats()
const totalQuestions = getAllQuestions().length

const courseIcons: Record<string, ReactNode> = {
  "math-analysis": <SigmaIcon size={22} />,
  "advanced-algebra": <span className="font-display text-[22px]">A</span>,
  probability: <span className="font-display text-[22px]">P</span>,
}

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_20%_0%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_42%),radial-gradient(circle_at_80%_10%,color-mix(in_srgb,var(--accent)_10%,transparent),transparent_38%)]" />
        <div className="container-page relative grid max-w-6xl gap-14 px-5 pb-16 pt-16 md:pb-24 md:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted shadow-soft backdrop-blur">
              <SparklesIcon size={14} className="text-accent" />
              应用统计 · 保研面试系统复习
            </div>
            <h1 className="font-display mt-6 max-w-2xl text-4xl leading-[1.12] tracking-tight text-fg md:text-6xl">
              把零散面试题，变成你的知识体系
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
              覆盖数学分析、高等代数、概率论与数理统计，{totalQuestions} 道高频题搭配标准答案与追问链，用间隔复习把短期记忆变成长时掌握。
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-lift"
              >
                <ShuffleIcon size={17} />
                随机抽题模拟面试
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-fg shadow-soft transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lift"
              >
                <SearchIcon size={17} />
                搜索知识点
              </Link>
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                { value: "3", label: "核心科目" },
                { value: String(totalQuestions), label: "高频面试题" },
                { value: "16", label: "知识章节" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-3xl font-semibold text-fg">{stat.value}</dt>
                  <dd className="mt-1 text-xs text-muted">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden lg:block">
            <div className="card-base shadow-lift rotate-[1.5deg] p-5 transition-transform duration-500 hover:rotate-0">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">Today · 今日复习</span>
                <span className="rounded-full bg-primary-soft px-2 py-1 text-[11px] font-medium text-primary">间隔重复</span>
              </div>
              <div className="rounded-xl bg-subtle p-5">
                <p className="font-display text-xl leading-snug text-fg">请叙述大数定律与中心极限定理的区别，并各举一个应用场景。</p>
                <div className="mt-5 flex items-center gap-2">
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent-strong">概率论</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">进阶</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["忘记了", "模糊", "记得"].map((label, index) => (
                  <div key={label} className={index === 2 ? "rounded-xl bg-primary py-2.5 text-center text-xs font-semibold text-white" : "rounded-xl border border-border py-2.5 text-center text-xs font-medium text-muted"}>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/45">
        <div className="container-page max-w-6xl px-5 py-16 md:py-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">Curriculum</p>
              <h2 className="font-display mt-2 text-3xl tracking-tight text-fg md:text-4xl">选择科目开始复习</h2>
            </div>
            <Link href="/search" className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              浏览全部题目
              <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {courseStats.map(({ course, total, chapters }) => (
              <Link
                key={course.id}
                href={"/course/" + course.id}
                className="group card-base hover-lift relative overflow-hidden p-5"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                    {courseIcons[course.id]}
                  </span>
                  <ArrowRightIcon size={17} className="text-faint opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-fg group-hover:text-primary">{course.title}</h3>
                <p className="mt-2 min-h-[48px] text-sm leading-relaxed text-muted">{course.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted">
                  <span>{chapters.length} 个章节</span>
                  <span className="font-medium text-primary">{total} 道题</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page max-w-6xl px-5 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">Method</p>
            <h2 className="font-display mt-2 text-3xl tracking-tight text-fg md:text-4xl">不是刷题，是构建长期记忆</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: <SearchIcon size={19} />, title: "主动回忆", text: "先看问题独立作答，再展开参考答案，模拟真实面试的压力感。" },
              { icon: <ClockIcon size={19} />, title: "间隔重复", text: "用 SM-2 算法安排下次复习时间，在遗忘临界点前再次巩固。" },
              { icon: <BookmarkIcon size={19} />, title: "标记与收藏", text: "区分已掌握与不熟练，把精力集中在薄弱知识点上。" },
            ].map((item) => (
              <div key={item.title} className="card-base p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">{item.icon}</span>
                <h3 className="mt-4 font-semibold text-fg">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

