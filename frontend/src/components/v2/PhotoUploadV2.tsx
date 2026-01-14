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
      <div className="grid grid-cols-3 gap-3">
        {/* Existing Photos */}
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm"
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
              className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm text-v2-pink
                         rounded-full flex items-center justify-center
                         opacity-0 group-hover:opacity-100 sm:opacity-100
                         transition-all hover:bg-white shadow-sm"
              aria-label="Remover fotografia"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Add Photo Button - V2 Style */}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={handleButtonClick}
            className="aspect-square rounded-2xl border-2 border-dashed border-gray-200
                       hover:border-gray-300 hover:bg-gray-50
                       flex flex-col items-center justify-center gap-2
                       transition-all duration-200 cursor-pointer"
            aria-label="Adicionar fotografia"
          >
            {photos.length === 0 ? (
              <>
                {/* Use the PNG icon */}
                <div className="w-12 h-12 flex items-center justify-center">
                  <CategoryIconV2
                    iconPath="/v2/icons/Icon_Foto.png"
                    alt="Tirar Foto"
                    size={40}
                    className="opacity-40"
                  />
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  Tirar Foto
                </span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-gray-100
                                flex items-center justify-center">
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-xs text-gray-400 font-medium">
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
