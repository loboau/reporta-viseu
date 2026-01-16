'use client'

import React from 'react'
import { AlertCircle, Flame, Activity, Check, ArrowUp } from 'lucide-react'
import { Category, Photo, Urgency } from '@/types'
import { categories } from '@/lib/categories'
import { URGENCY_LABELS } from '@/lib/constants'
import Textarea from '@/components/ui/Textarea'
import PhotoUpload from '@/components/photo/PhotoUpload'
import { CategoryIcon } from '@/components/icons/CategoryIcons'

interface Step2ProblemProps {
  category: Category | null
  description: string
  photos: Photo[]
  urgency: Urgency
  onCategoryChange: (category: Category) => void
  onDescriptionChange: (description: string) => void
  onAddPhoto: (photo: Photo) => void
  onRemovePhoto: (id: string) => void
  onUrgencyChange: (urgency: Urgency) => void
}

// Map category IDs to their gradient background styles
const categoryStyles: Record<string, { bg: string; shadow: string }> = {
  pavimento: {
    bg: 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]',
    shadow: 'shadow-[0_6px_24px_rgba(139,92,246,0.4)]',
  },
  iluminacao: {
    bg: 'bg-gradient-to-br from-[#FBBF24] to-[#F59E0B]',
    shadow: 'shadow-[0_6px_24px_rgba(251,191,36,0.4)]',
  },
  residuos: {
    bg: 'bg-gradient-to-br from-[#22C55E] to-[#16A34A]',
    shadow: 'shadow-[0_6px_24px_rgba(34,197,94,0.4)]',
  },
  'espacos-verdes': {
    bg: 'bg-gradient-to-br from-[#10B981] to-[#059669]',
    shadow: 'shadow-[0_6px_24px_rgba(16,185,129,0.4)]',
  },
  agua: {
    bg: 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB]',
    shadow: 'shadow-[0_6px_24px_rgba(59,130,246,0.4)]',
  },
  estacionamento: {
    bg: 'bg-gradient-to-br from-[#EF4444] to-[#DC2626]',
    shadow: 'shadow-[0_6px_24px_rgba(239,68,68,0.4)]',
  },
  sinalizacao: {
    bg: 'bg-gradient-to-br from-[#F97316] to-[#EA580C]',
    shadow: 'shadow-[0_6px_24px_rgba(249,115,22,0.4)]',
  },
  animais: {
    bg: 'bg-gradient-to-br from-[#EC4899] to-[#DB2777]',
    shadow: 'shadow-[0_6px_24px_rgba(236,72,153,0.4)]',
  },
  edificios: {
    bg: 'bg-gradient-to-br from-[#6366F1] to-[#4F46E5]',
    shadow: 'shadow-[0_6px_24px_rgba(99,102,241,0.4)]',
  },
  ruido: {
    bg: 'bg-gradient-to-br from-[#14B8A6] to-[#0D9488]',
    shadow: 'shadow-[0_6px_24px_rgba(20,184,166,0.4)]',
  },
  acessibilidade: {
    bg: 'bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]',
    shadow: 'shadow-[0_6px_24px_rgba(139,92,246,0.4)]',
  },
  outro: {
    bg: 'bg-gradient-to-br from-[#6B7280] to-[#4B5563]',
    shadow: 'shadow-[0_6px_24px_rgba(107,114,128,0.3)]',
  },
}

export default function Step2Problem({
  category,
  description,
  photos,
  urgency,
  onCategoryChange,
  onDescriptionChange,
  onAddPhoto,
  onRemovePhoto,
  onUrgencyChange,
}: Step2ProblemProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Category Selection */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-viseu-dark mb-2">
            Qual é o problema?
          </h2>
          <p className="text-gray-500">
            Selecione a categoria que melhor descreve
          </p>
        </div>

        {/* Category Grid - 3-column layout */}
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat, index) => {
            const isSelected = category?.id === cat.id
            const style = categoryStyles[cat.id] ?? categoryStyles.outro ?? { bg: 'bg-gray-500', shadow: 'shadow-card' }

            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat)}
                className={`
                  relative overflow-hidden rounded-2xl p-3
                  min-h-[100px]
                  transition-all duration-300 ease-out
                  active:scale-95 cursor-pointer
                  flex flex-col items-center justify-center gap-2
                  animate-fade-in-up
                  ${isSelected
                    ? `${style.bg} ${style.shadow} ring-3 ring-white scale-[1.03]`
                    : 'bg-white shadow-soft-md hover:shadow-soft-lg hover:scale-[1.02]'
                  }
                `}
                style={{
                  animationDelay: `${index * 40}ms`,
                  boxShadow: isSelected
                    ? '0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(255, 255, 255, 0.9)'
                    : undefined
                }}
              >
                {/* Selection checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md animate-scale-in">
                    <Check className="w-3 h-3 text-green-500" strokeWidth={3} />
                  </div>
                )}

                {/* Icon container */}
                <div
                  className={`w-12 h-12 rounded-xl shadow-md flex items-center justify-center transition-all duration-300
                    ${isSelected ? 'bg-white/95' : style.bg}
                  `}
                >
                  <CategoryIcon
                    categoryId={cat.id}
                    size={24}
                    className={isSelected ? 'text-gray-800' : 'text-white'}
                  />
                </div>

                {/* Label */}
                <span className={`text-xs font-bold text-center leading-tight transition-colors duration-300
                  ${isSelected ? 'text-white drop-shadow-sm' : 'text-gray-700'}
                `}>
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Category Confirmation */}
      {category && (
        <div
          className="bg-white rounded-3xl p-5 shadow-soft-lg border-l-4 animate-slide-up"
          style={{ borderLeftColor: category.color }}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${categoryStyles[category.id]?.bg || 'bg-gray-500'}`}
            >
              <CategoryIcon
                categoryId={category.id}
                size={28}
                className="text-white"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-viseu-dark text-lg">
                {category.label}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {category.departamento}
              </p>
            </div>
            <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              OK
            </div>
          </div>
        </div>
      )}

      {/* Description Card */}
      <div className="bg-white rounded-3xl p-5 shadow-soft-lg">
        <Textarea
          label="Descreva o problema:"
          placeholder="Ex: Há um buraco grande na estrada que pode causar acidentes. Está lá há cerca de 2 semanas..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          maxLength={1000}
          showCount
          className="resize-none"
        />
        <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-amber-600">i</span>
          </div>
          <p className="text-sm text-gray-700 pt-2">
            Escreva como quiser - nós transformamos numa carta formal para a Câmara
          </p>
        </div>
      </div>

      {/* Photo Upload Card */}
      <div className="bg-white rounded-3xl p-5 shadow-soft-lg">
        <PhotoUpload
          photos={photos}
          onAddPhoto={onAddPhoto}
          onRemovePhoto={onRemovePhoto}
        />
      </div>

      {/* Urgency Selector */}
      <div className="bg-white rounded-3xl p-5 shadow-soft-lg">
        <div className="mb-4">
          <label className="block text-base font-semibold text-viseu-dark mb-1">
            Nível de urgência:
          </label>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <span className="text-red-500 font-bold">*</span>
            Para emergências (acidentes, incêndios), ligue 112
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(URGENCY_LABELS) as Urgency[]).map((level) => {
            const isSelected = urgency === level

            const config = {
              baixa: {
                icon: Activity,
                bg: isSelected ? 'bg-green-500' : 'bg-green-50',
                text: isSelected ? 'text-white' : 'text-green-700',
                border: 'border-green-200',
                shadow: isSelected ? 'shadow-[0_4px_20px_rgba(34,197,94,0.4)]' : '',
              },
              media: {
                icon: AlertCircle,
                bg: isSelected ? 'bg-amber-500' : 'bg-amber-50',
                text: isSelected ? 'text-white' : 'text-amber-700',
                border: 'border-amber-200',
                shadow: isSelected ? 'shadow-[0_4px_20px_rgba(245,158,11,0.4)]' : '',
              },
              alta: {
                icon: Flame,
                bg: isSelected ? 'bg-red-500' : 'bg-red-50',
                text: isSelected ? 'text-white' : 'text-red-700',
                border: 'border-red-200',
                shadow: isSelected ? 'shadow-[0_4px_20px_rgba(239,68,68,0.4)]' : '',
              },
            }

            const { icon: Icon, bg, text, border, shadow } = config[level]

            return (
              <button
                key={level}
                onClick={() => onUrgencyChange(level)}
                className={`
                  min-h-[80px] rounded-2xl p-4
                  flex flex-col items-center justify-center gap-2
                  border-2 ${border} ${bg} ${shadow}
                  transition-all duration-300
                  ${isSelected ? 'scale-105 -translate-y-1' : 'hover:scale-102'}
                  active:scale-95
                `}
              >
                <Icon className={`w-6 h-6 ${text}`} />
                <span className={`text-sm font-bold ${text}`}>
                  {URGENCY_LABELS[level]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Help message if no category selected */}
      {!category && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl text-center py-10 shadow-soft animate-pulse-soft">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-amber-100 flex items-center justify-center">
            <ArrowUp className="w-10 h-10 text-amber-500" />
          </div>
          <p className="text-lg text-gray-700 font-semibold">
            Selecione uma categoria acima
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Toque num dos cartões coloridos para continuar
          </p>
        </div>
      )}
    </div>
  )
}
