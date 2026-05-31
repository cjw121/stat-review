import Link from 'next/link'
import { getAllCourses, getAllQuestions } from '@/lib/data'

const courses = getAllCourses()
const totalQuestions = getAllQuestions().length

const courseIcons: Record<string, string> = {
  'math-analysis': '∫',
  'advanced-algebra': '⊕',
  'probability': 'ℙ',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-page">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-14 pb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-fg leading-tight mb-4">
          应用统计保研面试备考
        </h1>
        <p className="text-muted text-[17px] max-w-xl mx-auto leading-relaxed mb-2">
          覆盖数学分析、高等代数、概率论与数理统计，含标准答案、追问链与公式渲染。
        </p>
        <p className="text-muted text-sm mb-8">
          共 <span className="text-primary font-semibold">{totalQuestions}</span> 道面试题，持续更新
        </p>

        {/* Search bar */}
        <Link
          href="/search"
          className="inline-flex items-center gap-3 w-full max-w-md mx-auto bg-card border border-border rounded-xl px-4 py-3 text-muted text-[15px] hover:border-primary/60 hover:shadow-sm transition-all duration-150 cursor-text"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span>搜索题目、知识点…</span>
        </Link>

        {/* Quiz CTA */}
        <div className="mt-6">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-primary-btn text-white font-semibold px-7 py-3 rounded-xl hover:opacity-90 transition-opacity duration-150 text-[16px]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            随机抽题模拟面试
          </Link>
        </div>
      </section>

      {/* Course cards */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-lg font-semibold text-fg mb-4">选择科目开始复习</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {courses.map((course) => {
            const count = getAllQuestions().filter((q) => q.courseId === course.id).length
            return (
              <Link
                key={course.id}
                href={`/course/${course.id}`}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all duration-150 group"
              >
                <div className="text-3xl font-mono text-primary mb-3 select-none">
                  {courseIcons[course.id]}
                </div>
                <h3 className="font-semibold text-fg text-[16px] mb-1 group-hover:text-primary transition-colors duration-150">
                  {course.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-3">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">{course.chapters.length} 章节</span>
                  <span className="text-primary font-medium">{count} 题 →</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-sm text-muted">
          {[
            { icon: '📐', label: '公式正确渲染', desc: 'KaTeX 驱动' },
            { icon: '🎲', label: '随机抽题', desc: '模拟面试节奏' },
            { icon: '🔖', label: '收藏标记', desc: '本地持久保存' },
            { icon: '🌙', label: '深色模式', desc: '护眼长时阅读' },
          ].map((f) => (
            <div key={f.label}>
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="font-medium text-fg">{f.label}</div>
              <div>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
