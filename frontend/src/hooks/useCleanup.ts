'use client'

import { useEffect, useRef, useCallback } from 'react'
import { CleanupManager, revokeObjectURLs } from '@/lib/security'

/**
 * Custom hook for managing cleanup operations and preventing memory leaks
 *
 * Features:
 * - Automatic cleanup on component unmount
 * - Object URL tracking and revocation
 * - AbortController management
 * - Custom cleanup function registration
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const cleanup = useCleanup()
 *
 *   // Track object URLs
 *   const imageUrl = URL.createObjectURL(file)
 *   cleanup.trackObjectURL(imageUrl)
 *
 *   // Register custom cleanup
 *   cleanup.register(() => {
 *     // Custom cleanup logic
 *   })
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function useCleanup() {
  const managerRef = useRef<CleanupManager | null>(null)

  // Initialize cleanup manager
  if (!managerRef.current) {
    managerRef.current = new CleanupManager()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      managerRef.current?.cleanup()
    }
  }, [])

  return managerRef.current
}

/**
 * Custom hook for managing AbortController instances
 * Automatically aborts on unmount or when dependencies change
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const abort = useAbortController()
 *
 *   const fetchData = async () => {
 *     try {
 *       const response = await fetch(url, { signal: abort.signal })
 *       // ...
 *     } catch (error) {
 *       if (abort.isAborted()) {
 *         // Request was aborted
 *       }
 *     }
 *   }
 *
 *   return <button onClick={fetchData}>Fetch</button>
 * }
 * ```
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null)

  // Create new controller if needed
  if (!controllerRef.current) {
    controllerRef.current = new AbortController()
  }

  // Abort on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
    }
  }, [])

  return {
    signal: controllerRef.current.signal,
    abort: () => controllerRef.current?.abort(),
    isAborted: () => controllerRef.current?.signal.aborted || false,
    reset: () => {
      controllerRef.current?.abort()
      controllerRef.current = new AbortController()
    },
  }
}

/**
 * Custom hook for managing photo object URLs with automatic cleanup
 *
 * @example
 * ```tsx
 * function PhotoUpload() {
 *   const { trackPhoto, removePhoto, cleanup } = usePhotoCleanup()
 *
 *   const handleFileSelect = (file: File) => {
 *     const photo = {
 *       id: generateId(),
 *       file,
 *       preview: URL.createObjectURL(file)
 *     }
 *     trackPhoto(photo)
 *   }
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function usePhotoCleanup() {
  const photosRef = useRef<Map<string, string>>(new Map())

  /**
   * Tracks a photo's object URL for cleanup
   */
  const trackPhoto = useCallback((id: string, url: string) => {
    if (url && url.startsWith('blob:')) {
      photosRef.current.set(id, url)
    }
  }, [])

  /**
   * Removes and revokes a specific photo
   */
  const removePhoto = useCallback((id: string) => {
    const url = photosRef.current.get(id)
    if (url) {
      try {
        URL.revokeObjectURL(url)
      } catch {
        // Ignore errors
      }
      photosRef.current.delete(id)
    }
  }, [])

  /**
   * Manually cleanup all tracked photos
   */
  const cleanup = useCallback(() => {
    const urls = Array.from(photosRef.current.values())
    revokeObjectURLs(urls)
    photosRef.current.clear()
  }, [])

  /**
   * Get current tracked photo count
   */
  const getCount = useCallback(() => {
    return photosRef.current.size
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    trackPhoto,
    removePhoto,
    cleanup,
    getCount,
  }
}

/**
 * Custom hook for debounced cleanup
 * Delays cleanup execution to prevent excessive operations
 *
 * @param callback - Cleanup function to execute
 * @param delay - Delay in milliseconds (default: 1000ms)
 *
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const debouncedCleanup = useDebouncedCleanup(() => {
 *     // Cleanup search results, abort pending requests, etc.
 *   }, 500)
 *
 *   useEffect(() => {
 *     debouncedCleanup()
 *   }, [searchQuery])
 * }
 * ```
 */
export function useDebouncedCleanup(callback: () => void, delay = 1000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedCleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callback()
      timeoutRef.current = null
    }, delay)
  }, [callback, delay])

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCleanup
}

/**
 * Custom hook for managing interval-based cleanup
 * Executes cleanup at regular intervals
 *
 * @param callback - Cleanup function to execute
 * @param intervalMs - Interval in milliseconds
 * @param immediate - Execute immediately on mount (default: false)
 *
 * @example
 * ```tsx
 * function CacheManager() {
 *   // Clear expired cache entries every 5 minutes
 *   useIntervalCleanup(() => {
 *     clearExpiredCache()
 *   }, 5 * 60 * 1000)
 * }
 * ```
 */
export function useIntervalCleanup(
  callback: () => void,
  intervalMs: number,
  immediate = false
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    // Execute immediately if requested
    if (immediate) {
      callbackRef.current()
    }

    // Set up interval
    intervalRef.current = setInterval(() => {
      callbackRef.current()
    }, intervalMs)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [intervalMs, immediate])
}

/**
 * Custom hook for managing event listener cleanup
 *
 * @example
 * ```tsx
 * function ScrollTracker() {
 *   useEventListener('scroll', handleScroll, window)
 *   useEventListener('resize', handleResize, window)
 * }
 * ```
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | null = typeof window !== 'undefined' ? window : null,
  options?: AddEventListenerOptions
) {
  const savedHandler = useRef<(event: WindowEventMap[K]) => void>()

  // Update saved handler
  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    if (!element?.addEventListener) return

    const eventListener = (event: Event) => {
      savedHandler.current?.(event as WindowEventMap[K])
    }

    element.addEventListener(eventName, eventListener, options)

    return () => {
      element.removeEventListener(eventName, eventListener, options)
    }
  }, [eventName, element, options])
}
