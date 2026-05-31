'use client'
import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>('bookmarks', [])

  const toggle = useCallback(
    (id: string) => {
      setBookmarks((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      )
    },
    [setBookmarks]
  )

  const isBookmarked = useCallback((id: string) => bookmarks.includes(id), [bookmarks])

  return { bookmarks, toggle, isBookmarked }
}
