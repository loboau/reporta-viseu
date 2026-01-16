/**
 * Security Monitoring Dashboard (Admin Component)
 *
 * Displays real-time security metrics and events
 * For use in admin panel or monitoring interface
 */

'use client'

import { useState, useEffect } from 'react'

interface SecurityStats {
  status: string
  security: {
    rateLimitEnabled: boolean
    abuseDetectionEnabled: boolean
  }
  usage: {
    requests: number
    tokens: number
    cost: number
    resetIn: number
  } | null
  systemMetrics: {
    abuse: {
      totalRequests: number
      uniqueRequests: number
      duplicateRequests: number
      suspiciousPatterns: number
      blockedRequests: number
      averageRequestInterval: number
    }
    security: {
      totalEvents: number
      eventsByType: Record<string, number>
      eventsBySeverity: Record<string, number>
    }
  }
}

export default function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/generate-letter', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch security stats')
      }

      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const getStatusColor = (status: string) => {
    return status === 'operational' ? 'text-green-600' : 'text-red-600'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            AI Security Dashboard
          </h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                stats.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <span className={`font-semibold ${getStatusColor(stats.status)}`}>
              {stats.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Rate Limiting:</span>
            <span
              className={`font-semibold ${
                stats.security.rateLimitEnabled
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {stats.security.rateLimitEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Abuse Detection:</span>
            <span
              className={`font-semibold ${
                stats.security.abuseDetectionEnabled
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {stats.security.abuseDetectionEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      {stats.usage && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Your Usage
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Requests</div>
              <div className="text-2xl font-bold text-gray-800">
                {stats.usage.requests}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Tokens Used</div>
              <div className="text-2xl font-bold text-gray-800">
                {stats.usage.tokens.toLocaleString()}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Cost</div>
              <div className="text-2xl font-bold text-gray-800">
                ${stats.usage.cost.toFixed(4)}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Reset In</div>
              <div className="text-2xl font-bold text-gray-800">
                {Math.ceil(stats.usage.resetIn / 60000)}m
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Abuse Metrics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Abuse Detection
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Requests</span>
              <span className="font-semibold">
                {stats.systemMetrics.abuse.totalRequests}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Unique Requests</span>
              <span className="font-semibold">
                {stats.systemMetrics.abuse.uniqueRequests}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Duplicates</span>
              <span className="font-semibold text-yellow-600">
                {stats.systemMetrics.abuse.duplicateRequests}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Blocked</span>
              <span className="font-semibold text-red-600">
                {stats.systemMetrics.abuse.blockedRequests}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Interval</span>
              <span className="font-semibold">
                {Math.round(
                  stats.systemMetrics.abuse.averageRequestInterval
                )}
                ms
              </span>
            </div>
          </div>
        </div>

        {/* Security Events */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Security Events
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Events</span>
              <span className="font-semibold">
                {stats.systemMetrics.security.totalEvents}
              </span>
            </div>

            {/* Events by Severity */}
            <div className="pt-3 border-t">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                By Severity
              </div>
              {Object.entries(stats.systemMetrics.security.eventsBySeverity)
                .sort(([a], [b]) => {
                  const order = ['critical', 'high', 'medium', 'low']
                  return order.indexOf(a) - order.indexOf(b)
                })
                .map(([severity, count]) => (
                  <div
                    key={severity}
                    className="flex justify-between items-center py-1"
                  >
                    <span
                      className={`text-xs px-2 py-1 rounded border ${getSeverityColor(
                        severity
                      )}`}
                    >
                      {severity}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
            </div>

            {/* Top Event Types */}
            {Object.keys(stats.systemMetrics.security.eventsByType).length >
              0 && (
              <div className="pt-3 border-t">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  Top Events
                </div>
                {Object.entries(stats.systemMetrics.security.eventsByType)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([type, count]) => (
                    <div
                      key={type}
                      className="flex justify-between items-center py-1 text-sm"
                    >
                      <span className="text-gray-600 truncate">{type}</span>
                      <span className="font-semibold ml-2">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Refresh Info */}
      <div className="text-center text-sm text-gray-500">
        Auto-refreshes every 30 seconds
      </div>
    </div>
  )
}
