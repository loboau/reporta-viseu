'use client'

import React, { useState } from 'react'
import { CheckCircle, Copy, Mail, FileText, RotateCcw, Check, RefreshCw } from 'lucide-react'
import type { ReportDataV2 } from '@/types'
import Button from '@/components/ui/Button'
import Image from 'next/image'

interface StepSuccessV2Props {
  data: ReportDataV2
  onNewReport: () => void
  onRegenerateLetter: () => void
  isRegenerating: boolean
}

function buildFormalLetter(data: ReportDataV2): string {
  if (data.letter) {
    return data.letter
  }

  const currentDate = new Date().toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const senderName = data.isAnonymous ? 'Cidadão Anónimo' : data.name
  const category = data.category?.label || 'problema'
  const address = data.location?.address || 'localização indicada'
  const freguesia = data.location?.freguesia || ''
  const description = data.description || 'Situação que necessita de atenção.'

  return `Viseu, ${currentDate}

Exmo. Sr. Presidente da Câmara Municipal de Viseu

Assunto: ${category} - ${address}

Venho por este meio comunicar a seguinte situação:

${description}

Local: ${address}
${freguesia ? `Freguesia: ${freguesia}` : ''}
Coordenadas: ${data.location?.lat?.toFixed(6) || 'N/A'}, ${data.location?.lng?.toFixed(6) || 'N/A'}

Solicito intervenção com brevidade.

Com os melhores cumprimentos,
${senderName}`
}

export default function StepSuccessV2({ data, onNewReport, onRegenerateLetter, isRegenerating }: StepSuccessV2Props) {
  const [copiedLetter, setCopiedLetter] = useState(false)

  const handleCopyLetter = async (): Promise<void> => {
    const letter = buildFormalLetter(data)
    try {
      await navigator.clipboard.writeText(letter)
      setCopiedLetter(true)
      setTimeout(() => setCopiedLetter(false), 2000)
    } catch {
      // Fallback for browsers that don't support clipboard API
      console.warn('Clipboard API not available')
    }
  }

  const formalLetter = buildFormalLetter(data)
  const testEmail = 'teste@reportaviseu.pt'

  const emailLink = `mailto:${testEmail}?subject=${encodeURIComponent(`[${data.reference}] ${data.category?.label || 'Reporte'} - Viseu Reporta`)}&body=${encodeURIComponent(formalLetter)}`

  return (
    <div className="space-y-5 animate-fade-in pb-32">
      {/* Success Header */}
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-v2-green rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Carta Gerada!
        </h2>
        <p className="text-gray-500 text-sm">
          A sua carta está pronta para enviar à Câmara
        </p>
      </div>

      {/* Letter Preview Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-v2-yellow/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-v2-yellow rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                A Sua Carta Formal
              </h3>
              <p className="text-xs text-gray-500">
                Pronta para enviar
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRegenerateLetter}
              disabled={isRegenerating}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRegenerating ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCopyLetter}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              {copiedLetter ? (
                <Check className="w-5 h-5 text-v2-green" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className={`bg-gray-50 rounded-xl p-4 transition-opacity ${isRegenerating ? 'opacity-50' : ''}`}>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
            {formalLetter}
          </pre>
        </div>

        <p className="text-[10px] text-gray-400 mt-3 text-center">
          Carta gerada com IA - clique em regenerar para nova versão
        </p>
      </div>

      {/* Test Mode Notice */}
      <div className="bg-v2-orange/10 rounded-2xl p-4 border border-v2-orange/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-v2-orange rounded-xl flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-0.5">
              Modo de Demonstração
            </h4>
            <p className="text-xs text-gray-600">
              Email de teste: <strong>{testEmail}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => window.location.href = emailLink}
          className="bg-v2-yellow hover:bg-yellow-400 text-gray-900"
        >
          <Mail className="w-5 h-5" />
          Enviar Carta por Email
        </Button>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={onNewReport}
        >
          <RotateCcw className="w-5 h-5" />
          Criar Novo Reporte
        </Button>
      </div>

      {/* Photos Reminder */}
      {data.photos.length > 0 && (
        <div className="bg-v2-yellow/10 rounded-2xl p-4 border border-v2-yellow/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-v2-yellow rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                Não esqueça as fotografias!
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                Tem {data.photos.length} fotografia{data.photos.length > 1 ? 's' : ''} para anexar.
              </p>
              <div className="flex gap-2">
                {data.photos.slice(0, 4).map((photo) => (
                  <div
                    key={photo.id}
                    className="w-10 h-10 rounded-lg overflow-hidden relative"
                  >
                    <Image
                      src={photo.preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {data.photos.length > 4 && (
                  <div className="w-10 h-10 rounded-lg bg-v2-yellow/30 flex items-center justify-center text-xs font-bold text-gray-700">
                    +{data.photos.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thank You */}
      <div className="text-center py-4">
        <p className="text-gray-900 font-semibold mb-1">
          Obrigado por ajudar a melhorar Viseu!
        </p>
        <p className="text-sm text-gray-500">
          O seu contributo é essencial.
        </p>
      </div>
    </div>
  )
}
