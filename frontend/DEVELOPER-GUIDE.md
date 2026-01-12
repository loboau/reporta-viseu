# Developer Guide - Reporta Viseu

Complete guide for developers working on the Reporta Viseu frontend.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [State Management](#state-management)
3. [Component Patterns](#component-patterns)
4. [Styling Guide](#styling-guide)
5. [TypeScript Usage](#typescript-usage)
6. [Adding Features](#adding-features)
7. [Best Practices](#best-practices)
8. [Common Tasks](#common-tasks)

---

## Architecture Overview

### Tech Stack Rationale

**Next.js 14 (App Router)**
- Modern routing with nested layouts
- Server Components for performance
- Built-in optimization
- Easy deployment

**TypeScript**
- Type safety prevents runtime errors
- Better IDE support
- Self-documenting code
- Easier refactoring

**Tailwind CSS**
- Rapid development
- Consistent design system
- Mobile-first utilities
- Minimal CSS bundle

**useReducer for State**
- No external state library needed
- Predictable state updates
- Easy to test
- Type-safe actions

### Application Flow

```
User lands on page
    ↓
WizardContainer initializes
    ↓
Step 1: Select Location
    ├─ GPS or Map Click
    ├─ Reverse Geocode
    └─ Select Freguesia
    ↓
Step 2: Describe Problem
    ├─ Choose Category
    ├─ Write Description
    ├─ Upload Photos
    └─ Set Urgency
    ↓
Step 3: Contact Info
    ├─ Anonymous Toggle
    ├─ Contact Fields (if identified)
    └─ Review Summary
    ↓
Submit Action
    ├─ Generate Reference
    ├─ Build Email Body
    └─ Show Success Screen
    ↓
User sends email or starts new report
```

---

## State Management

### Wizard State Structure

```typescript
interface WizardState {
  currentStep: number        // 1, 2, or 3
  data: ReportData          // All form data
  isSubmitted: boolean      // Success state
}

interface ReportData {
  location: Location | null
  category: Category | null
  description: string
  photos: Photo[]
  urgency: Urgency
  isAnonymous: boolean
  name: string
  email: string
  phone: string
  reference?: string        // Generated on submit
}
```

### Actions

All state changes flow through actions:

```typescript
// Location
dispatch({ type: 'SET_LOCATION', payload: location })

// Category
dispatch({ type: 'SET_CATEGORY', payload: category })

// Photos
dispatch({ type: 'ADD_PHOTO', payload: photo })
dispatch({ type: 'REMOVE_PHOTO', payload: photoId })

// Navigation
dispatch({ type: 'NEXT_STEP' })
dispatch({ type: 'PREV_STEP' })

// Submit
dispatch({ type: 'SUBMIT' })

// Reset
dispatch({ type: 'RESET' })
```

### Validation

Validation happens at navigation time:

```typescript
const canProceedFromStep1 = (): boolean => {
  return state.data.location !== null
}

const canProceedFromStep2 = (): boolean => {
  return state.data.category !== null
}

const canProceedFromStep3 = (): boolean => {
  if (state.data.isAnonymous) return true
  return (
    state.data.name.trim() !== '' &&
    state.data.email.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.data.email)
  )
}
```

---

## Component Patterns

### 1. Controlled Components

All form inputs are controlled:

```typescript
<Input
  value={state.data.name}
  onChange={(e) => dispatch({
    type: 'SET_NAME',
    payload: e.target.value
  })}
/>
```

### 2. Composition

Components are composed from smaller pieces:

```typescript
<Card>
  <Button variant="primary">
    <Icon className="w-5 h-5" />
    Label
  </Button>
</Card>
```

### 3. Props Interface

Every component has typed props:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  children: React.ReactNode
  fullWidth?: boolean
}
```

### 4. Custom Hooks

Extract reusable logic:

```typescript
// useGeolocation.ts
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  })

  const getCurrentLocation = useCallback(() => {
    // Implementation
  }, [])

  return { ...state, getCurrentLocation }
}
```

---

## Styling Guide

### Tailwind Utilities

**Spacing System**
- Use consistent spacing: 2, 4, 6, 8, 12, 16, 24
- Mobile-first: no prefix = mobile, `md:` = tablet, `lg:` = desktop

**Colors**
- Primary: `bg-viseu-gold`, `text-viseu-gold`
- Dark: `bg-viseu-dark`, `text-viseu-dark`
- Category: `bg-category-purple`, etc.

### Custom Component Classes

Defined in `globals.css`:

```css
.btn-primary
.btn-secondary
.btn-outline
.card
.card-interactive
.input
.textarea
.spinner
```

### Responsive Design

Mobile-first approach:

```tsx
<div className="
  grid grid-cols-1        // Mobile: 1 column
  sm:grid-cols-2          // Small: 2 columns
  lg:grid-cols-3          // Large: 3 columns
  gap-4                   // Consistent spacing
">
```

### Animations

Use Tailwind animations:

```tsx
className="animate-fade-in"
className="animate-slide-up"
className="animate-scale-in"
className="animate-spin-slow"
```

---

## TypeScript Usage

### Type Imports

Always import types from central location:

```typescript
import { Location, Category, Photo, ReportData } from '@/types'
```

### Type Safety

Leverage TypeScript for safety:

```typescript
// Enum-like constants
export type Urgency = 'baixa' | 'media' | 'alta'

// Discriminated unions for actions
export type WizardAction =
  | { type: 'SET_LOCATION'; payload: Location }
  | { type: 'SET_CATEGORY'; payload: Category }
  | { type: 'NEXT_STEP' }
```

### Prop Types

Always define prop interfaces:

```typescript
interface Step1LocationProps {
  location: Location | null
  onLocationChange: (location: Location) => void
}
```

---

## Adding Features

### Adding a New Category

**1. Edit `src/lib/categories.ts`**

```typescript
{
  id: 'new-category',
  icon: '🔧',
  label: 'New Category',
  sublabel: 'Short description',
  departamento: 'Department Name',
  email: 'department@cm-viseu.pt',
  color: '#FF6B6B',      // Main color
  colorDark: '#EE5A5A',  // Hover color
}
```

**2. Add Tailwind colors (if needed)**

Edit `tailwind.config.ts`:

```typescript
category: {
  newcolor: '#FF6B6B',
  'newcolor-dark': '#EE5A5A',
}
```

### Adding a Form Field

**1. Update TypeScript types**

`src/types/index.ts`:
```typescript
export interface ReportData {
  // ... existing fields
  newField: string
}
```

**2. Add action type**

```typescript
export type WizardAction =
  // ... existing actions
  | { type: 'SET_NEW_FIELD'; payload: string }
```

**3. Update reducer**

`src/components/wizard/WizardContainer.tsx`:
```typescript
case 'SET_NEW_FIELD':
  return {
    ...state,
    data: { ...state.data, newField: action.payload },
  }
```

**4. Update initial state**

```typescript
const initialState: WizardState = {
  data: {
    // ... existing fields
    newField: '',
  },
}
```

**5. Add UI component**

```tsx
<Input
  label="New Field"
  value={state.data.newField}
  onChange={(e) => dispatch({
    type: 'SET_NEW_FIELD',
    payload: e.target.value
  })}
/>
```

**6. Update email template**

`src/lib/buildEmailLink.ts`:
```typescript
NEW FIELD
─────────────────────────────────────────────────────
${data.newField || 'Not provided'}
```

### Adding a Wizard Step

**1. Create new step component**

`src/components/wizard/Step4NewStep.tsx`:
```typescript
interface Step4NewStepProps {
  data: ReportData
  onFieldChange: (value: string) => void
}

export default function Step4NewStep({ data, onFieldChange }: Step4NewStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Your step content */}
    </div>
  )
}
```

**2. Update WizardContainer**

Add step to render logic:
```typescript
{state.currentStep === 4 && (
  <Step4NewStep
    data={state.data}
    onFieldChange={(value) =>
      dispatch({ type: 'SET_FIELD', payload: value })
    }
  />
)}
```

**3. Update WizardProgress**

Add icon and label:
```typescript
const steps = [
  { number: 1, label: 'Localização', icon: MapPin },
  { number: 2, label: 'Problema', icon: FileText },
  { number: 3, label: 'Enviar', icon: Send },
  { number: 4, label: 'New Step', icon: NewIcon },
]
```

**4. Update validation**

```typescript
const canProceedFromStep4 = (): boolean => {
  return /* your validation */
}
```

---

## Best Practices

### 1. Component Organization

```typescript
// Imports (grouped: React, external, internal, types)
import React from 'react'
import { MapPin } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Location } from '@/types'

// Interface definition
interface ComponentProps {
  // ...
}

// Component definition
export default function Component({ props }: ComponentProps) {
  // Hooks first
  const [state, setState] = useState()

  // Derived values
  const computed = useMemo(() => {}, [deps])

  // Event handlers
  const handleClick = () => {}

  // Effects last
  useEffect(() => {}, [deps])

  // Render
  return <div>...</div>
}
```

### 2. Performance

**Memoization**
```typescript
// Expensive computations
const result = useMemo(() => expensiveCalc(), [deps])

// Callbacks passed to children
const handleChange = useCallback((value) => {
  // ...
}, [deps])
```

**Dynamic Imports**
```typescript
// For heavy components like maps
const MapContainer = dynamic(() => import('./MapContainer'), {
  ssr: false,
  loading: () => <LoadingSpinner />
})
```

### 3. Error Handling

Always handle errors gracefully:

```typescript
try {
  const result = await api.call()
} catch (error) {
  const message = error instanceof Error
    ? error.message
    : 'Unknown error'
  setError(message)
}
```

### 4. Accessibility

```tsx
// Semantic HTML
<button type="button" aria-label="Delete photo">
  <X className="w-4 h-4" />
</button>

// Screen reader text
<span className="sr-only">Loading...</span>

// Loading states
<div role="status" aria-label="Loading">
  <LoadingSpinner />
</div>
```

---

## Common Tasks

### Debugging State

Add this to WizardContainer:

```typescript
useEffect(() => {
  console.log('State:', state)
}, [state])
```

### Testing a Component

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

```typescript
import { render, screen } from '@testing-library/react'
import Button from './Button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

### Changing Map Tiles

Edit `src/lib/constants.ts`:

```typescript
export const MAP_CONFIG = {
  // ... existing config
  tileLayer: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
}
```

Options:
- OpenStreetMap: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Humanitarian: `https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`
- Satellite: Requires API key (Mapbox, Google)

### Adding Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_MAP_API_KEY=your_key
```

Use in code:

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

### Building for Production

```bash
# Build
npm run build

# Check bundle size
npm run build -- --analyze

# Start production server
npm start
```

---

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Formatting

Add Prettier:

```bash
npm install --save-dev prettier
```

`.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Type Checking

```bash
# Check types
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

---

## Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test in production mode locally
- [ ] Check Lighthouse scores (aim for 95+)
- [ ] Test on mobile devices
- [ ] Verify all images load
- [ ] Test GPS on HTTPS
- [ ] Check email generation
- [ ] Verify all categories work
- [ ] Test anonymous and identified flows
- [ ] Check accessibility with screen reader
- [ ] Test in different browsers
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics
- [ ] Add custom marker icon
- [ ] Update meta tags for SEO

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Leaflet**: https://leafletjs.com
- **TypeScript**: https://www.typescriptlang.org/docs

## Getting Help

1. Check the README.md
2. Review this guide
3. Search GitHub issues
4. Contact the team

---

**Last Updated**: 2024
**Maintained by**: Say What?
