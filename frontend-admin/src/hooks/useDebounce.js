import React, { useState, useEffect, useCallback } from 'react'

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return debouncedValue
}

export function useDebouncedCallback(callback, delay) {
  const [pending, setPending] = useState(null)
  const timeoutRef = React.useRef(null)

  useEffect(() => {
    if (pending == null) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      callback(pending)
      setPending(null)
    }, delay)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [pending, delay, callback])

  return useCallback((value) => setPending(value), [])
}
