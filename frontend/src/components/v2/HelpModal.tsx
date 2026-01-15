'use client'

import { useEffect } from 'react'
import { X, MapPin, MessageSquare, Send } from 'lucide-react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  // Prevent body scroll when modal is open
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Como usar</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <p className="text-sm text-gray-600 mb-5">
            Reportar um problema é simples. Basta seguir 3 passos:
          </p>

          {/* Steps */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-v2-blue/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-v2-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">1. Marque no mapa</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Toque no mapa ou use o GPS para indicar onde está o problema.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-v2-purple/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-v2-purple" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">2. Descreva brevemente</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Escolha a categoria e escreva uma breve descrição. A app gera a carta formal automaticamente.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-v2-green/10 flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-v2-green" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">3. Envie por email</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Reveja a carta gerada e envie diretamente para a Câmara Municipal.
                </p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              Pode adicionar fotos e enviar de forma anónima se preferir.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
