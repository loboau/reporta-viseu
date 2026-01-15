'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, Info, PlusCircle, HelpCircle, Mail, ExternalLink } from 'lucide-react'

interface SidebarDrawerProps {
  isOpen: boolean
  onClose: () => void
  onNewReport?: () => void
}

export function SidebarDrawer({ isOpen, onClose, onNewReport }: SidebarDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white shadow-xl animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* VR Logo */}
            <Image
              src="/v2/logos/Viseu_Reporta_Logo_Positivo.png"
              alt="Viseu Reporta"
              width={120}
              height={36}
              className="h-8 w-auto"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2">
          <ul className="space-y-1">
            {/* New Report */}
            <li>
              <button
                onClick={() => {
                  onNewReport?.()
                  onClose()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-v2-green/10 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5 text-v2-green" />
                </div>
                <div>
                  <span className="font-medium text-gray-900 block">Nova Ocorrência</span>
                  <span className="text-xs text-gray-500">Reportar um problema</span>
                </div>
              </button>
            </li>

            {/* About */}
            <li>
              <button
                onClick={() => {
                  // Could open About modal
                  onClose()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-v2-blue/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-v2-blue" />
                </div>
                <div>
                  <span className="font-medium text-gray-900 block">Sobre</span>
                  <span className="text-xs text-gray-500">Informações da aplicação</span>
                </div>
              </button>
            </li>

            {/* Help */}
            <li>
              <button
                onClick={() => {
                  onClose()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-v2-purple/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-v2-purple" />
                </div>
                <div>
                  <span className="font-medium text-gray-900 block">Ajuda</span>
                  <span className="text-xs text-gray-500">Como usar a aplicação</span>
                </div>
              </button>
            </li>

            {/* Contact */}
            <li>
              <a
                href="mailto:geral@cm-viseu.pt"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={onClose}
              >
                <div className="w-10 h-10 rounded-full bg-v2-orange/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-v2-orange" />
                </div>
                <div>
                  <span className="font-medium text-gray-900 block">Contacto</span>
                  <span className="text-xs text-gray-500">geral@cm-viseu.pt</span>
                </div>
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
            <span>Câmara Municipal de Viseu</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-center text-xs text-gray-400 mt-2">
            Versão 2.0
          </p>
        </div>
      </div>
    </div>
  )
}
