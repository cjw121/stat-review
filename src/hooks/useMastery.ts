'use client'
import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { MasteryStatus } from '@/types'

export function useMastery() {
  const [masteryMap, setMasteryMap] = useLocalStorage<Record<string, MasteryStatus>>(
    'mastery',
    {}
  )

  const setStatus = useCallback(
    (id: string, status: MasteryStatus) => {
      setMasteryMap((prev) => {
        if (status === null) {
          const next = { ...prev }
          delete next[id]
          return next
        }
        return { ...prev, [id]: status }
      })
    },
    [setMasteryMap]
  )

  const getStatus = useCallback(
    (id: string): MasteryStatus => masteryMap[id] ?? null,
    [masteryMap]
  )

  return { masteryMap, setStatus, getStatus }
}
