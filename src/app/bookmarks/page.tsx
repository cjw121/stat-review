'use client'

import { useState } from "react"
import { getAllQuestions } from "@/lib/data"
import { QuestionCard } from "@/components/QuestionCard"
import { useBookmarks } from "@/hooks/useBookmarks"
import { useMastery } from "@/hooks/useMastery"
import { BookmarkIcon, CheckIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

const allQuestions = getAllQuestions()

type Tab = "bookmarks" | "mastered" | "unsure"

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks()
  const { masteryMap } = useMastery()
  const [tab, setTab] = useState<Tab>("bookmarks")

  const lists: Record<Tab, typeof allQuestions> = {
    bookmarks: allQuestions.filter((q) => bookmarks.includes(q.id)),
    mastered: allQuestions.filter((q) => masteryMap[q.id] === "mastered"),
    unsure: allQuestions.filter((q) => masteryMap[q.id] === "unsure"),
  }

  const tabs: { id: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    { id: "bookmarks", label: "收藏的题目", count: lists.bookmarks.length, icon: <BookmarkIcon size={15} /> },
    { id: "mastered", label: "已掌握", count: lists.mastered.length, icon: <CheckIcon size={15} /> },
    { id: "unsure", label: "不熟练", count: lists.unsure.length, icon: <span className="text-xs">△</span> },
  ]

  return (
    <div className="min-h-screen bg-page">
      <section className="border-b border-border bg-card/45">
        <div className="container-page max-w-3xl px-5 py-10 md:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">Library</p>
          <h1 className="font-display mt-2 text-3xl tracking-tight text-fg md:text-4xl">我的收藏</h1>
          <p className="mt-3 text-[15px] text-muted">收藏与掌握标记保存在当前浏览器中，无需登录。</p>
        </div>
      </section>

      <section className="container-page max-w-3xl px-5 py-8">
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1 shadow-soft">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                tab === item.id ? "bg-subtle text-fg" : "text-muted hover:text-fg",
              )}
            >
              {item.icon}
              {item.label}
              <span className={cn("rounded-full px-1.5 text-[11px]", tab === item.id ? "bg-primary-soft text-primary" : "bg-subtle text-muted")}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          {lists[tab].length === 0 ? (
            <EmptyState type={tab} />
          ) : (
            <div className="flex flex-col gap-3">
              {lists[tab].map((question) => (
                <QuestionCard key={question.id} question={question} showCourse />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function EmptyState({ type }: { type: Tab }) {
  const text: Record<Tab, { title: string; body: string }> = {
    bookmarks: { title: "还没有收藏任何题目", body: "在题目详情页或抽题时点击收藏，就能在这里快速复习。" },
    mastered: { title: "还没有标记已掌握的题目", body: "把已经吃透的题目标记为「已掌握」，让它们成为你的信心资产。" },
    unsure: { title: "还没有标记不熟练的题目", body: "标记不熟练后集中攻克，避免反复刷已经掌握的内容。" },
  }
  return (
    <div className="card-base px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-subtle text-muted">
        <BookmarkIcon size={20} />
      </div>
      <h2 className="mt-4 font-semibold text-fg">{text[type].title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{text[type].body}</p>
    </div>
  )
}
