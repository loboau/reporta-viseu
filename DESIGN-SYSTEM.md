# Reporta Viseu - Design System

### Baseado na identidade visual do Município de Viseu
### Inspirado no estilo moderno de apps de cidade

---

## 🎨 Paleta de Cores

### Cores Oficiais de Viseu
```css
:root {
  /* Cor Principal - Amarelo Dourado de Viseu */
  --viseu-gold: #F5B800;
  --viseu-gold-light: #FFD54F;
  --viseu-gold-dark: #C99700;
  
  /* Cor Secundária - Cinza Escuro */
  --viseu-dark: #2D2D2D;
  --viseu-darker: #1A1A1A;
  
  /* Branco */
  --white: #FFFFFF;
  --off-white: #FAFAFA;
}
```

### Cores de Categorias (Estilo City Guide)
```css
:root {
  /* Cards de Categoria - Cores Vibrantes */
  --cat-infrastructure: #6B4EE6;  /* Roxo - Obras/Infraestrutura */
  --cat-lighting: #FFB020;        /* Amarelo - Iluminação */
  --cat-cleaning: #22C55E;        /* Verde - Limpeza/Ambiente */
  --cat-trees: #10B981;           /* Verde Esmeralda - Árvores */
  --cat-water: #3B82F6;           /* Azul - Água */
  --cat-parking: #EF4444;         /* Vermelho - Estacionamento */
  --cat-signs: #F97316;           /* Laranja - Sinalização */
  --cat-animals: #EC4899;         /* Rosa - Animais */
  --cat-buildings: #8B5CF6;       /* Violeta - Edifícios */
  --cat-other: #6B7280;           /* Cinza - Outro */
}
```

### Cores de Interface
```css
:root {
  /* Background */
  --bg-primary: #F5F7FA;          /* Cinza muito claro */
  --bg-secondary: #FFFFFF;
  --bg-map: #E8F4E8;              /* Verde suave para mapa */
  
  /* Texto */
  --text-primary: #1A1A1A;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  --text-on-gold: #1A1A1A;
  --text-on-dark: #FFFFFF;
  
  /* Bordas */
  --border-light: #E5E7EB;
  --border-medium: #D1D5DB;
  
  /* Estados */
  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #3B82F6;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.08);
}
```

---

## 🔤 Tipografia

### Fontes
```css
/* Títulos - Serifada elegante como no logo de Viseu */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap');

/* Corpo - Sans-serif moderna e legível */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
}
```

### Escalas
```css
/* Tamanhos */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
--text-4xl: 36px;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Uso
```css
/* Logo / Título Principal */
.title-main {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--viseu-dark);
}

/* Subtítulos */
.title-section {
  font-family: var(--font-body);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
}

/* Corpo de texto */
.body-text {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--text-secondary);
  line-height: var(--leading-normal);
}
```

---

## 📐 Espaçamento

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

---

## 🎯 Componentes

### Header Principal
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Logo Viseu]    REPORTA VISEU           [Perfil/Menu]     │
│                  Comunique à sua cidade                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Estilo:
- Fundo: var(--white)
- Logo: Octógono com torre de Viseu (versão simplificada)
- Título: font-display, var(--viseu-dark)
- Subtítulo: font-body, var(--text-secondary)
- Sombra: var(--shadow-sm)
```

### Cards de Categoria (Estilo City Guide)
```
┌───────────────────┐  ┌───────────────────┐
│   ████████████    │  │   ████████████    │
│   █    🕳️    █    │  │   █    💡    █    │
│   ████████████    │  │   ████████████    │
│                   │  │                   │
│   Infraestrutura  │  │    Iluminação     │
└───────────────────┘  └───────────────────┘

Estilo:
- Tamanho: 160px x 120px (mobile) / 180px x 140px (desktop)
- Border-radius: 20px
- Background: Cor da categoria (gradient suave)
- Ícone: 40px, centrado, com fundo branco arredondado
- Label: font-body, 14px, bold, cor escura
- Sombra: var(--shadow-card)
- Hover: scale(1.02), shadow aumenta
```

### Código do Card de Categoria
```jsx
const CategoryCard = ({ category, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative overflow-hidden rounded-2xl p-4
      transition-all duration-200 ease-out
      ${isSelected 
        ? 'ring-2 ring-viseu-gold ring-offset-2 scale-[1.02]' 
        : 'hover:scale-[1.02]'
      }
    `}
    style={{ 
      background: `linear-gradient(135deg, ${category.color} 0%, ${category.colorDark} 100%)` 
    }}
  >
    {/* Ícone */}
    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-3 shadow-md">
      <span className="text-2xl">{category.icon}</span>
    </div>
    
    {/* Label */}
    <p className="text-sm font-semibold text-white text-left">
      {category.label}
    </p>
    
    {/* Decoração */}
    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
  </button>
);
```

### Mapa (Estilo City Guide)
```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │                    🗺️ MAPA                         │   │
│  │                                                     │   │
│  │              📍 Marcador Viseu Gold                │   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Controlos ──────┐                                      │
│  │  [+]             │                                      │
│  │  [-]             │                                      │
│  │  [📍 GPS]        │                                      │
│  └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘

Estilo:
- Container: border-radius 24px, overflow hidden
- Sombra: var(--shadow-lg)
- Controlos: Botões brancos com sombra, posicionados à direita
- Marcador: Pin personalizado com cor var(--viseu-gold)
```

### Botão GPS
```jsx
const GPSButton = ({ onClick, isLoading }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="
      flex items-center gap-2 w-full
      bg-viseu-gold text-viseu-dark
      px-6 py-4 rounded-2xl
      font-semibold text-lg
      shadow-md hover:shadow-lg
      transition-all duration-200
      hover:bg-viseu-gold-light
      active:scale-[0.98]
      disabled:opacity-70
    "
  >
    <Navigation className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
    {isLoading ? 'A localizar...' : 'Usar minha localização'}
  </button>
);
```

### Botão Principal
```jsx
const PrimaryButton = ({ children, onClick, disabled, loading }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="
      w-full flex items-center justify-center gap-2
      bg-gradient-to-r from-viseu-dark to-viseu-darker
      text-white px-8 py-4 rounded-2xl
      font-semibold text-lg
      shadow-lg hover:shadow-xl
      transition-all duration-200
      hover:from-viseu-darker hover:to-black
      active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed
    "
  >
    {loading ? (
      <Loader2 className="w-5 h-5 animate-spin" />
    ) : null}
    {children}
  </button>
);
```

### Botão Secundário
```jsx
const SecondaryButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="
      w-full flex items-center justify-center gap-2
      bg-white text-viseu-dark
      border-2 border-border-light
      px-8 py-4 rounded-2xl
      font-semibold text-lg
      shadow-sm hover:shadow-md
      transition-all duration-200
      hover:border-viseu-gold hover:bg-viseu-gold/5
      active:scale-[0.98]
    "
  >
    {children}
  </button>
);
```

### Card de Input
```jsx
const InputCard = ({ label, children, hint }) => (
  <div className="bg-white rounded-2xl p-5 shadow-card">
    <label className="block text-sm font-semibold text-text-primary mb-3">
      {label}
    </label>
    {children}
    {hint && (
      <p className="mt-2 text-sm text-text-muted flex items-center gap-1">
        <Lightbulb className="w-4 h-4 text-viseu-gold" />
        {hint}
      </p>
    )}
  </div>
);
```

### Seletor de Urgência
```
┌─────────────────────────────────────────────────────────────┐
│  Urgência:                                                  │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   ✓        │ │             │ │     🚨      │           │
│  │ Pode       │ │  Urgente    │ │  Perigoso   │           │
│  │ esperar    │ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│      Verde          Amarelo         Vermelho               │
└─────────────────────────────────────────────────────────────┘
```

```jsx
const UrgencySelector = ({ value, onChange }) => {
  const options = [
    { value: 'baixa', label: 'Pode esperar', color: 'bg-success', icon: '✓' },
    { value: 'media', label: 'Urgente', color: 'bg-warning', icon: '⚡' },
    { value: 'alta', label: 'Perigoso', color: 'bg-danger', icon: '🚨' },
  ];
  
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            flex-1 py-3 px-2 rounded-xl text-sm font-semibold
            transition-all duration-200 border-2
            ${value === option.value
              ? `${option.color} text-white border-transparent shadow-md`
              : 'bg-white text-text-primary border-border-light hover:border-gray-300'
            }
          `}
        >
          <span className="mr-1">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
};
```

### Progress Steps (Wizard)
```
        ①─────────②─────────③
       Onde?    O quê?   Enviar
       
Ativo: Círculo amarelo (viseu-gold) com número branco
Completo: Círculo amarelo com ✓
Inativo: Círculo cinza claro
Linha: Amarela se completo, cinza se não
```

```jsx
const WizardProgress = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Onde?' },
    { num: 2, label: 'O quê?' },
    { num: 3, label: 'Enviar' },
  ];
  
  return (
    <div className="flex items-center justify-between px-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.num}>
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                font-semibold text-sm transition-all duration-300
                ${currentStep > step.num
                  ? 'bg-viseu-gold text-viseu-dark'
                  : currentStep === step.num
                  ? 'bg-viseu-gold text-viseu-dark shadow-lg'
                  : 'bg-gray-100 text-gray-400'
                }
              `}
            >
              {currentStep > step.num ? '✓' : step.num}
            </div>
            <span
              className={`
                mt-2 text-xs font-medium
                ${currentStep >= step.num ? 'text-viseu-dark' : 'text-gray-400'}
              `}
            >
              {step.label}
            </span>
          </div>
          
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`
                flex-1 h-1 mx-2 rounded-full transition-all duration-300
                ${currentStep > step.num ? 'bg-viseu-gold' : 'bg-gray-200'}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
```

### Ecrã de Sucesso
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ┌──────────┐                            │
│                    │    ✓     │  ← Círculo amarelo         │
│                    └──────────┘                            │
│                                                             │
│              REPORTE CRIADO COM SUCESSO!                   │
│                                                             │
│              Referência: #VIS-2026-ABC123                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📄 Carta formal gerada                             │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │  Exmo. Senhor...                                    │   │
│  │                                      [📋 Copiar]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📧 Enviar para: obras@cm-viseu.pt                  │   │
│  │                                                     │   │
│  │  [████████ ABRIR EMAIL ████████]  ← Botão amarelo  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│             [ Fazer novo reporte ]                          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Obrigado por ajudar a melhorar Viseu! 🙏                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Say What? 🇵🇹 • saywhat.pt                   │   │
│  │        Feito com ❤️ por portugueses                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖼️ Ícones e Ilustrações

### Logo de Viseu Simplificado
Para usar na app, uma versão simplificada do brasão:
- Octógono com torre
- Versão monocromática (preto ou branco)
- Versão colorida (amarelo)

### Marcador do Mapa
```svg
<svg width="40" height="50" viewBox="0 0 40 50">
  <path d="M20 0C8.95 0 0 8.95 0 20c0 11.05 20 30 20 30s20-18.95 20-30C40 8.95 31.05 0 20 0z" fill="#F5B800"/>
  <circle cx="20" cy="20" r="8" fill="white"/>
</svg>
```

### Ícones de Categoria
Usar emojis nativos para máxima compatibilidade:
- 🕳️ Buraco/Infraestrutura
- 💡 Iluminação
- 🗑️ Lixo/Limpeza
- 🌳 Árvores/Jardins
- 💧 Água/Esgotos
- 🚗 Estacionamento
- 🚸 Sinalização
- 🐕 Animais
- 🏚️ Edifícios
- 📝 Outro

---

## 📱 Layout Responsivo

### Mobile (< 640px)
```
- Container: padding 16px
- Cards categoria: 2 colunas, gap 12px
- Mapa: altura 250px
- Botões: full width
- Font base: 16px
```

### Tablet (640px - 1024px)
```
- Container: max-width 600px, centrado
- Cards categoria: 3 colunas, gap 16px
- Mapa: altura 300px
- Font base: 16px
```

### Desktop (> 1024px)
```
- Container: max-width 700px, centrado
- Cards categoria: 5 colunas, gap 16px
- Mapa: altura 350px
- Font base: 16px
```

---

## 🎬 Animações

### Transições Base
```css
/* Transição padrão */
.transition-base {
  transition: all 0.2s ease-out;
}

/* Transição suave */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Animações de Entrada
```css
/* Fade in up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out forwards;
}
```

### Animação de Sucesso
```css
@keyframes successPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-success {
  animation: successPulse 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}
```

---

## 🎨 Tailwind Config Completo

```javascript
// tailwind.config.js

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Viseu Brand
        'viseu-gold': '#F5B800',
        'viseu-gold-light': '#FFD54F',
        'viseu-gold-dark': '#C99700',
        'viseu-dark': '#2D2D2D',
        'viseu-darker': '#1A1A1A',
        
        // Categories
        'cat-infrastructure': '#6B4EE6',
        'cat-lighting': '#FFB020',
        'cat-cleaning': '#22C55E',
        'cat-trees': '#10B981',
        'cat-water': '#3B82F6',
        'cat-parking': '#EF4444',
        'cat-signs': '#F97316',
        'cat-animals': '#EC4899',
        'cat-buildings': '#8B5CF6',
        'cat-other': '#6B7280',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'success': 'successPulse 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
      },
    },
  },
  plugins: [],
};
```

---

## 📜 Créditos

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                 [Logo Viseu]  REPORTA VISEU                │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│                      Say What? 🇵🇹                          │
│              Tecnologia feita por portugueses               │
│                      saywhat.pt                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

*Design System Reporta Viseu v1.0*
*Baseado na identidade visual do Município de Viseu*
