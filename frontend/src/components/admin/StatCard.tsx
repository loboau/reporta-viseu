import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconBgColor?: string
  iconColor?: string
  trend?: {
    value: string
    isPositive: boolean
  }
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor = 'bg-viseu-gold/10',
  iconColor = 'text-viseu-gold',
  trend,
}: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-viseu-dark">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className={`${iconBgColor} ${iconColor} p-4 rounded-2xl`}>
          <Icon size={28} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}
