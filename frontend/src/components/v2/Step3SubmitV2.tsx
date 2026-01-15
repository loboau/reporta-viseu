'use client'

import React from 'react'
import {
  MapPin,
  FileText,
  Camera,
  User,
  CheckCircle2,
} from 'lucide-react'
import { ReportDataV2 } from '@/types'
import Input from '@/components/ui/Input'
import Image from 'next/image'
import { CategoryIconV2 } from './CategoryIconV2'
import { urgencyOptionsV2 } from '@/lib/categoriesV2'

interface Step3SubmitV2Props {
  data: ReportDataV2
  onNameChange: (name: string) => void
  onEmailChange: (email: string) => void
  onPhoneChange: (phone: string) => void
}

export default function Step3SubmitV2({
  data,
  onNameChange,
  onEmailChange,
  onPhoneChange,
}: Step3SubmitV2Props) {
  const urgencyOption = urgencyOptionsV2.find(u => u.id === data.urgency)

  return (
    <div className="space-y-3 sm:space-y-4 animate-fade-in pb-44">
      {/* Header */}
      <div className="text-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1">
          Reveja e confirme
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm">
          Verifique os dados antes de gerar a carta
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-2 sm:space-y-3">
        {/* Location */}
        {data.location && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border-l-4 border-v2-blue">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-v2-blue rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">
                  Localização
                </h3>
                {data.location.address && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-0.5" title={data.location.address}>
                    {data.location.address}
                  </p>
                )}
              </div>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Category */}
        {data.category && (
          <div
            className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border-l-4"
            style={{ borderLeftColor: data.category.color }}
          >
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: data.category.color }}
              >
                <CategoryIconV2
                  iconPath={data.category.iconPath}
                  alt={data.category.label}
                  size={18}
                  className="brightness-0 invert"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">
                  {data.category.label}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">
                  {data.category.departamento}
                </p>
              </div>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Description */}
        {data.description && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border-l-4 border-v2-purple">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-v2-purple rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-0.5 sm:mb-1">
                  Descrição
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {data.description}
                </p>
              </div>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Photos */}
        {data.photos.length > 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border-l-4 border-v2-green">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-v2-green rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1.5 sm:mb-2">
                  {data.photos.length} foto{data.photos.length > 1 ? 's' : ''}
                </h3>
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto">
                  {data.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-md sm:rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative"
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
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Urgency */}
        {urgencyOption && (
          <div
            className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border-l-4"
            style={{ borderLeftColor: urgencyOption.color }}
          >
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: urgencyOption.bgColor }}
              >
                <CategoryIconV2
                  iconPath={urgencyOption.iconPath}
                  alt={urgencyOption.label}
                  size={18}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">Urgência</h3>
                <span
                  className="text-[10px] sm:text-xs font-medium mt-0.5 inline-block"
                  style={{ color: urgencyOption.color }}
                >
                  {urgencyOption.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-v2-blue/10 rounded-lg sm:rounded-xl flex items-center justify-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-v2-blue" />
          </div>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
            Dados de Contacto
          </h3>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Input
            label="Nome"
            type="text"
            placeholder="O seu nome completo"
            value={data.name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="exemplo@email.com"
            value={data.email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
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

      {/* Info Note */}
      <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-v2-blue/10 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-v2-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-xs sm:text-sm mb-1.5 sm:mb-2">O que acontece a seguir?</p>
            <ul className="space-y-1 sm:space-y-1.5 text-[10px] sm:text-xs text-gray-600">
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-v2-yellow/20 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-gray-700 flex-shrink-0">1</span>
                Será gerada uma carta formal
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-v2-yellow/20 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-gray-700 flex-shrink-0">2</span>
                Receberá uma referência única
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-v2-yellow/20 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-gray-700 flex-shrink-0">3</span>
                Pode enviar por email à Câmara
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
