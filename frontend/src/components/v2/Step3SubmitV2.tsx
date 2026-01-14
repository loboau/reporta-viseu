'use client'

import React from 'react'
import {
  MapPin,
  FileText,
  Camera,
  User,
  Shield,
  CheckCircle2,
} from 'lucide-react'
import { ReportDataV2 } from '@/types'
import Input from '@/components/ui/Input'
import Image from 'next/image'
import { CategoryIconV2 } from './CategoryIconV2'
import { urgencyOptionsV2 } from '@/lib/categoriesV2'

interface Step3SubmitV2Props {
  data: ReportDataV2
  onAnonymousChange: (isAnonymous: boolean) => void
  onNameChange: (name: string) => void
  onEmailChange: (email: string) => void
  onPhoneChange: (phone: string) => void
}

export default function Step3SubmitV2({
  data,
  onAnonymousChange,
  onNameChange,
  onEmailChange,
  onPhoneChange,
}: Step3SubmitV2Props) {
  const urgencyOption = urgencyOptionsV2.find(u => u.id === data.urgency)

  return (
    <div className="space-y-4 animate-fade-in pb-44">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Reveja e confirme
        </h2>
        <p className="text-gray-500 text-sm">
          Verifique os dados antes de gerar a carta
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3">
        {/* Location */}
        {data.location && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-v2-blue">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-v2-blue rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Localização
                </h3>
                {data.location.address && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-0.5" title={data.location.address}>
                    {data.location.address}
                  </p>
                )}
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Category */}
        {data.category && (
          <div
            className="bg-white rounded-2xl p-4 shadow-sm border-l-4"
            style={{ borderLeftColor: data.category.color }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: data.category.color }}
              >
                <CategoryIconV2
                  iconPath={data.category.iconPath}
                  alt={data.category.label}
                  size={20}
                  className="brightness-0 invert"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {data.category.label}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {data.category.departamento}
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Description */}
        {data.description && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-v2-purple">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-v2-purple rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  Descrição
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {data.description}
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Photos */}
        {data.photos.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-v2-green">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-v2-green rounded-xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">
                  {data.photos.length} fotografia{data.photos.length > 1 ? 's' : ''}
                </h3>
                <div className="flex gap-2 overflow-x-auto">
                  {data.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative"
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
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Urgency */}
        {urgencyOption && (
          <div
            className="bg-white rounded-2xl p-4 shadow-sm border-l-4"
            style={{ borderLeftColor: urgencyOption.color }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: urgencyOption.bgColor }}
              >
                <CategoryIconV2
                  iconPath={urgencyOption.iconPath}
                  alt={urgencyOption.label}
                  size={20}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">Urgência</h3>
                <span
                  className="text-xs font-medium mt-0.5 inline-block"
                  style={{ color: urgencyOption.color }}
                >
                  {urgencyOption.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Anonymous Toggle */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-v2-yellow/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-v2-yellow" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                Como quer enviar?
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.isAnonymous}
                  onChange={(e) => onAnonymousChange(e.target.checked)}
                  className="sr-only peer"
                  aria-label="Enviar anonimamente"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-v2-yellow/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-v2-yellow"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500">
              {data.isAnonymous
                ? 'Anónimo - Não receberá resposta da Câmara'
                : 'Identificado (recomendado) - Recebe resposta'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {!data.isAnonymous && (
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-v2-blue/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-v2-blue" />
            </div>
            <h3 className="font-semibold text-gray-900">
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
      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-v2-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-v2-blue" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm mb-2">O que acontece a seguir?</p>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 bg-v2-yellow/20 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-700 flex-shrink-0">1</span>
                Será gerada uma carta formal
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 bg-v2-yellow/20 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-700 flex-shrink-0">2</span>
                Receberá uma referência única
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 bg-v2-yellow/20 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-700 flex-shrink-0">3</span>
                Pode enviar por email à Câmara
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
