'use client'

import React, { useState } from 'react'
import { CheckCircle, Copy, Mail, FileText, RotateCcw, Check, Sparkles, RefreshCw } from 'lucide-react'
import { ReportData } from '@/types'
import Button from '@/components/ui/Button'
import Image from 'next/image'

interface StepSuccessProps {
  data: ReportData
  onNewReport: () => void
  onRegenerateLetter: () => void
  isRegenerating: boolean
}

// Função para gerar a carta formal (fallback quando não há carta gerada por IA)
function buildFormalLetter(data: ReportData): string {
  // Se já temos uma carta gerada pela IA, usar essa
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

export default function StepSuccess({ data, onNewReport, onRegenerateLetter, isRegenerating }: StepSuccessProps) {
  const [copiedLetter, setCopiedLetter] = useState(false)

  const handleCopyLetter = () => {
    const letter = buildFormalLetter(data)
    navigator.clipboard.writeText(letter)
    setCopiedLetter(true)
    setTimeout(() => setCopiedLetter(false), 2000)
  }

  const formalLetter = buildFormalLetter(data)
  const testEmail = 'teste@reportaviseu.pt'

  // Email link com a carta formal
  const emailLink = `mailto:${testEmail}?subject=${encodeURIComponent(`[${data.reference}] ${data.category?.label || 'Reporte'} - Reporta Viseu`)}&body=${encodeURIComponent(formalLetter)}`

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-green rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce-in shadow-green">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-viseu-gold rounded-full flex items-center justify-center shadow-gold animate-bounce-in animation-delay-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-viseu-dark mb-2">
          Carta Gerada!
        </h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          A sua carta está pronta para enviar à Câmara Municipal de Viseu
        </p>
      </div>

      {/* Formal Letter Preview Card */}
      <div className="card-float border-2 border-viseu-gold/30">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-viseu rounded-2xl flex items-center justify-center shadow-gold">
              <FileText className="w-6 h-6 text-viseu-dark" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-viseu-dark">
                A Sua Carta Formal
              </h3>
              <p className="text-sm text-gray-500">
                Pronta para enviar
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerateLetter}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  A gerar...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLetter}
            >
              {copiedLetter ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiada!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Letter Preview */}
        <div className={`bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-soft transition-opacity ${isRegenerating ? 'opacity-50' : ''}`}>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
            {formalLetter}
          </pre>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Carta gerada com inteligência artificial - clique em &quot;Regenerar&quot; para uma nova versão
        </p>
      </div>

      {/* Test Mode Notice */}
      <div className="card-glass-solid bg-category-orange/5 border-2 border-category-orange/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-orange rounded-2xl flex items-center justify-center flex-shrink-0 shadow-orange">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-category-orange-dark mb-1">
              Modo de Demonstração
            </h4>
            <p className="text-sm text-category-orange-dark mb-1">
              Email de teste: <strong>{testEmail}</strong>
            </p>
            <p className="text-xs text-category-orange-dark/80">
              Na versão final, será enviado para a Câmara.
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
        >
          <Mail className="w-6 h-6" />
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
        <div className="card-glass-solid bg-category-yellow/5 border-2 border-category-yellow/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-yellow rounded-2xl flex items-center justify-center flex-shrink-0 shadow-yellow-glow">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-category-yellow-dark mb-1">
                Não esqueça as fotografias!
              </h4>
              <p className="text-sm text-category-yellow-dark">
                Tem {data.photos.length} fotografia{data.photos.length > 1 ? 's' : ''} para anexar ao email.
              </p>
              <div className="flex gap-2 mt-3">
                {data.photos.slice(0, 4).map((photo) => (
                  <div
                    key={photo.id}
                    className="w-12 h-12 rounded-xl overflow-hidden shadow-soft relative"
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
                  <div className="w-12 h-12 rounded-xl bg-category-yellow/20 flex items-center justify-center text-sm font-bold text-category-yellow-dark">
                    +{data.photos.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Message */}
      <div className="text-center pt-4 pb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-viseu-gold/20 flex items-center justify-center">
          <span className="text-3xl">&#128591;</span>
        </div>
        <p className="text-xl text-viseu-dark font-bold mb-2">
          Obrigado por ajudar a melhorar Viseu!
        </p>
        <p className="text-gray-500">
          O seu contributo é essencial para a nossa cidade.
        </p>
      </div>
    </div>
  )
}
