'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Menu } from 'lucide-react'

interface HeaderV2Props {
  onMenuClick: () => void
}

// Portuguese day names in uppercase
const DAYS_PT = [
  'DOMINGO',
  'SEGUNDA-FEIRA',
  'TERÇA-FEIRA',
  'QUARTA-FEIRA',
  'QUINTA-FEIRA',
  'SEXTA-FEIRA',
  'SÁBADO'
]

const MONTHS_PT = [
  'JANEIRO',
  'FEVEREIRO',
  'MARÇO',
  'ABRIL',
  'MAIO',
  'JUNHO',
  'JULHO',
  'AGOSTO',
  'SETEMBRO',
  'OUTUBRO',
  'NOVEMBRO',
  'DEZEMBRO'
]

function formatDateTime(date: Date): { dateStr: string; timeStr: string } {
  const dayName = DAYS_PT[date.getDay()]
  const day = date.getDate()
  const month = MONTHS_PT[date.getMonth()]
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return {
    dateStr: `${dayName}, ${day} DE ${month}`,
    timeStr: `${hours}:${minutes}`
  }
}

export function HeaderV2({ onMenuClick }: HeaderV2Props) {
  const [dateTime, setDateTime] = useState<{ dateStr: string; timeStr: string }>(() =>
    formatDateTime(new Date())
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(formatDateTime(new Date()))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Logo Section - Using PNG logo, clickable to reset */}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center"
          aria-label="Voltar ao início"
        >
          <Image
            src="/v2/logos/Viseu_Reporta_Logo_Positivo.png"
            alt="Viseu Reporta"
            width={180}
            height={54}
            className="h-10 sm:h-12 w-auto"
            priority
          />
        </button>

        {/* Right Section - Date/Time & Menu */}
        <div className="flex items-center gap-3">
          {/* Date/Time */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-gray-500 tracking-wide">
              {dateTime.dateStr}
            </span>
            <span className="text-sm font-semibold text-gray-700">
              {dateTime.timeStr}
            </span>
          </div>
          {/* Mobile: Just time */}
          <div className="sm:hidden">
            <span className="text-sm font-semibold text-gray-700">
              {dateTime.timeStr}
            </span>
          </div>
          {/* Hamburger Menu */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  )
}
