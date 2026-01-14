'use client'

import React, { useRef, ChangeEvent } from 'react'
import Image from 'next/image'
import { X, Plus } from 'lucide-react'
import { Photo } from '@/types'
import { MAX_PHOTOS, MAX_PHOTO_SIZE, ACCEPTED_IMAGE_TYPES } from '@/lib/constants'
import { CategoryIconV2 } from './CategoryIconV2'

interface PhotoUploadV2Props {
  photos: Photo[]
  onAddPhoto: (photo: Photo) => void
  onRemovePhoto: (id: string) => void
}

export function PhotoUploadV2({
  photos,
  onAddPhoto,
  onRemovePhoto,
}: PhotoUploadV2Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        alert(`Formato não suportado: ${file.name}. Use JPG, PNG ou WebP.`)
        return
      }

      if (file.size > MAX_PHOTO_SIZE) {
        alert(`Ficheiro muito grande: ${file.name}. Tamanho máximo: 5MB.`)
        return
      }

      if (photos.length >= MAX_PHOTOS) {
        alert(`Máximo de ${MAX_PHOTOS} fotos atingido.`)
        return
      }

      const photo: Photo = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }
      onAddPhoto(photo)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Selecionar fotografias"
      />

      {/* Photo Grid - V2 Style */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Existing Photos */}
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-sm"
          >
            <Image
              src={photo.preview}
              alt="Preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onRemovePhoto(photo.id)}
              className="absolute top-1 right-1 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 bg-white/90 backdrop-blur-sm text-v2-pink
                         rounded-full flex items-center justify-center
                         opacity-100
                         transition-all hover:bg-white shadow-sm"
              aria-label="Remover fotografia"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        ))}

        {/* Add Photo Button - V2 Style */}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={handleButtonClick}
            className="aspect-square rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200
                       hover:border-gray-300 hover:bg-gray-50
                       flex flex-col items-center justify-center gap-1.5 sm:gap-2
                       transition-all duration-200 cursor-pointer"
            aria-label="Adicionar fotografia"
          >
            {photos.length === 0 ? (
              <>
                {/* Use the PNG icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                  <CategoryIconV2
                    iconPath="/v2/icons/Icon_Foto.png"
                    alt="Tirar Foto"
                    size={32}
                    className="opacity-40"
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-400 font-medium">
                  Tirar Foto
                </span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-100
                                flex items-center justify-center">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-400 font-medium">
                  Mais
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
