'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { secureFetch, createSafeError, isRecoverableError, type SecureFetchOptions, type SafeError } from '@/lib/security'

interface UseSecureFetchState<T> {
  data: T | null
  loading: boolean
  error: SafeError | null
}

interface UseSecureFetchReturn<T> extends UseSecureFetchState<T> {
  execute: (url: string, options?: SecureFetchOptions) => Promise<T | null>
  reset: () => void
  abort: () => void
  isRecoverable: boolean
}

/**
 * Custom hook for secure data fetching with automatic error handling
 *
 * Features:
 * - Automatic timeout and retry logic
 * - Abort controller management
 * - Safe error handling
 * - Loading state management
 * - Automatic cleanup on unmount
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data, loading, error, execute, isRecoverable } = useSecureFetch<MyData>()
 *
 *   useEffect(() => {
 *     execute('/api/data', { timeout: 10000 })
 *   }, [])
 *
 *   if (loading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} recoverable={isRecoverable} />
 *   if (data) return <DataDisplay data={data} />
 * }
 * ```
 */
export function useSecureFetch<T = any>(): UseSecureFetchReturn<T> {
  const [state, setState] = useState<UseSecureFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const lastErrorRef = useRef<unknown>(null)

  // Abort any pending requests on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const execute = useCallback(async (
    url: string,
    options: SecureFetchOptions = {}
  ): Promise<T | null> => {
    // Abort any pending request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await secureFetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json() as T

      setState({ data, loading: false, error: null })
      lastErrorRef.current = null
      return data
    } catch (error) {
      lastErrorRef.current = error

      // Don't update state if the request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        return null
      }

      const safeError = createSafeError(error, `useSecureFetch:${url}`)
      setState({ data: null, loading: false, error: safeError })
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
    lastErrorRef.current = null
  }, [])

  const abort = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  return {
    ...state,
    execute,
    reset,
    abort,
    isRecoverable: isRecoverableError(lastErrorRef.current),
  }
}

/**
 * Custom hook for secure mutations (POST, PUT, DELETE, etc.)
 * Similar to useSecureFetch but optimized for data mutations
 */
export function useSecureMutation<TData = any, TVariables = any>() {
  const [state, setState] = useState<UseSecureFetchState<TData>>({
    data: null,
    loading: false,
    error: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const lastErrorRef = useRef<unknown>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const mutate = useCallback(async (
    url: string,
    variables: TVariables,
    options: SecureFetchOptions = {}
  ): Promise<TData | null> => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await secureFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(variables),
        ...options,
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json() as TData

      setState({ data, loading: false, error: null })
      lastErrorRef.current = null
      return data
    } catch (error) {
      lastErrorRef.current = error

      if (error instanceof Error && error.name === 'AbortError') {
        return null
      }

      const safeError = createSafeError(error, `useSecureMutation:${url}`)
      setState({ data: null, loading: false, error: safeError })
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
    lastErrorRef.current = null
  }, [])

  const abort = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  return {
    ...state,
    mutate,
    reset,
    abort,
    isRecoverable: isRecoverableError(lastErrorRef.current),
  }
}
