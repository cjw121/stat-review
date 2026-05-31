'use client'
import { useState } from 'react'
import { searchQuestions } from '@/lib/data'
import { QuestionCard } from '@/components/QuestionCard'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const results = query.trim().length >= 1 ? searchQuestions(query) : []

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-fg mb-6">搜索题目</h1>

        {/* Search input */}
        <div className="relative mb-6">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={'输入题目关键词或标签，如「极限」「特征值」…'}
            autoFocus
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-fg text-[16px] focus:outline-none focus:border-primary transition-colors duration-150 placeholder:text-muted"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Results */}
        {query.trim().length === 0 ? (
          <div className="text-center py-16 text-muted">输入关键词开始搜索</div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-muted">
            未找到与 <span className="text-fg">"{query}"</span> 相关的题目
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-3">找到 {results.length} 道题</p>
            <div className="flex flex-col gap-3">
              {results.map((q) => (
                <QuestionCard key={q.id} question={q} showCourse />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
