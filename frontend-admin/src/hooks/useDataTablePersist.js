import { useState, useEffect, useCallback } from 'react'

const PREFIX = 'datatable_'

export function useDataTablePersist(storageKey, defaults = {}) {
  const key = storageKey ? `${PREFIX}${storageKey}` : null
  const [pageSize, setPageSizeState] = useState(defaults.limit ?? 20)
  const [sortKey, setSortKeyState] = useState(defaults.sortKey ?? null)
  const [sortOrder, setSortOrderState] = useState(defaults.sortOrder ?? 'desc')

  useEffect(() => {
    if (!key || typeof localStorage === 'undefined') return
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.pageSize != null) setPageSizeState(Number(parsed.pageSize))
        if (parsed.sortKey != null) setSortKeyState(parsed.sortKey)
        if (parsed.sortOrder === 'asc' || parsed.sortOrder === 'desc') setSortOrderState(parsed.sortOrder)
      }
    } catch (_) {}
  }, [key])

  const setPageSize = useCallback((v) => {
    setPageSizeState(v)
    if (key) {
      try {
        const raw = localStorage.getItem(key)
        const parsed = raw ? JSON.parse(raw) : {}
        localStorage.setItem(key, JSON.stringify({ ...parsed, pageSize: v }))
      } catch (_) {}
    }
  }, [key])

  const setSort = useCallback((k, order) => {
    setSortKeyState(k)
    setSortOrderState(order || 'desc')
    if (key) {
      try {
        const raw = localStorage.getItem(key)
        const parsed = raw ? JSON.parse(raw) : {}
        localStorage.setItem(key, JSON.stringify({ ...parsed, sortKey: k, sortOrder: order || 'desc' }))
      } catch (_) {}
    }
  }, [key])

  return {
    pageSize,
    setPageSize,
    sortKey,
    sortOrder,
    setSort,
  }
}
