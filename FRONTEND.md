# Reporta Viseu - Frontend

### Uma aplicação **Say What?** 🇵🇹
*Feita por portugueses, para portugueses*

---

## 📋 Resumo

Este documento especifica o **frontend** da aplicação Reporta Viseu - uma interface ultra user-friendly para cidadãos reportarem problemas à Câmara Municipal.

**Stack:** React + TypeScript + Tailwind CSS + Leaflet

---

## 🛠️ Stack Tecnológico

```
Framework:      Next.js 14 (App Router) ou Vite + React
Linguagem:      TypeScript
Estilos:        Tailwind CSS
Mapa:           Leaflet + React-Leaflet
Ícones:         Lucide React
Fotos:          Browser native (input + canvas para compressão)
Estado:         React hooks (useState, useReducer)
HTTP:           Fetch API nativo
```

---

## 📁 Estrutura de Pastas

```
reporta-viseu/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Página principal (wizard)
│   │   ├── layout.tsx            # Layout base
│   │   ├── globals.css           # Estilos globais + Tailwind
│   │   └── api/
│   │       └── generate-letter/
│   │           └── route.ts      # API route para gerar carta (opcional)
│   │
│   ├── components/
│   │   ├── ui/                   # Componentes base reutilizáveis
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── RadioGroup.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── wizard/               # Componentes do wizard
│   │   │   ├── WizardContainer.tsx
│   │   │   ├── WizardProgress.tsx
│   │   │   ├── WizardNavigation.tsx
│   │   │   ├── Step1Location.tsx
│   │   │   ├── Step2Problem.tsx
│   │   │   ├── Step3Submit.tsx
│   │   │   └── StepSuccess.tsx
│   │   │
│   │   ├── map/                  # Componentes do mapa
│   │   │   ├── MapContainer.tsx
│   │   │   ├── LocationMarker.tsx
│   │   │   └── GPSButton.tsx
│   │   │
│   │   ├── photo/                # Componentes de foto
│   │   │   ├── PhotoUpload.tsx
│   │   │   ├── PhotoPreview.tsx
│   │   │   └── CameraButton.tsx
│   │   │
│   │   ├── letter/               # Componentes da carta
│   │   │   ├── LetterPreview.tsx
│   │   │   ├── LetterActions.tsx
│   │   │   └── EmailButton.tsx
│   │   │
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   ├── hooks/
│   │   ├── useGeolocation.ts     # Hook para GPS
│   │   ├── useReverseGeocode.ts  # Hook para converter coords em morada
│   │   ├── usePhotoUpload.ts     # Hook para gerir fotos
│   │   ├── useGenerateLetter.ts  # Hook para chamar API de IA
│   │   └── useLocalStorage.ts    # Hook para guardar rascunho
│   │
│   ├── lib/
│   │   ├── categories.ts         # Lista de categorias
│   │   ├── freguesias.ts         # Lista de freguesias
│   │   ├── departments.ts        # Mapeamento de departamentos
│   │   ├── generateReference.ts  # Gerar referência única
│   │   ├── compressImage.ts      # Comprimir imagens
│   │   ├── buildEmailLink.ts     # Construir mailto: link
│   │   └── constants.ts          # Constantes (coords Viseu, etc)
│   │
│   └── types/
│       └── index.ts              # TypeScript types
│
├── public/
│   ├── marker-icon.png           # Ícone do marcador
│   ├── logo-saywhat.svg          # Logo Say What?
│   └── og-image.png              # Open Graph image
│
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## 🎨 Design System

### Cores (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primárias
        primary: {
          DEFAULT: '#1a365d',
          light: '#2c5282',
          dark: '#1a202c',
        },
        accent: {
          DEFAULT: '#f6ad55',
          light: '#fbd38d',
          dark: '#dd6b20',
        },
        // Estados
        success: '#48bb78',
        warning: '#ed8936',
        danger: '#f56565',
        // Neutros
        background: '#f7fafc',
        card: '#ffffff',
        border: '#e2e8f0',
        muted: '#718096',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'button': '0 4px 14px rgba(26, 54, 93, 0.25)',
      },
    },
  },
};
```

### Tipografia

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 16px;
  }
  
  body {
    @apply bg-background text-primary-dark antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply bg-gradient-to-br from-primary to-primary-light text-white 
           px-6 py-4 rounded-xl font-semibold text-lg
           shadow-button hover:shadow-card-hover
           transition-all duration-200 ease-out
           active:scale-[0.98];
  }
  
  .btn-secondary {
    @apply bg-white text-primary border-2 border-border
           px-6 py-4 rounded-xl font-semibold text-lg
           hover:border-primary hover:bg-gray-50
           transition-all duration-200;
  }
  
  .card {
    @apply bg-card rounded-2xl p-5 shadow-card;
  }
  
  .input {
    @apply w-full px-4 py-3 rounded-xl border-2 border-border
           focus:border-primary focus:ring-2 focus:ring-primary/20
           outline-none transition-all duration-200;
  }
}
```

---

## 📦 Types (TypeScript)

```typescript
// types/index.ts

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  freguesia?: string;
}

export interface Category {
  id: string;
  icon: string;
  label: string;
  sublabel: string;
  departamento: string;
  email: string;
  telefone?: string;
  permite_anonimo?: boolean;
}

export interface Photo {
  id: string;
  file: File;
  preview: string; // base64 ou blob URL
  compressed?: Blob;
}

export type Urgency = 'baixa' | 'media' | 'alta';

export interface ReportData {
  // Passo 1
  location: Location | null;
  
  // Passo 2
  category: Category | null;
  description: string;
  photos: Photo[];
  urgency: Urgency;
  
  // Passo 3
  isAnonymous: boolean;
  name?: string;
  email?: string;
  phone?: string;
  
  // Gerado
  reference?: string;
  letter?: string;
  createdAt?: Date;
}

export interface WizardState {
  currentStep: number;
  data: ReportData;
  isGenerating: boolean;
  error: string | null;
}

export type WizardAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'UPDATE_DATA'; data: Partial<ReportData> }
  | { type: 'SET_GENERATING'; isGenerating: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' };
```

---

## 🧩 Componentes Principais

### WizardContainer (Componente Principal)

```typescript
// components/wizard/WizardContainer.tsx

'use client';

import { useReducer } from 'react';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { Step1Location } from './Step1Location';
import { Step2Problem } from './Step2Problem';
import { Step3Submit } from './Step3Submit';
import { StepSuccess } from './StepSuccess';
import { Header } from '../Header';
import { Footer } from '../Footer';

const initialState: WizardState = {
  currentStep: 1,
  data: {
    location: null,
    category: null,
    description: '',
    photos: [],
    urgency: 'baixa',
    isAnonymous: false,
  },
  isGenerating: false,
  error: null,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'UPDATE_DATA':
      return { ...state, data: { ...state.data, ...action.data } };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.isGenerating };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function WizardContainer() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  
  const canProceed = () => {
    switch (state.currentStep) {
      case 1:
        return state.data.location !== null;
      case 2:
        return state.data.category !== null && state.data.description.length >= 10;
      case 3:
        return state.data.isAnonymous || (state.data.name && state.data.email);
      default:
        return false;
    }
  };
  
  const handleNext = () => {
    if (canProceed()) {
      dispatch({ type: 'SET_STEP', step: state.currentStep + 1 });
    }
  };
  
  const handleBack = () => {
    dispatch({ type: 'SET_STEP', step: state.currentStep - 1 });
  };
  
  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-lg">
        {state.currentStep < 4 && (
          <WizardProgress currentStep={state.currentStep} />
        )}
        
        <div className="mt-6">
          {state.currentStep === 1 && (
            <Step1Location
              data={state.data}
              onUpdate={(data) => dispatch({ type: 'UPDATE_DATA', data })}
            />
          )}
          
          {state.currentStep === 2 && (
            <Step2Problem
              data={state.data}
              onUpdate={(data) => dispatch({ type: 'UPDATE_DATA', data })}
            />
          )}
          
          {state.currentStep === 3 && (
            <Step3Submit
              data={state.data}
              onUpdate={(data) => dispatch({ type: 'UPDATE_DATA', data })}
              isGenerating={state.isGenerating}
              onGenerate={() => dispatch({ type: 'SET_GENERATING', isGenerating: true })}
              onSuccess={(letter, reference) => {
                dispatch({ type: 'UPDATE_DATA', data: { letter, reference } });
                dispatch({ type: 'SET_GENERATING', isGenerating: false });
                dispatch({ type: 'SET_STEP', step: 4 });
              }}
              onError={(error) => {
                dispatch({ type: 'SET_ERROR', error });
                dispatch({ type: 'SET_GENERATING', isGenerating: false });
              }}
            />
          )}
          
          {state.currentStep === 4 && (
            <StepSuccess
              data={state.data}
              onNewReport={handleReset}
            />
          )}
        </div>
        
        {state.currentStep < 4 && (
          <WizardNavigation
            currentStep={state.currentStep}
            canProceed={canProceed()}
            isGenerating={state.isGenerating}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
```

### WizardProgress

```typescript
// components/wizard/WizardProgress.tsx

interface Props {
  currentStep: number;
}

const steps = [
  { num: 1, label: 'Onde?' },
  { num: 2, label: 'O quê?' },
  { num: 3, label: 'Enviar' },
];

export function WizardProgress({ currentStep }: Props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center">
            {/* Step circle */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                font-semibold text-sm transition-all duration-300
                ${currentStep >= step.num
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-muted'
                }
              `}
            >
              {currentStep > step.num ? '✓' : step.num}
            </div>
            
            {/* Step label */}
            <span
              className={`
                ml-2 text-sm font-medium hidden sm:inline
                ${currentStep >= step.num ? 'text-primary' : 'text-muted'}
              `}
            >
              {step.label}
            </span>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-12 sm:w-20 h-1 mx-2 rounded-full transition-all duration-300
                  ${currentStep > step.num ? 'bg-primary' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step1Location (Mapa)

```typescript
// components/wizard/Step1Location.tsx

'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MapPin, Navigation, Edit3 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { FREGUESIAS } from '@/lib/freguesias';

// Importar mapa dinamicamente (SSR off)
const MapComponent = dynamic(() => import('../map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
      <span className="text-muted">A carregar mapa...</span>
    </div>
  ),
});

interface Props {
  data: ReportData;
  onUpdate: (data: Partial<ReportData>) => void;
}

export function Step1Location({ data, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const { getCurrentPosition, isLoading: gpsLoading } = useGeolocation();
  const { getAddress, isLoading: geocodeLoading } = useReverseGeocode();
  
  const handleMapClick = async (lat: number, lng: number) => {
    onUpdate({ location: { lat, lng } });
    
    // Obter morada
    const result = await getAddress(lat, lng);
    if (result) {
      onUpdate({
        location: {
          lat,
          lng,
          address: result.address,
          freguesia: result.freguesia,
        },
      });
    }
  };
  
  const handleGPS = async () => {
    const position = await getCurrentPosition();
    if (position) {
      handleMapClick(position.lat, position.lng);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Onde é o problema?
        </h2>
        
        {/* Mapa */}
        <div className="rounded-xl overflow-hidden border-2 border-border">
          <MapComponent
            center={data.location || { lat: 40.6566, lng: -7.9125 }}
            marker={data.location}
            onMapClick={handleMapClick}
          />
        </div>
        
        {/* Botão GPS */}
        <button
          onClick={handleGPS}
          disabled={gpsLoading}
          className="w-full mt-4 btn-secondary flex items-center justify-center gap-2"
        >
          <Navigation className={`w-5 h-5 ${gpsLoading ? 'animate-pulse' : ''}`} />
          {gpsLoading ? 'A obter localização...' : 'Usar minha localização atual'}
        </button>
        <p className="text-sm text-muted text-center mt-2">
          Recomendado se estiver no local
        </p>
      </div>
      
      {/* Morada detectada */}
      {data.location && (
        <div className="card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted mb-1">Localização marcada:</p>
              {geocodeLoading ? (
                <div className="h-6 bg-gray-100 rounded animate-pulse" />
              ) : (
                <p className="font-semibold text-primary">
                  {data.location.address || `${data.location.lat.toFixed(5)}, ${data.location.lng.toFixed(5)}`}
                </p>
              )}
              
              {/* Freguesia */}
              <div className="mt-3">
                <label className="text-sm text-muted">Freguesia:</label>
                <select
                  value={data.location.freguesia || ''}
                  onChange={(e) =>
                    onUpdate({
                      location: { ...data.location!, freguesia: e.target.value },
                    })
                  }
                  className="input mt-1"
                >
                  <option value="">Selecione a freguesia</option>
                  {FREGUESIAS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-muted hover:text-primary transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
          
          {/* Edição manual */}
          {isEditing && (
            <div className="mt-4 pt-4 border-t border-border">
              <label className="text-sm text-muted">Morada manual:</label>
              <input
                type="text"
                value={data.location.address || ''}
                onChange={(e) =>
                  onUpdate({
                    location: { ...data.location!, address: e.target.value },
                  })
                }
                placeholder="Ex: Rua Direita, 45, Viseu"
                className="input mt-1"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Step2Problem (Categoria + Descrição + Fotos)

```typescript
// components/wizard/Step2Problem.tsx

'use client';

import { Camera, ImagePlus, X, AlertTriangle } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { PhotoUpload } from '../photo/PhotoUpload';

interface Props {
  data: ReportData;
  onUpdate: (data: Partial<ReportData>) => void;
}

const URGENCY_OPTIONS = [
  { value: 'baixa', label: 'Pode esperar', color: 'bg-success' },
  { value: 'media', label: 'Urgente', color: 'bg-warning' },
  { value: 'alta', label: '🚨 Perigoso', color: 'bg-danger' },
];

export function Step2Problem({ data, onUpdate }: Props) {
  return (
    <div className="space-y-4">
      {/* Categorias */}
      <div className="card">
        <h2 className="text-xl font-bold text-primary mb-4">
          📸 O que quer reportar?
        </h2>
        
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onUpdate({ category: cat })}
              className={`
                flex flex-col items-center p-2 sm:p-3 rounded-xl
                transition-all duration-200 border-2
                ${data.category?.id === cat.id
                  ? 'border-primary bg-primary/5 scale-105'
                  : 'border-transparent bg-gray-50 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-2xl sm:text-3xl">{cat.icon}</span>
              <span className="text-xs mt-1 text-center font-medium text-primary-dark leading-tight">
                {cat.label.split(' / ')[0]}
              </span>
            </button>
          ))}
        </div>
        
        {/* Categoria selecionada */}
        {data.category && (
          <div className="mt-4 p-3 bg-primary/5 rounded-xl">
            <p className="font-semibold text-primary">
              ✓ {data.category.label}
            </p>
            <p className="text-sm text-muted mt-1">
              → Vai para: {data.category.departamento}
            </p>
          </div>
        )}
      </div>
      
      {/* Descrição */}
      <div className="card">
        <label className="block text-sm font-medium text-primary mb-2">
          Descreva com as suas palavras:
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Ex: Há um buraco grande na estrada, já furei um pneu..."
          maxLength={300}
          rows={4}
          className="input resize-none"
        />
        <div className="flex justify-between mt-2">
          <p className="text-sm text-muted">
            💡 Escreva como quiser, nós tratamos do formal
          </p>
          <span className="text-sm text-muted">
            {data.description.length}/300
          </span>
        </div>
      </div>
      
      {/* Fotos */}
      <div className="card">
        <label className="block text-sm font-medium text-primary mb-2">
          📷 Adicionar fotos (opcional mas ajuda!)
        </label>
        
        <PhotoUpload
          photos={data.photos}
          onPhotosChange={(photos) => onUpdate({ photos })}
          maxPhotos={5}
        />
      </div>
      
      {/* Urgência */}
      <div className="card">
        <label className="block text-sm font-medium text-primary mb-3">
          Urgência:
        </label>
        
        <div className="flex gap-2">
          {URGENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onUpdate({ urgency: option.value as Urgency })}
              className={`
                flex-1 py-3 px-2 rounded-xl text-sm font-medium
                transition-all duration-200 border-2
                ${data.urgency === option.value
                  ? `${option.color} text-white border-transparent`
                  : 'bg-gray-50 text-primary-dark border-transparent hover:border-gray-200'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {data.urgency === 'alta' && (
          <div className="mt-3 p-3 bg-danger/10 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <p className="text-sm text-danger">
              <strong>Para emergências, ligue 112.</strong>
              <br />
              Este formulário não substitui serviços de emergência.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step3Submit (Identificação + Envio)

```typescript
// components/wizard/Step3Submit.tsx

'use client';

import { useState } from 'react';
import { User, Shield, Mail, Phone, FileText } from 'lucide-react';
import { useGenerateLetter } from '@/hooks/useGenerateLetter';
import { generateReference } from '@/lib/generateReference';

interface Props {
  data: ReportData;
  onUpdate: (data: Partial<ReportData>) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onSuccess: (letter: string, reference: string) => void;
  onError: (error: string) => void;
}

export function Step3Submit({
  data,
  onUpdate,
  isGenerating,
  onGenerate,
  onSuccess,
  onError,
}: Props) {
  const { generateLetter } = useGenerateLetter();
  
  const handleSubmit = async () => {
    onGenerate();
    
    try {
      const reference = generateReference();
      const letter = await generateLetter({
        ...data,
        reference,
      });
      
      onSuccess(letter, reference);
    } catch (error) {
      onError('Erro ao gerar carta. Por favor tente novamente.');
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="card">
        <h2 className="text-xl font-bold text-primary mb-4">
          ✅ Confirmar e Enviar
        </h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted">📍</span>
            <span>{data.location?.address || 'Localização marcada'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted">{data.category?.icon}</span>
            <span>{data.category?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted">📷</span>
            <span>{data.photos.length} fotografia(s)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted">⚡</span>
            <span className="capitalize">{data.urgency}</span>
          </div>
        </div>
      </div>
      
      {/* Tipo de envio */}
      <div className="card">
        <p className="font-medium text-primary mb-3">Como quer enviar?</p>
        
        <div className="space-y-2">
          {/* Identificado */}
          <button
            onClick={() => onUpdate({ isAnonymous: false })}
            className={`
              w-full p-4 rounded-xl border-2 text-left transition-all
              ${!data.isAnonymous
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">Identificado (recomendado)</p>
                <p className="text-sm text-muted">
                  ✓ Recebe resposta da Câmara
                </p>
              </div>
            </div>
          </button>
          
          {/* Anónimo */}
          <button
            onClick={() => onUpdate({ isAnonymous: true })}
            className={`
              w-full p-4 rounded-xl border-2 text-left transition-all
              ${data.isAnonymous
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted" />
              <div>
                <p className="font-semibold">Anónimo</p>
                <p className="text-sm text-muted">
                  Sem identificação, sem resposta
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Campos de identificação */}
      {!data.isAnonymous && (
        <div className="card space-y-3">
          <div>
            <label className="text-sm font-medium text-primary flex items-center gap-1">
              <User className="w-4 h-4" /> Nome *
            </label>
            <input
              type="text"
              value={data.name || ''}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="O seu nome completo"
              className="input mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-primary flex items-center gap-1">
              <Mail className="w-4 h-4" /> Email *
            </label>
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => onUpdate({ email: e.target.value })}
              placeholder="exemplo@email.com"
              className="input mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-primary flex items-center gap-1">
              <Phone className="w-4 h-4" /> Telefone (opcional)
            </label>
            <input
              type="tel"
              value={data.phone || ''}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              placeholder="912 345 678"
              className="input mt-1"
            />
          </div>
        </div>
      )}
      
      {/* Botão gerar */}
      <button
        onClick={handleSubmit}
        disabled={isGenerating || (!data.isAnonymous && (!data.name || !data.email))}
        className={`
          w-full btn-primary flex items-center justify-center gap-2
          ${isGenerating ? 'opacity-75 cursor-wait' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            A gerar carta...
          </>
        ) : (
          <>
            <FileText className="w-5 h-5" />
            Gerar Carta e Enviar
          </>
        )}
      </button>
      
      <p className="text-sm text-muted text-center">
        A carta formal é gerada automaticamente por IA
      </p>
    </div>
  );
}
```

### StepSuccess (Carta Gerada)

```typescript
// components/wizard/StepSuccess.tsx

'use client';

import { useState } from 'react';
import { Check, Copy, Mail, RefreshCw, ExternalLink } from 'lucide-react';
import { buildEmailLink } from '@/lib/buildEmailLink';

interface Props {
  data: ReportData;
  onNewReport: () => void;
}

export function StepSuccess({ data, onNewReport }: Props) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    if (data.letter) {
      await navigator.clipboard.writeText(data.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleOpenEmail = () => {
    if (data.letter && data.category) {
      const emailLink = buildEmailLink({
        to: data.category.email,
        subject: `Reporte #${data.reference} - ${data.category.label}`,
        body: data.letter,
      });
      window.open(emailLink, '_blank');
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Sucesso */}
      <div className="card text-center py-8">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-primary">
          Reporte Criado com Sucesso!
        </h2>
        <p className="text-muted mt-2">
          Referência: <span className="font-mono font-bold">#{data.reference}</span>
        </p>
      </div>
      
      {/* Carta gerada */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-primary">📄 Carta Formal Gerada</h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-success" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-primary-dark font-sans">
            {data.letter}
          </pre>
        </div>
      </div>
      
      {/* Enviar por email */}
      <div className="card">
        <p className="text-sm text-muted mb-2">📧 Enviar para:</p>
        <p className="font-semibold text-primary">{data.category?.email}</p>
        <p className="text-sm text-muted">{data.category?.departamento}</p>
        
        <button
          onClick={handleOpenEmail}
          className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
        >
          <Mail className="w-5 h-5" />
          Abrir Email com Carta
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
      
      {/* Novo reporte */}
      <button
        onClick={onNewReport}
        className="w-full btn-secondary flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        Fazer Novo Reporte
      </button>
      
      {/* Agradecimento */}
      <div className="text-center py-4">
        <p className="text-muted">
          Obrigado por ajudar a melhorar Viseu! 🙏
        </p>
      </div>
    </div>
  );
}
```

---

## 🗺️ Componente do Mapa

```typescript
// components/map/MapContainer.tsx

'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícone do Leaflet em Next.js
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface Props {
  center: { lat: number; lng: number };
  marker: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapComponent({ center, marker, onMapClick }: Props) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      style={{ height: '250px', width: '100%' }}
      className="rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapClickHandler onMapClick={onMapClick} />
      
      {marker && (
        <Marker position={[marker.lat, marker.lng]} icon={icon} />
      )}
    </MapContainer>
  );
}
```

---

## 🪝 Hooks Principais

### useGeolocation

```typescript
// hooks/useGeolocation.ts

import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getCurrentPosition = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    setIsLoading(true);
    setError(null);
    
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocalização não suportada');
        setIsLoading(false);
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setError('Não foi possível obter localização');
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);
  
  return { getCurrentPosition, isLoading, error };
}
```

### useReverseGeocode

```typescript
// hooks/useReverseGeocode.ts

import { useState, useCallback } from 'react';

interface GeocodeResult {
  address: string;
  freguesia?: string;
}

export function useReverseGeocode() {
  const [isLoading, setIsLoading] = useState(false);
  
  const getAddress = useCallback(async (lat: number, lng: number): Promise<GeocodeResult | null> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await response.json();
      
      setIsLoading(false);
      
      if (data.display_name) {
        return {
          address: data.display_name.split(',').slice(0, 3).join(','),
          freguesia: data.address?.suburb || data.address?.village || data.address?.town,
        };
      }
      
      return null;
    } catch (error) {
      setIsLoading(false);
      return null;
    }
  }, []);
  
  return { getAddress, isLoading };
}
```

### useGenerateLetter

```typescript
// hooks/useGenerateLetter.ts

import { useCallback } from 'react';

export function useGenerateLetter() {
  const generateLetter = useCallback(async (data: ReportData): Promise<string> => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: buildPrompt(data),
          },
        ],
      }),
    });
    
    const result = await response.json();
    return result.content[0].text;
  }, []);
  
  return { generateLetter };
}

function buildPrompt(data: ReportData): string {
  return `
Gera uma carta formal curta para a Câmara Municipal de Viseu.

DADOS:
- Problema: ${data.category?.label}
- Departamento: ${data.category?.departamento}
- Local: ${data.location?.address}, ${data.location?.freguesia}
- Descrição: "${data.description}"
- Urgência: ${data.urgency}
- Fotos: ${data.photos.length > 0 ? 'Sim, em anexo' : 'Não'}
- Tipo: ${data.isAnonymous ? 'Anónimo' : data.name}
- Referência: ${data.reference}

REGRAS:
1. Português de Portugal (PT-PT)
2. Máximo 150 palavras
3. Tom formal mas simples
4. NÃO inventar factos
5. Incluir localização e referência
${data.isAnonymous ? '6. É anónimo - sem campos de identificação' : '6. Deixar espaço para assinatura'}

Responde SÓ com a carta, nada mais.
`;
}
```

---

## 📚 Bibliotecas de Dados

### categories.ts

```typescript
// lib/categories.ts

import { Category } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: 'buraco',
    icon: '🕳️',
    label: 'Buraco / Estrada',
    sublabel: 'Buracos, passeios, asfalto',
    departamento: 'Divisão de Obras Municipais',
    email: 'obras@cm-viseu.pt',
  },
  {
    id: 'luz',
    icon: '💡',
    label: 'Iluminação',
    sublabel: 'Candeeiros, postes, escuridão',
    departamento: 'Serviço de Iluminação Pública',
    email: 'iluminacao@cm-viseu.pt',
  },
  {
    id: 'lixo',
    icon: '🗑️',
    label: 'Lixo / Limpeza',
    sublabel: 'Contentores, entulho, sujidade',
    departamento: 'Divisão de Ambiente',
    email: 'ambiente@cm-viseu.pt',
  },
  {
    id: 'arvore',
    icon: '🌳',
    label: 'Árvores / Jardins',
    sublabel: 'Ramos, relva, parques',
    departamento: 'Serviço de Espaços Verdes',
    email: 'espacosverdes@cm-viseu.pt',
  },
  {
    id: 'agua',
    icon: '💧',
    label: 'Água / Esgotos',
    sublabel: 'Fugas, mau cheiro, tampas',
    departamento: 'Águas de Viseu',
    email: 'geral@aguasdeviseu.pt',
    telefone: '232 480 180',
  },
  {
    id: 'carro',
    icon: '🚗',
    label: 'Estacionamento',
    sublabel: 'Carros mal estacionados',
    departamento: 'Polícia Municipal',
    email: 'policiamunicipal@cm-viseu.pt',
    permite_anonimo: true,
  },
  {
    id: 'sinal',
    icon: '🚸',
    label: 'Sinalização',
    sublabel: 'Sinais, semáforos, passadeiras',
    departamento: 'Divisão de Trânsito',
    email: 'transito@cm-viseu.pt',
  },
  {
    id: 'animal',
    icon: '🐕',
    label: 'Animais',
    sublabel: 'Abandonados, feridos, perigosos',
    departamento: 'Centro de Recolha de Animais',
    email: 'croa@cm-viseu.pt',
  },
  {
    id: 'edificio',
    icon: '🏚️',
    label: 'Edifícios',
    sublabel: 'Degradados, perigosos, obras',
    departamento: 'Divisão de Urbanismo',
    email: 'urbanismo@cm-viseu.pt',
  },
  {
    id: 'outro',
    icon: '📝',
    label: 'Outro',
    sublabel: 'Qualquer outro assunto',
    departamento: 'Câmara Municipal de Viseu',
    email: 'geral@cm-viseu.pt',
  },
];
```

### freguesias.ts

```typescript
// lib/freguesias.ts

export const FREGUESIAS = [
  'Abraveses',
  'Bodiosa',
  'Campo',
  'Cepões',
  'Coração de Jesus',
  'Cota',
  'Farminhão',
  'Fragosela',
  'Lordosa',
  'Mundão',
  'Orgens',
  'Povolide',
  'Ranhados',
  'Repeses e São Salvador',
  'Ribafeita',
  'Rio de Loba',
  'Santos Evos',
  'São Cipriano e Vil de Souto',
  'São João de Lourosa',
  'São Pedro de France',
  'Silgueiros',
  'Torredeita',
  'Viseu',
];
```

### Utilitários

```typescript
// lib/generateReference.ts
export function generateReference(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VIS-${year}-${random}`;
}

// lib/buildEmailLink.ts
interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export function buildEmailLink({ to, subject, body }: EmailOptions): string {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
}

// lib/constants.ts
export const VISEU_CENTER = {
  lat: 40.6566,
  lng: -7.9125,
};

export const MAP_CONFIG = {
  zoom: 14,
  minZoom: 11,
  maxZoom: 19,
};
```

---

## 🦶 Footer (Branding Say What?)

```typescript
// components/Footer.tsx

export function Footer() {
  return (
    <footer className="bg-white border-t border-border py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted">
          Uma iniciativa{' '}
          <a
            href="https://saywhat.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:text-accent transition-colors"
          >
            Say What? 🇵🇹
          </a>
        </p>
        <p className="text-xs text-muted mt-1">
          Feito com ❤️ por portugueses
        </p>
      </div>
    </footer>
  );
}
```

---

## 🚀 Comandos de Setup

```bash
# Criar projeto
npx create-next-app@latest reporta-viseu --typescript --tailwind --app

# Instalar dependências
cd reporta-viseu
npm install leaflet react-leaflet lucide-react
npm install -D @types/leaflet

# Correr em desenvolvimento
npm run dev
```

---

## 🚀 Comando para Claude Code

```
Cria o frontend da app "Reporta Viseu" seguindo o ficheiro FRONTEND.md.

Começa por:
1. Configurar o projeto Next.js com TypeScript e Tailwind
2. Criar a estrutura de pastas
3. Implementar o WizardContainer e os 3 passos
4. Adicionar o mapa Leaflet
5. Implementar upload de fotos
6. Integrar geração de carta via API Claude
7. Adicionar branding Say What? no footer

Mobile-first, botões grandes, zero fricção.
```

---

*Frontend Reporta Viseu - Say What? 🇵🇹*
