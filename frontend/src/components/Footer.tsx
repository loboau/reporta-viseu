import React from 'react'

export default function Footer() {
  return (
    <footer className="py-8 px-4 mt-auto">
      <div className="max-w-xl mx-auto">
        {/* Separator Line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />

        {/* Credits */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500">
            <span>Feito com</span>
            <span className="text-category-red animate-pulse">&#9829;</span>
            <span>por</span>
            <a
              href="https://saywhat.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-viseu-gold hover:text-viseu-gold-dark font-semibold transition-colors"
            >
              Say What?
            </a>
          </div>

          <p className="text-xs text-gray-400">
            {new Date().getFullYear()} Município de Viseu
          </p>
        </div>
      </div>
    </footer>
  )
}
