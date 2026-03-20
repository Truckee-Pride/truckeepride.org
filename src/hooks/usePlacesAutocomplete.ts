import { useState, useEffect, useRef } from 'react'

export type PlacePrediction = {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

export function usePlacesAutocomplete() {
  const [input, setInput] = useState('')
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()

    if (!input || input.trim().length < 2) {
      setPredictions([])
      setError(null)
      return
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current = new AbortController()
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(input.trim())}`,
          { signal: abortRef.current.signal },
        )

        if (res.status === 429) {
          setError('Too many searches — please slow down.')
          setPredictions([])
          return
        }

        if (!res.ok) {
          setError('Address lookup failed.')
          setPredictions([])
          return
        }

        const data = await res.json()
        setPredictions(data.predictions ?? [])
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Address lookup failed.')
        }
      } finally {
        setIsLoading(false)
      }
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [input])

  function clear() {
    setPredictions([])
    setError(null)
    setInput('')
  }

  return { input, setInput, predictions, isLoading, error, clear }
}
