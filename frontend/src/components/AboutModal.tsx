'use client'

import React from 'react'
import { X, Heart, Lightbulb, Users, ArrowRight } from 'lucide-react'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-viseu-gold to-amber-500 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Viseu Reporta
          </h2>
          <p className="text-white/90 text-sm">
            Uma ponte entre cidadãos e município
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Manifesto */}
          <div className="text-center">
            <p className="text-gray-700 leading-relaxed">
              <span className="font-semibold text-viseu-dark">O mundo precisa de soluções para problemas.</span>
              {' '}Esta app nasceu de uma ideia simples: dar voz aos cidadãos de Viseu
              e criar uma ligação mais rápida e eficaz com o município.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-2xl">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Inspiração</h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Inspirados por iniciativas semelhantes que transformam comunidades pelo mundo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Comunidade</h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Cada problema reportado é um passo para uma cidade melhor para todos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Ação</h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Transformamos a tua voz numa carta formal - tu falas, nós formalizamos
                </p>
              </div>
            </div>
          </div>

          {/* Say What Credit */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">
              Um projeto de
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-700 rounded-full">
              <span className="text-white font-bold text-sm tracking-wide">SAY WHAT</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Artistas a criar soluções para a comunidade
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-viseu-dark text-white font-semibold rounded-2xl hover:bg-gray-800 transition-colors"
          >
            Vamos começar!
          </button>
        </div>
      </div>
    </div>
  )
}
