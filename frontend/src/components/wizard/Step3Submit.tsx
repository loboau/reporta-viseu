'use client'

import React from 'react'
import {
  MapPin,
  FileText,
  Camera,
  AlertTriangle,
  User,
  Shield,
  CheckCircle2,
} from 'lucide-react'
import { ReportData } from '@/types'
import { URGENCY_LABELS } from '@/lib/constants'
import Input from '@/components/ui/Input'
import Image from 'next/image'

interface Step3SubmitProps {
  data: ReportData
  onAnonymousChange: (isAnonymous: boolean) => void
  onNameChange: (name: string) => void
  onEmailChange: (email: string) => void
  onPhoneChange: (phone: string) => void
}

export default function Step3Submit({
  data,
  onAnonymousChange,
  onNameChange,
  onEmailChange,
  onPhoneChange,
}: Step3SubmitProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-viseu-dark mb-2">
          Reveja e confirme
        </h2>
        <p className="text-gray-500">
          Verifique os dados antes de gerar a carta
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Location */}
        {data.location && (
          <div className="card-glass-solid" style={{ borderLeft: '4px solid #3B82F6' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-blue rounded-2xl flex items-center justify-center flex-shrink-0 shadow-blue">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-viseu-dark mb-1">
                  Localização
                </h3>
                {data.location.address && (
                  <p className="text-sm text-gray-600 truncate">
                    {data.location.address}
                  </p>
                )}
                {data.location.freguesia && (
                  <p className="text-sm text-gray-500">
                    {data.location.freguesia}
                  </p>
                )}
              </div>
              <div className="badge badge-success flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>
          </div>
        )}

        {/* Category */}
        {data.category && (
          <div
            className="card-glass-solid"
            style={{ borderLeft: `4px solid ${data.category.color}` }}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 ${data.category.colorClass} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft-md`}
              >
                <span className="text-xl">{data.category.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-viseu-dark mb-1">
                  {data.category.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {data.category.departamento}
                </p>
              </div>
              <div className="badge badge-success flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {data.description && (
          <div className="card-glass-solid" style={{ borderLeft: '4px solid #8B5CF6' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-purple rounded-2xl flex items-center justify-center flex-shrink-0 shadow-purple">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-viseu-dark mb-2">
                  Descrição
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-3">
                  {data.description}
                </p>
              </div>
              <div className="badge badge-success flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>
          </div>
        )}

        {/* Photos */}
        {data.photos.length > 0 && (
          <div className="card-glass-solid" style={{ borderLeft: '4px solid #22C55E' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-green rounded-2xl flex items-center justify-center flex-shrink-0 shadow-green">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-viseu-dark mb-3">
                  {data.photos.length} fotografia{data.photos.length > 1 ? 's' : ''}
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {data.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-soft relative"
                    >
                      <Image
                        src={photo.preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="badge badge-success flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>
          </div>
        )}

        {/* Urgency */}
        <div
          className="card-glass-solid"
          style={{
            borderLeft: `4px solid ${data.urgency === 'alta'
                ? '#EF4444'
                : data.urgency === 'media'
                  ? '#FBBF24'
                  : '#22C55E'
              }`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft-md ${data.urgency === 'alta'
                  ? 'bg-gradient-red'
                  : data.urgency === 'media'
                    ? 'bg-gradient-yellow'
                    : 'bg-gradient-green'
                }`}
            >
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-viseu-dark mb-1">Urgência</h3>
              <span
                className={`badge ${data.urgency === 'alta'
                    ? 'badge-error'
                    : data.urgency === 'media'
                      ? 'badge-warning'
                      : 'badge-success'
                  }`}
              >
                {URGENCY_LABELS[data.urgency]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Anonymous Toggle */}
      <div className="card-glass-solid">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-viseu-gold/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-viseu-gold" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-viseu-dark">
                Como quer enviar?
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.isAnonymous}
                  onChange={(e) => onAnonymousChange(e.target.checked)}
                  className="sr-only peer"
                  aria-label="Enviar anonimamente"
                  title="Enviar anonimamente"
                />
                <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-viseu-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-viseu-gold shadow-inner"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">
              {data.isAnonymous
                ? 'Anónimo - Não receberá resposta da Câmara'
                : 'Identificado (recomendado) - Recebe resposta'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {!data.isAnonymous && (
        <div className="card-glass-solid animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-category-blue/20 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-category-blue" />
            </div>
            <h3 className="font-bold text-viseu-dark text-lg">
              Dados de Contacto
            </h3>
          </div>

          <div className="space-y-4">
            <Input
              label="Nome"
              type="text"
              placeholder="O seu nome completo"
              value={data.name}
              onChange={(e) => onNameChange(e.target.value)}
              required={!data.isAnonymous}
            />

            <Input
              label="Email"
              type="email"
              placeholder="exemplo@email.com"
              value={data.email}
              onChange={(e) => onEmailChange(e.target.value)}
              required={!data.isAnonymous}
              helperText="Para receber atualizações"
            />

            <Input
              label="Telefone"
              type="tel"
              placeholder="912 345 678"
              value={data.phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              helperText="Opcional"
            />
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="card-glass">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-category-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-category-blue" />
          </div>
          <div>
            <p className="font-semibold text-viseu-dark mb-2">O que acontece a seguir?</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-viseu-gold/20 rounded-full flex items-center justify-center text-xs font-bold text-viseu-dark flex-shrink-0 mt-0.5">1</span>
                Será gerada uma carta formal
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-viseu-gold/20 rounded-full flex items-center justify-center text-xs font-bold text-viseu-dark flex-shrink-0 mt-0.5">2</span>
                Receberá uma referência única
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-viseu-gold/20 rounded-full flex items-center justify-center text-xs font-bold text-viseu-dark flex-shrink-0 mt-0.5">3</span>
                Pode enviar por email à Câmara
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
