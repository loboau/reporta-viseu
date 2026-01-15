'use client'

import { useEffect, useState } from 'react'
import { X, MapPin, Camera, FileText, Send, ChevronDown, ChevronUp } from 'lucide-react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

interface AccordionItemProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

function AccordionItem({ title, icon, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2 bg-gray-50 text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
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
        <div className="p-4 overflow-y-auto">
          <p className="text-sm text-gray-600 mb-4">
            Reportar um problema é simples e rápido. Siga estes 3 passos:
          </p>

          <div className="space-y-3">
            {/* Step 1 - Location */}
            <AccordionItem
              title="1. Marque a localização"
              icon={
                <div className="w-8 h-8 rounded-full bg-v2-blue/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-v2-blue" />
                </div>
              }
              defaultOpen={true}
            >
              <ul className="space-y-2 list-disc list-inside">
                <li>Toque no mapa para marcar o local do problema</li>
                <li>Use o botão GPS para usar a sua localização atual</li>
                <li>Pode pesquisar uma morada na barra de pesquisa</li>
                <li>O local deve estar dentro do Concelho de Viseu</li>
              </ul>
            </AccordionItem>

            {/* Step 2 - Problem */}
            <AccordionItem
              title="2. Descreva o problema"
              icon={
                <div className="w-8 h-8 rounded-full bg-v2-purple/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-v2-purple" />
                </div>
              }
            >
              <ul className="space-y-2 list-disc list-inside">
                <li>Selecione a categoria que melhor descreve o problema</li>
                <li>Escreva uma descrição detalhada do que observou</li>
                <li>Adicione fotos para ajudar a identificar o problema (opcional)</li>
                <li>Indique o nível de urgência</li>
              </ul>
            </AccordionItem>

            {/* Step 3 - Photos */}
            <AccordionItem
              title="Adicionar fotos"
              icon={
                <div className="w-8 h-8 rounded-full bg-v2-green/10 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-v2-green" />
                </div>
              }
            >
              <ul className="space-y-2 list-disc list-inside">
                <li>Pode adicionar até 5 fotografias</li>
                <li>Formatos aceites: JPG, PNG, WebP</li>
                <li>Tamanho máximo por foto: 5MB</li>
                <li>As fotos ajudam a resolver o problema mais rapidamente</li>
              </ul>
            </AccordionItem>

            {/* Step 4 - Submit */}
            <AccordionItem
              title="3. Envie a ocorrência"
              icon={
                <div className="w-8 h-8 rounded-full bg-v2-yellow/20 flex items-center justify-center">
                  <Send className="w-4 h-4 text-v2-yellow" />
                </div>
              }
            >
              <ul className="space-y-2 list-disc list-inside">
                <li>Reveja todos os dados antes de enviar</li>
                <li>Escolha se quer enviar de forma anónima ou identificada</li>
                <li>Se identificado, receberá atualizações por email</li>
                <li>Será gerada uma carta formal para a Câmara</li>
                <li>Receberá uma referência única para acompanhamento</li>
              </ul>
            </AccordionItem>
          </div>

          {/* FAQ Section */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Perguntas frequentes</h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-700">O que acontece depois de enviar?</p>
                <p className="text-gray-500 mt-1">
                  A sua ocorrência é encaminhada para o departamento responsável da Câmara Municipal.
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-700">Posso enviar de forma anónima?</p>
                <p className="text-gray-500 mt-1">
                  Sim, pode optar por não fornecer os seus dados. Neste caso, não receberá atualizações.
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-700">Que tipos de problemas posso reportar?</p>
                <p className="text-gray-500 mt-1">
                  Problemas de pavimento, iluminação, limpeza, jardins, saneamento, animais abandonados,
                  sinalização, estacionamento, edifícios degradados, acessibilidade e ruído.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
