'use client'

import { useEffect, useState } from 'react'
import { X, Info, PlusCircle, HelpCircle, Mail, ExternalLink } from 'lucide-react'
import { AboutModal } from './AboutModal'
import { HelpModal } from './HelpModal'

interface SidebarDrawerProps {
  isOpen: boolean
  onClose: () => void
  onNewReport?: () => void
}

export function SidebarDrawer({ isOpen, onClose, onNewReport }: SidebarDrawerProps) {
  const [showAbout, setShowAbout] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Handle open/close with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
    } else if (isVisible) {
      // Start closing animation
      setIsClosing(true)
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsClosing(false)
      }, 300) // Match animation duration
      return () => clearTimeout(timer)
    }
  }, [isOpen, isVisible])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isVisible])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showAbout && !showHelp) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, showAbout, showHelp])

  if (!isVisible) return null

  return (
    <>
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isClosing ? 'opacity-0' : 'animate-fade-in-overlay'
          }`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer - opens from right */}
        <div className={`absolute right-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white shadow-xl transition-transform duration-300 ease-out ${
          isClosing ? 'translate-x-full' : 'animate-slide-in-right-drawer'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <img
              src="/v2/logos/Viseu_Reporta_Logo_Positivo.png"
              alt="Viseu Reporta"
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Navigation Items - simplified */}
          <nav className="p-3">
            <ul className="space-y-1">
              {/* New Report */}
              <li>
                <button
                  onClick={() => {
                    onNewReport?.()
                    onClose()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <PlusCircle className="w-5 h-5 text-v2-green" />
                  <span className="font-medium text-gray-900">Nova Ocorrência</span>
                </button>
              </li>

              {/* About */}
              <li>
                <button
                  onClick={() => setShowAbout(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <Info className="w-5 h-5 text-v2-blue" />
                  <span className="font-medium text-gray-900">Sobre</span>
                </button>
              </li>

              {/* Help */}
              <li>
                <button
                  onClick={() => setShowHelp(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <HelpCircle className="w-5 h-5 text-v2-purple" />
                  <span className="font-medium text-gray-900">Ajuda</span>
                </button>
              </li>

              {/* Contact */}
              <li>
                <a
                  href="mailto:geral@cm-viseu.pt"
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <Mail className="w-5 h-5 text-v2-orange" />
                  <span className="font-medium text-gray-900">Contacto</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
            <a
              href="https://cm-viseu.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span>cm-viseu.pt</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-center text-xs text-gray-400 mt-2">
              Versão 2.0
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  )
}
