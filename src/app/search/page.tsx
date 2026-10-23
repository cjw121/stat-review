'use client'

import { useMemo, useState } from "react"
import { getAllCourses, getAllTags, searchQuestions, type Difficulty } from "@/lib/data"
import { QuestionCard } from "@/components/QuestionCard"
import { SearchIcon, XIcon } from "@/components/icons"

const courses = getAllCourses()
const allTags = getAllTags()

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [courseId, setCourseId] = useState("all")
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all")
  const [tag, setTag] = useState("all")

  const results = useMemo(() => {
    if (query.trim().length < 1) return []
    return searchQuestions(query, {
      courseId,
      difficulty,
      tags: tag === "all" ? undefined : [tag],
    })
  }, [query, courseId, difficulty, tag])

  const hasFilters = courseId !== "all" || difficulty !== "all" || tag !== "all"

  return (
    <div className="min-h-screen bg-page">
      <section className="border-b border-border bg-card/45">
        <div className="container-page max-w-3xl px-5 py-10 md:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">Search</p>
          <h1 className="font-display mt-2 text-3xl tracking-tight text-fg md:text-4xl">搜索题目与知识点</h1>
          <div className="relative mt-6">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入题目关键词，如「极限」「特征值」「极大似然」…"
              autoFocus
              className="h-14 w-full rounded-2xl border border-border bg-card pl-11 pr-12 text-[16px] text-fg shadow-soft transition-colors placeholder:text-faint focus:border-primary focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-fg"
                aria-label="清空"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="container-page max-w-3xl px-5 py-8">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect value={courseId} onChange={setCourseId}>
            <option value="all">全部科目</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </FilterSelect>
          <FilterSelect value={difficulty} onChange={(value) => setDifficulty(value as "all" | Difficulty)}>
            <option value="all">全部难度</option>
            <option value="基础">基础</option>
            <option value="进阶">进阶</option>
            <option value="拔高">拔高</option>
          </FilterSelect>
          <FilterSelect value={tag} onChange={setTag}>
            <option value="all">全部标签</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </FilterSelect>
          {hasFilters && (
            <button
              onClick={() => {
                setCourseId("all")
                setDifficulty("all")
                setTag("all")
              }}
              className="rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-subtle hover:text-fg"
            >
              清除筛选
            </button>
          )}
        </div>

        <div className="mt-6">
          {query.trim().length === 0 ? (
            <EmptyState title="输入关键词开始搜索" text="可同时按科目、难度和标签过滤，搜索范围包括题目、答案与标签。" />
          ) : results.length === 0 ? (
            <EmptyState title={"未找到与 “" + query.trim() + "” 相关的内容"} text="试试更短的关键词，或清除部分筛选条件。" />
          ) : (
            <>
              <p className="mb-3 text-sm text-muted">
                找到 <span className="font-semibold text-fg">{results.length}</span> 道题
              </p>
              <div className="flex flex-col gap-3">
                {results.map((question) => (
                  <QuestionCard key={question.id} question={question} showCourse />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-fg shadow-soft focus:border-primary focus:outline-none"
    >
      {children}
    </select>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="card-base px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-subtle text-muted">
        <SearchIcon size={20} />
      </div>
      <h2 className="mt-4 font-semibold text-fg">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{text}</p>
    </div>
  )
}
