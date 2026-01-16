'use client'

import { memo, useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { X, Info, PlusCircle, HelpCircle, Mail, ExternalLink } from 'lucide-react'
import { AboutModal } from './AboutModal'
import { HelpModal } from './HelpModal'

interface SidebarDrawerProps {
  isOpen: boolean
  onClose: () => void
  onNewReport?: () => void
}

export const SidebarDrawer = memo(function SidebarDrawer({ isOpen, onClose, onNewReport }: SidebarDrawerProps) {
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
    return undefined
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
      <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="sidebar-title">
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isClosing ? 'opacity-0' : 'animate-fade-in-overlay'
          }`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer - opens from right */}
        <aside
          className={`absolute right-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white shadow-xl transition-transform duration-300 ease-out ${
            isClosing ? 'translate-x-full' : 'animate-slide-in-right-drawer'
          }`}
          aria-label="Menu de navegação lateral"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 id="sidebar-title" className="sr-only">Menu de navegação</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-v2-yellow focus-visible:ring-offset-2"
              aria-label="Fechar menu de navegação"
            >
              <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
            </button>
            <Image
              src="/v2/icons/Icon_Logo_Viseu.png"
              alt="Camara Municipal de Viseu"
              width={80}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Navigation Items - simplified */}
          <nav className="p-3" aria-label="Menu principal">
            <ul className="space-y-1" role="menu">
              {/* New Report */}
              <li role="none">
                <button
                  role="menuitem"
                  onClick={() => {
                    onNewReport?.()
                    onClose()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-v2-yellow focus-visible:ring-offset-2"
                  aria-label="Criar nova ocorrência"
                >
                  <PlusCircle className="w-5 h-5 text-v2-green" aria-hidden="true" />
                  <span className="font-medium text-gray-900">Nova Ocorrência</span>
                </button>
              </li>

              {/* About */}
              <li role="none">
                <button
                  role="menuitem"
                  onClick={() => setShowAbout(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-v2-yellow focus-visible:ring-offset-2"
                  aria-label="Sobre a aplicação"
                >
                  <Info className="w-5 h-5 text-v2-blue" aria-hidden="true" />
                  <span className="font-medium text-gray-900">Sobre</span>
                </button>
              </li>

              {/* Help */}
              <li role="none">
                <button
                  role="menuitem"
                  onClick={() => setShowHelp(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-v2-yellow focus-visible:ring-offset-2"
                  aria-label="Ajuda e instruções de uso"
                >
                  <HelpCircle className="w-5 h-5 text-v2-purple" aria-hidden="true" />
                  <span className="font-medium text-gray-900">Ajuda</span>
                </button>
              </li>

              {/* Contact */}
              <li role="none">
                <a
                  role="menuitem"
                  href="mailto:geral@cm-viseu.pt"
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-v2-yellow focus-visible:ring-offset-2"
                  onClick={onClose}
                  aria-label="Enviar email para geral@cm-viseu.pt"
                >
                  <Mail className="w-5 h-5 text-v2-orange" aria-hidden="true" />
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
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <span>cm-viseu.pt</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-center text-xs text-gray-400 mt-2">
              Versao 2.0
            </p>
          </div>
        </aside>
      </div>

      {/* Modals */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  )
})
