'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { createSafeError, type SafeError } from '@/lib/security'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: SafeError, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  safeError: SafeError | null
}

/**
 * Secure Error Boundary Component
 *
 * Catches React errors and displays user-friendly messages
 * without exposing internal implementation details.
 *
 * Features:
 * - Sanitized error messages
 * - No stack traces exposed to users
 * - Optional custom fallback UI
 * - Automatic error reporting hook
 * - Reset functionality
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      safeError: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      safeError: createSafeError(error, 'ErrorBoundary'),
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] Caught error:', {
        error,
        componentStack: errorInfo.componentStack,
      })
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, you could send this to an error tracking service
    // Example: Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
      // trackError(error, errorInfo)
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      safeError: null,
    })
  }

  override render(): ReactNode {
    if (this.state.hasError && this.state.safeError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.safeError, this.resetError)
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
              Algo correu mal
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 text-center mb-6">
              {this.state.safeError.message}
            </p>

            {/* Error Code (for support) */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-xs text-gray-500 text-center">
                Código de erro: {this.state.safeError.code}
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                {new Date(this.state.safeError.timestamp).toLocaleString('pt-PT')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.resetError}
                className="w-full bg-v2-pink text-white font-semibold py-3 px-4 rounded-xl hover:bg-v2-pink/90 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Tentar Novamente
              </button>

              <button
                onClick={() => {
                  this.resetError()
                  window.location.href = '/'
                }}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Voltar ao Início
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Se o problema persistir, contacte o suporte técnico.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook-based Error Boundary wrapper for functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: SafeError, reset: () => void) => ReactNode
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
