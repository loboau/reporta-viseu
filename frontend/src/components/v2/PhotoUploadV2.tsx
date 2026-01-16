'use client'

import React, { useRef, ChangeEvent, useEffect } from 'react'
import Image from 'next/image'
import { X, Plus } from 'lucide-react'
import type { Photo } from '@/types'
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

  // Cleanup object URLs when photos are removed to prevent memory leaks
  useEffect(() => {
    return () => {
      photos.forEach(photo => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview)
        }
      })
    }
  }, [photos])

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
        aria-label="Selecionar fotografias para upload"
        id="photo-upload-input"
      />

      {/* Photo Grid - V2 Style */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3" role="list" aria-label={`Fotografias adicionadas: ${photos.length} de ${MAX_PHOTOS}`}>
        {/* Existing Photos */}
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            role="listitem"
            className="relative group aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-sm photo-pop-in"
          >
            <Image
              src={photo.preview}
              alt={`Fotografia ${index + 1} de ${photos.length}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onRemovePhoto(photo.id)}
              className="absolute top-1 right-1 sm:top-2 sm:right-2 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm text-v2-pink touch-target
                         rounded-xl flex items-center justify-center
                         opacity-100
                         transition-colors duration-200 hover:bg-white active:bg-gray-100 shadow-sm
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-v2-pink focus-visible:ring-offset-1"
              aria-label={`Remover fotografia ${index + 1}`}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        ))}

        {/* Add Photo Button - V2 Style - proportional to category buttons */}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={handleButtonClick}
            className="aspect-square rounded-lg sm:rounded-2xl border-2 border-dashed border-gray-200
                       hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 active:border-gray-400
                       flex flex-col items-center justify-between pt-2.5 pb-1.5 sm:pt-5 sm:pb-3 px-1 sm:px-2
                       transition-all duration-200 cursor-pointer touch-target
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-v2-yellow focus-visible:ring-offset-2"
            aria-label={`Adicionar fotografia - ${photos.length} de ${MAX_PHOTOS} usadas`}
          >
            {photos.length === 0 ? (
              <>
                {/* Use the PNG icon - proportional to category icons */}
                <div className="flex-1 flex items-center justify-center w-full">
                  <CategoryIconV2
                    iconPath="/v2/icons/Icon_Foto.png"
                    alt="Tirar Foto"
                    size={64}
                    className="opacity-50 w-14 h-14 sm:w-16 sm:h-16"
                  />
                </div>
                <span className="text-[11px] sm:text-sm text-gray-500 font-semibold">
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
