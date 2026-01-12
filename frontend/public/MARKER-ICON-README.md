# Marker Icon Required

This application requires a custom map marker icon.

## File needed:
- **marker-icon.png** - Map marker in Viseu Gold color (#F5B800)

## Specifications:
- Size: 25x41 pixels (standard Leaflet marker size)
- Format: PNG with transparency
- Color: #F5B800 (Viseu Gold)
- Style: Should match the Leaflet default marker shape but in gold

## How to create:

### Option 1: Use an online tool
1. Go to https://www.flaticon.com or similar
2. Search for "map marker" or "location pin"
3. Download in gold color (#F5B800)
4. Resize to 25x41 pixels
5. Save as `marker-icon.png` in this directory

### Option 2: Use SVG and convert
Create an SVG with this code and convert to PNG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
  <path fill="#F5B800" stroke="#D4A000" stroke-width="1"
        d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.4 12.5 28.5 12.5 28.5S25 20.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
  <circle cx="12.5" cy="12.5" r="5" fill="#2D2D2D"/>
</svg>
```

### Option 3: Use the default Leaflet marker
If you don't have a custom icon ready, the map will work with the default Leaflet marker.
The application is configured to use a custom gold marker when available.

## Installation:
Place the `marker-icon.png` file in `/public/marker-icon.png`
