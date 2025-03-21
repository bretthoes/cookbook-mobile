import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)

    return () => clearTimeout(handler) // Cleanup function
  }, [value, delay])

  return debouncedValue
}
