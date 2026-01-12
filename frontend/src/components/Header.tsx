'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Info } from 'lucide-react'
import AboutModal from './AboutModal'

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  // Ensure client-side rendering for time
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 19) return 'Boa tarde'
    return 'Boa noite'
  }

  // Format time as HH:MM
  const formatTime = () => {
    return currentTime.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Format date
  const formatDate = () => {
    return currentTime.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  return (
    <>
      <header className="sticky top-0 z-50 safe-area-top bg-white/95 backdrop-blur-xl border-b border-gray-100/50 shadow-soft">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo + Brand */}
            <div className="flex items-center gap-3">
              {/* Official Viseu Logo */}
              <Image
                src="/logo-official.png"
                alt="Município de Viseu"
                width={140}
                height={45}
                className="h-10 sm:h-11 w-auto object-contain"
                priority
              />
            </div>

            {/* Right Side - Time and Status */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Time Display - Desktop */}
              {mounted && (
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-lg font-bold text-viseu-dark tabular-nums leading-tight">
                    {formatTime()}
                  </span>
                  <span className="text-xs text-gray-400 capitalize leading-tight">
                    {formatDate()}
                  </span>
                </div>
              )}

              {/* Greeting Badge - Mobile */}
              {mounted && (
                <div className="sm:hidden flex items-center gap-2 bg-viseu-gold/10 px-3 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 bg-category-green rounded-full animate-pulse" />
                  <span className="text-xs text-viseu-dark font-medium">
                    {getGreeting()}
                  </span>
                </div>
              )}

              {/* Status Badge - Desktop */}
              <div className="hidden sm:flex items-center gap-2 bg-category-green/10 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-category-green rounded-full animate-pulse" />
                <span className="text-xs text-category-green-dark font-medium">Online</span>
              </div>

              {/* Info Button */}
              <button
                onClick={() => setShowAbout(true)}
                className="w-10 h-10 bg-gray-100 hover:bg-viseu-gold/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Sobre a app"
              >
                <Info className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* About Modal */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  )
}
