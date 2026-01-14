import type { Config } from 'tailwindcss'

const config: Config = {
  // Performance: More specific content paths reduce scanning time
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // City Guide Style - Main Brand Colors (Official Viseu Logo Yellow)
        viseu: {
          gold: '#E8B923',
          'gold-light': '#F2D054',
          'gold-dark': '#C99E1D',
          dark: '#1F2937',
          gray: '#374151',
          light: '#F8FAFC',
        },
        // V2 Design System Colors
        v2: {
          // Category colors
          purple: '#7C4DFF',
          yellow: '#FFC107',
          pink: '#E91E63',
          green: '#8BC34A',
          blue: '#2196F3',
          orange: '#FF9800',
          gray: '#9E9E9E',
          'gray-light': '#BDBDBD',
          // Pin colors
          'pin-green': '#8BC34A',
          'pin-yellow': '#FFC107',
          'pin-pink': '#E91E63',
          // Urgency backgrounds
          'urgency-low-bg': '#E8F5E9',
          'urgency-medium-bg': '#FFF8E1',
          'urgency-high-bg': '#FCE4EC',
          // Urgency text/icon colors
          'urgency-low': '#4CAF50',
          'urgency-medium': '#FFC107',
          'urgency-high': '#E91E63',
        },
        // City Guide Style - Vibrant Category Colors
        category: {
          // Buraco/Pavimento - Roxo vibrante
          purple: '#8B5CF6',
          'purple-dark': '#7C3AED',
          'purple-light': '#A78BFA',
          // Iluminacao - Amarelo
          yellow: '#FBBF24',
          'yellow-dark': '#F59E0B',
          'yellow-light': '#FCD34D',
          // Lixo/Residuos - Verde
          green: '#22C55E',
          'green-dark': '#16A34A',
          'green-light': '#4ADE80',
          // Espacos Verdes - Esmeralda
          emerald: '#10B981',
          'emerald-dark': '#059669',
          'emerald-light': '#34D399',
          // Agua - Azul
          blue: '#3B82F6',
          'blue-dark': '#2563EB',
          'blue-light': '#60A5FA',
          // Estacionamento - Vermelho
          red: '#EF4444',
          'red-dark': '#DC2626',
          'red-light': '#F87171',
          // Sinalizacao - Laranja
          orange: '#F97316',
          'orange-dark': '#EA580C',
          'orange-light': '#FB923C',
          // Animais - Rosa
          pink: '#EC4899',
          'pink-dark': '#DB2777',
          'pink-light': '#F472B6',
          // Edificios - Indigo
          indigo: '#6366F1',
          'indigo-dark': '#4F46E5',
          'indigo-light': '#818CF8',
          // Outro - Cinza
          gray: '#6B7280',
          'gray-dark': '#4B5563',
          'gray-light': '#9CA3AF',
          // Teal extra
          teal: '#14B8A6',
          'teal-dark': '#0D9488',
          'teal-light': '#2DD4BF',
        },
        // City Guide App Background - Light blue gradient
        'app-bg': '#E8F4FD',
        'app-bg-light': '#F0F9FF',
        'app-bg-dark': '#D4E8F7',
      },
      fontFamily: {
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        body: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        'pill': '9999px',
      },
      boxShadow: {
        // City Guide iOS-style soft shadows
        'soft': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 30px rgba(0, 0, 0, 0.1)',
        'soft-xl': '0 12px 40px rgba(0, 0, 0, 0.12)',
        // Card shadows
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.1)',
        'card-active': '0 4px 16px rgba(0, 0, 0, 0.08)',
        // Glass morphism shadow
        'glass': '0 8px 32px rgba(31, 38, 135, 0.08)',
        'glass-lg': '0 16px 48px rgba(31, 38, 135, 0.12)',
        // Floating element shadow
        'float': '0 10px 40px rgba(0, 0, 0, 0.1)',
        'float-lg': '0 20px 60px rgba(0, 0, 0, 0.15)',
        // Colored shadows for categories (Official Viseu Gold #E8B923)
        'gold': '0 4px 20px rgba(232, 185, 35, 0.35)',
        'gold-lg': '0 8px 32px rgba(232, 185, 35, 0.4)',
        'purple': '0 6px 24px rgba(139, 92, 246, 0.4)',
        'yellow-glow': '0 6px 24px rgba(251, 191, 36, 0.4)',
        'green': '0 6px 24px rgba(34, 197, 94, 0.4)',
        'blue': '0 6px 24px rgba(59, 130, 246, 0.4)',
        'red': '0 6px 24px rgba(239, 68, 68, 0.4)',
        'orange': '0 6px 24px rgba(249, 115, 22, 0.4)',
        'pink': '0 6px 24px rgba(236, 72, 153, 0.4)',
        'indigo': '0 6px 24px rgba(99, 102, 241, 0.4)',
        'emerald': '0 6px 24px rgba(16, 185, 129, 0.4)',
      },
      backgroundImage: {
        // City Guide gradient backgrounds
        'gradient-app': 'linear-gradient(180deg, #E8F4FD 0%, #D4E8F7 30%, #E8F4FD 70%, #F0F9FF 100%)',
        'gradient-app-light': 'linear-gradient(180deg, #F0F9FF 0%, #E8F4FD 50%, #F0F9FF 100%)',
        'gradient-viseu': 'linear-gradient(135deg, #E8B923 0%, #F2D054 50%, #E8B923 100%)',
        'gradient-header': 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
        // Category gradients
        'gradient-purple': 'linear-gradient(145deg, #8B5CF6 0%, #7C3AED 100%)',
        'gradient-yellow': 'linear-gradient(145deg, #FBBF24 0%, #F59E0B 100%)',
        'gradient-green': 'linear-gradient(145deg, #22C55E 0%, #16A34A 100%)',
        'gradient-emerald': 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
        'gradient-blue': 'linear-gradient(145deg, #3B82F6 0%, #2563EB 100%)',
        'gradient-red': 'linear-gradient(145deg, #EF4444 0%, #DC2626 100%)',
        'gradient-orange': 'linear-gradient(145deg, #F97316 0%, #EA580C 100%)',
        'gradient-pink': 'linear-gradient(145deg, #EC4899 0%, #DB2777 100%)',
        'gradient-indigo': 'linear-gradient(145deg, #6366F1 0%, #4F46E5 100%)',
        'gradient-gray': 'linear-gradient(145deg, #6B7280 0%, #4B5563 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-soft': 'pulseSoft 2s infinite',
        'spin-slow': 'spin 1.5s linear infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        // V2 Sidebar animations
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-out-left': 'slideOutLeft 0.3s ease-in',
        'fade-in-overlay': 'fadeInOverlay 0.3s ease-out',
        'fade-out-overlay': 'fadeOutOverlay 0.3s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.08)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        // V2 Sidebar keyframes
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeInOverlay: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOutOverlay: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
export default config
