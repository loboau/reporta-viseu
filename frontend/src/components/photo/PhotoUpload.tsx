'use client'

import React, { useRef, ChangeEvent } from 'react'
import Image from 'next/image'
import { Camera, X, Image as ImageIcon, Plus } from 'lucide-react'
import { Photo } from '@/types'
import { MAX_PHOTOS, MAX_PHOTO_SIZE, ACCEPTED_IMAGE_TYPES } from '@/lib/constants'

interface PhotoUploadProps {
  photos: Photo[]
  onAddPhoto: (photo: Photo) => void
  onRemovePhoto: (id: string) => void
}

export default function PhotoUpload({
  photos,
  onAddPhoto,
  onRemovePhoto,
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        alert(`Formato não suportado: ${file.name}. Use JPG, PNG ou WebP.`)
        return
      }

      // Validate file size
      if (file.size > MAX_PHOTO_SIZE) {
        alert(
          `Ficheiro muito grande: ${file.name}. Tamanho máximo: 5MB.`
        )
        return
      }

      // Check if we've reached the limit
      if (photos.length >= MAX_PHOTOS) {
        alert(`Máximo de ${MAX_PHOTOS} fotos atingido.`)
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const photo: Photo = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: event.target?.result as string,
        }
        onAddPhoto(photo)
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-viseu-dark">
          Adicionar fotos (opcional)
        </label>
        <span className="text-xs text-gray-400">
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>

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

      {/* Photo Grid - City Guide Style */}
      <div className="grid grid-cols-3 gap-3">
        {/* Existing Photos */}
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-soft"
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
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm text-category-red
                         rounded-xl flex items-center justify-center
                         opacity-0 group-hover:opacity-100 sm:opacity-100
                         transition-all hover:bg-white shadow-soft-md"
              aria-label="Remover fotografia"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Add Photo Button */}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={handleButtonClick}
            className="aspect-square rounded-2xl border-2 border-dashed border-gray-200
                       hover:border-viseu-gold hover:bg-viseu-gold/5
                       flex flex-col items-center justify-center gap-2
                       transition-all duration-200 cursor-pointer
                       group"
            aria-label="Adicionar fotografia"
          >
            {photos.length === 0 ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-viseu-gold/20
                                flex items-center justify-center transition-colors">
                  <Camera className="w-6 h-6 text-gray-400 group-hover:text-viseu-gold transition-colors" />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-viseu-dark font-medium transition-colors">
                  Tirar Foto
                </span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-viseu-gold/20
                                flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-viseu-gold transition-colors" />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-viseu-dark font-medium transition-colors">
                  Mais
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {photos.length === 0 && (
        <p className="text-xs text-gray-400 text-center">
          As fotografias ajudam a resolver o problema mais rapidamente
        </p>
      )}
    </div>
  )
}
