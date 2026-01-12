import React from 'react'
import {
  TriangleAlert,
  Lightbulb,
  Trash2,
  TreeDeciduous,
  Droplets,
  Car,
  Signpost,
  PawPrint,
  Building2,
  Volume2,
  Accessibility,
  FileText
} from 'lucide-react'

interface IconProps {
  className?: string
  size?: number
}

// Map icons to Lucide components
// We wrap them to match the exact interface if necessary, but Lucide icons accept className and size.

// Buraco / Estrada -> TriangleAlert (Hazard)
export function IconBuraco({ className = '', size = 24 }: IconProps) {
  return <TriangleAlert className={className} size={size} strokeWidth={2} />
}

// Iluminação -> Lightbulb
export function IconIluminacao({ className = '', size = 24 }: IconProps) {
  return <Lightbulb className={className} size={size} strokeWidth={2} />
}

// Lixo / Limpeza -> Trash2
export function IconLixo({ className = '', size = 24 }: IconProps) {
  return <Trash2 className={className} size={size} strokeWidth={2} />
}

// Árvores / Jardins -> TreeDeciduous
export function IconArvores({ className = '', size = 24 }: IconProps) {
  return <TreeDeciduous className={className} size={size} strokeWidth={2} />
}

// Água / Esgotos -> Droplets
export function IconAgua({ className = '', size = 24 }: IconProps) {
  return <Droplets className={className} size={size} strokeWidth={2} />
}

// Estacionamento -> Car
export function IconEstacionamento({ className = '', size = 24 }: IconProps) {
  return <Car className={className} size={size} strokeWidth={2} />
}

// Sinalização -> Signpost
export function IconSinalizacao({ className = '', size = 24 }: IconProps) {
  return <Signpost className={className} size={size} strokeWidth={2} />
}

// Animais -> PawPrint
export function IconAnimais({ className = '', size = 24 }: IconProps) {
  return <PawPrint className={className} size={size} strokeWidth={2} />
}

// Edifícios -> Building2
export function IconEdificios({ className = '', size = 24 }: IconProps) {
  return <Building2 className={className} size={size} strokeWidth={2} />
}

// Ruído -> Volume2
export function IconRuido({ className = '', size = 24 }: IconProps) {
  return <Volume2 className={className} size={size} strokeWidth={2} />
}

// Acessibilidade -> Accessibility
export function IconAcessibilidade({ className = '', size = 24 }: IconProps) {
  return <Accessibility className={className} size={size} strokeWidth={2} />
}

// Outro -> FileText
export function IconOutro({ className = '', size = 24 }: IconProps) {
  return <FileText className={className} size={size} strokeWidth={2} />
}

// Map of category IDs to icons
// Using 'any' for the component type to be flexible with React component types, 
// though specifically they are specific Lucide components.
export const categoryIcons: Record<string, React.ComponentType<IconProps>> = {
  'pavimento': IconBuraco,
  'iluminacao': IconIluminacao,
  'residuos': IconLixo,
  'espacos-verdes': IconArvores,
  'agua': IconAgua,
  'estacionamento': IconEstacionamento,
  'sinalizacao': IconSinalizacao,
  'animais': IconAnimais,
  'edificios': IconEdificios,
  'ruido': IconRuido,
  'acessibilidade': IconAcessibilidade,
  'outro': IconOutro,
}

// Helper component to render icon by category ID
export function CategoryIcon({
  categoryId,
  className = '',
  size = 24,
}: {
  categoryId: string
  className?: string
  size?: number
}) {
  const Icon = categoryIcons[categoryId] || IconOutro
  return <Icon className={className} size={size} />
}

