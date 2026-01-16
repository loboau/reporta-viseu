# Performance Best Practices - Quick Reference

## React Component Performance

### When to use `memo`
✅ **Use for**:
- Components that render often with same props
- Components with expensive render logic
- List items that don't change frequently

❌ **Avoid for**:
- Components that always receive new props
- Very simple components (< 5 lines JSX)
- Components that rarely re-render

### When to use `useMemo`
✅ **Use for**:
- Expensive calculations (array operations, filtering, sorting)
- Creating objects/arrays passed as props
- Complex derived state

❌ **Avoid for**:
- Simple calculations (arithmetic, string concat)
- Values that change on every render

### When to use `useCallback`
✅ **Use for**:
- Functions passed to memoized child components
- Functions in dependency arrays
- Event handlers in lists

❌ **Avoid for**:
- Functions not passed as props
- Functions used only locally

## CSS Performance

### GPU-Accelerated Properties
✅ **Fast** (use these):
- `transform: translate3d()`, `translateX()`, `scale()`
- `opacity`
- `filter` (use sparingly)

❌ **Slow** (avoid animating):
- `width`, `height`, `top`, `left`
- `margin`, `padding`
- `font-size`, `border-width`

### Transform Best Practices
```css
/* ✅ Good - Hardware accelerated */
.element {
  transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden;
}

/* ❌ Bad - Causes repaints */
.element {
  position: relative;
  top: 10px;
  left: 20px;
}
```

## Image Optimization

### Next.js Image Component
```tsx
// ✅ Optimal for icons/small images
<Image
  src="/icon.png"
  alt="Icon"
  width={32}
  height={32}
  loading="lazy"
  quality={85}
  priority={false}
/>

// ✅ Critical above-fold images
<Image
  src="/hero.jpg"
  alt="Hero"
  fill
  priority={true}
  quality={90}
/>
```

## Event Listeners

### Passive Listeners
```tsx
// ✅ Good - Non-blocking
useEffect(() => {
  const handler = (e) => { /* ... */ }
  element.addEventListener('scroll', handler, { passive: true })
  return () => element.removeEventListener('scroll', handler)
}, [])

// ❌ Bad - Can block scrolling
useEffect(() => {
  const handler = (e) => { e.preventDefault(); /* ... */ }
  element.addEventListener('touchstart', handler)
  return () => element.removeEventListener('touchstart', handler)
}, [])
```

## Memory Management

### Cleanup Checklist
- ✅ Clear timers: `clearTimeout()`, `clearInterval()`
- ✅ Remove event listeners
- ✅ Cancel fetch requests (AbortController)
- ✅ Revoke object URLs: `URL.revokeObjectURL()`
- ✅ Unsubscribe from observables

```tsx
// ✅ Proper cleanup
useEffect(() => {
  const timer = setTimeout(fn, 1000)
  const objectUrl = URL.createObjectURL(file)

  return () => {
    clearTimeout(timer)
    URL.revokeObjectURL(objectUrl)
  }
}, [])
```

## Bundle Size

### Import Optimization
```tsx
// ✅ Good - Tree-shakeable
import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

// ❌ Bad - Imports entire library
import * as React from 'react'
import * as Icons from 'lucide-react'
```

### Dynamic Imports
```tsx
// ✅ Good - Lazy load heavy components
const MapContainer = dynamic(() => import('./MapContainer'), {
  ssr: false,
  loading: () => <LoadingSpinner />
})

// ❌ Bad - Loads everything upfront
import MapContainer from './MapContainer'
```

## Performance Metrics

### Core Web Vitals Targets
| Metric | Target | Critical |
|--------|--------|----------|
| FCP (First Contentful Paint) | < 1.2s | < 1.8s |
| LCP (Largest Contentful Paint) | < 2.0s | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.25 |
| FID (First Input Delay) | < 100ms | < 300ms |

### Quick Performance Audit
```bash
# Lighthouse audit
npx lighthouse https://localhost:3000 --view

# Bundle analysis
npm run build:analyze

# Check bundle size
npm run build && du -sh .next/static

# Profile in browser
# DevTools > Performance > Record
```

## Common Performance Pitfalls

### 1. Inline Functions
```tsx
// ❌ Bad - Creates new function on every render
<button onClick={() => handleClick(id)}>Click</button>

// ✅ Good - Memoized callback
const handleButtonClick = useCallback(() => handleClick(id), [id])
<button onClick={handleButtonClick}>Click</button>
```

### 2. Inline Objects/Arrays
```tsx
// ❌ Bad - New object on every render
<Component style={{ margin: 10 }} />

// ✅ Good - Constant reference
const style = { margin: 10 }
<Component style={style} />
```

### 3. State in Loops
```tsx
// ❌ Bad - Multiple state updates
items.forEach(item => setCount(count + 1))

// ✅ Good - Batch update
setCount(count + items.length)
```

### 4. Large Lists
```tsx
// ❌ Bad - Renders all 10,000 items
{items.map(item => <Item key={item.id} {...item} />)}

// ✅ Good - Virtual scrolling
<VirtualList
  items={items}
  renderItem={(item) => <Item {...item} />}
/>
```

## Mobile Performance

### Touch Optimization
- Use `touch-action: manipulation` to prevent 300ms delay
- Add `-webkit-tap-highlight-color: transparent` for cleaner UX
- Ensure buttons are min 44x44px for touch targets
- Use `passive: true` for scroll/touch listeners

### Network Optimization
- Lazy load images below the fold
- Preload critical resources
- Use proper cache headers
- Compress assets (gzip/brotli)

## Testing Performance

### Manual Testing
1. Throttle CPU (DevTools > Performance > CPU throttling)
2. Throttle Network (DevTools > Network > Slow 3G)
3. Test on real low-end devices
4. Check memory usage (DevTools > Memory)
5. Profile frame rate (DevTools > Rendering > Frame rendering stats)

### Automated Testing
```json
// package.json scripts
{
  "perf:lighthouse": "lighthouse https://localhost:3000 --output=html",
  "perf:bundle": "ANALYZE=true npm run build",
  "perf:size": "npm run build && du -sh .next/static"
}
```

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [CSS Triggers](https://csstriggers.com/)
- [Bundle Analyzer](https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer)
