# Quick Start Guide - Reporta Viseu

Get the Reporta Viseu frontend running in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- npm, pnpm, or yarn

## Installation Steps

### 1. Navigate to frontend directory
```bash
cd /Users/lobomau/Documents/reporta/frontend
```

### 2. Install dependencies
```bash
npm install
```

This will install:
- Next.js 14.2.15
- React 18.3.1
- TypeScript 5.6.3
- Tailwind CSS 3.4.14
- Leaflet 1.9.4
- React Leaflet 4.2.1
- Lucide React 0.447.0

### 3. Run development server
```bash
npm run dev
```

### 4. Open in browser
Navigate to: **http://localhost:3000**

## That's it!

The application should now be running and fully functional.

## What to Test

### Step 1: Location
1. Click "Usar a minha localização GPS" (you may need to grant permission)
2. Or click anywhere on the map to set a location
3. Select a freguesia (optional)
4. Click "Continuar"

### Step 2: Problem
1. Click on a category (e.g., "Iluminação")
2. Write a description
3. Add photos (optional) - max 5 photos, 5MB each
4. Select urgency level
5. Click "Continuar"

### Step 3: Submit
1. Review the summary
2. Toggle anonymous/identified
3. If identified, fill in contact details
4. Click "Criar Reporte"

### Success Screen
1. Note the reference code (e.g., VIS-2024-A3F9K)
2. Review the email preview
3. Click "Enviar por Email" to open email client
4. Or copy the text and paste manually

## Optional: Add Custom Marker Icon

For a custom gold map marker:

1. Read `/public/MARKER-ICON-README.md`
2. Create or download a 25x41px PNG marker in gold (#F5B800)
3. Save as `/public/marker-icon.png`

The app works fine with the default marker if you skip this step.

## Build for Production

```bash
npm run build
npm start
```

The optimized production build will be available at http://localhost:3000

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Deploy automatically

Or use the Vercel CLI:
```bash
npm install -g vercel
vercel
```

## Troubleshooting

### Map not loading?
- Check browser console for errors
- Ensure you're online (map tiles load from OpenStreetMap)
- Try hard refresh (Cmd/Ctrl + Shift + R)

### GPS not working?
- Grant location permission in browser
- Use HTTPS in production (required for geolocation)
- Fallback: click on map to select location

### Photos not uploading?
- Check file size (max 5MB per photo)
- Use supported formats: JPG, PNG, WebP
- Maximum 5 photos total

### Email not opening?
- Ensure you have a default email client configured
- Alternative: copy the email body text manually
- Check that mailto: links are allowed in your browser

### TypeScript errors?
```bash
rm -rf .next
npm run dev
```

### Port 3000 already in use?
```bash
npm run dev -- -p 3001
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── app/           # Next.js pages
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilities
│   └── types/         # TypeScript types
├── public/            # Static files
└── [config files]
```

## Features Checklist

- [x] Mobile-first responsive design
- [x] GPS location detection
- [x] Interactive map (Leaflet + OpenStreetMap)
- [x] 10 problem categories
- [x] Photo upload with preview
- [x] Urgency levels (Low/Medium/High)
- [x] Anonymous or identified reporting
- [x] Email integration with formatted body
- [x] Reference code generation
- [x] Copy to clipboard
- [x] Freguesia selection
- [x] Address reverse geocoding
- [x] Form validation
- [x] Loading states
- [x] Error handling
- [x] Accessible UI (WCAG AA)

## Next Steps

1. **Customize Categories**
   - Edit `/src/lib/categories.ts`
   - Add/remove categories as needed

2. **Change Branding**
   - Update colors in `tailwind.config.ts`
   - Modify Header/Footer components

3. **Add Backend**
   - Create API routes in `/src/app/api/`
   - Replace email with database submission

4. **Analytics**
   - Add Google Analytics
   - Track report submissions

5. **Testing**
   - Add Jest + React Testing Library
   - Write component tests

## Support

For questions or issues:
- Check README.md for detailed docs
- Review PROJECT-STRUCTURE.md for architecture
- Contact: Say What? development team

## License

Developed for Câmara Municipal de Viseu
