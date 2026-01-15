'use client'

import { useEffect } from 'react'
import { X, Heart, Shield, MapPin, Users } from 'lucide-react'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
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
          <h2 className="text-lg font-bold text-gray-900">Sobre</h2>
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
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/v2/logos/Viseu_Reporta_Logo_Positivo.png"
              alt="Viseu Reporta"
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Description */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              O <strong>Viseu Reporta</strong> é uma aplicação que permite aos cidadãos
              reportar problemas urbanos diretamente à Câmara Municipal de Viseu,
              contribuindo para uma cidade mais limpa, segura e funcional.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-v2-blue/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-v2-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Localização Precisa</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Marque o local exato do problema no mapa
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-v2-green/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-v2-green" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Privacidade Garantida</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pode reportar de forma anónima se preferir
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-v2-purple/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-v2-purple" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Cidadania Ativa</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Contribua para melhorar a sua cidade
                </p>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">
              Uma iniciativa da
            </p>
            <p className="font-semibold text-gray-700 text-sm">
              Câmara Municipal de Viseu
            </p>
            <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-400">
              <span>Feito com</span>
              <Heart className="w-3 h-3 text-v2-pink fill-v2-pink" />
              <span>para Viseu</span>
            </div>
            <p className="text-[10px] text-gray-300 mt-2">
              Versão 2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
