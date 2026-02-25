# GIMU-EarthQuake Watch 🌍

An interactive 3D globe visualizing global seismic activity from 1900 to present. Built with React, Three.js, and custom GLSL shaders.

## Live Features

- **3D Globe** — Rotate, zoom, and explore earthquake locations in real-time 3D
- **Historic Mode** — 125+ years of seismic data (1900–2026, M ≥ 6) animated on a timeline
- **Last 7 Days** — Live USGS data feed (M ≥ 2.5) showing recent global earthquakes
- **GPU-Rendered Points** — Custom GLSL shaders with depth-aware coloring and pulse animations
- **Timeline Playback** — Play/pause, speed controls (0.25x–4x), and show-all mode
- **Magnitude & Depth Filters** — Filter earthquakes by magnitude range and depth range
- **Depth-Aware Placement** — Earthquakes positioned inside the Earth based on depth (nonlinear scaling)
- **Info Panels** — Summary stats, depth legend, and magnitude legend
- **Mobile Responsive** — Compact mobile timeline, collapsible info panels
- **PWA & Offline** — Full offline support via service worker — works without internet once loaded
- **Onboarding** — First-visit tutorial overlay explaining all controls

## Data Modes

| Mode | Range | Filter | Aggregation |
|------|-------|--------|-------------|
| Historic | 1900–2026 | M ≥ 6 | Monthly bins |
| Last 7 Days | Live USGS feed | M ≥ 2.5 | Daily bins |

## Tech Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Three.js** + `@react-three/fiber` + `@react-three/drei`
- **Custom GLSL Shaders** (vertex + fragment with pulse animation)
- **amCharts 5** (timeline chart strips)
- **SCSS Modules** (glassmorphism UI)
- **Service Worker** (full offline PWA)

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Data Pipeline

Historical data is preprocessed into compact binary assets:

1. Source datasets from USGS Earthquake Catalog
2. Converted to `.bin` via:
   - `scripts/convert-earthquakes.js` → `earthquakes.bin` + `earthquakes-stats.json`
   - `scripts/convert-coastline.js` → `coastline.bin`
3. Loaded at runtime as `Float32Array`
4. Rendered through GPU pipeline with custom shaders

## Data Sources

- [USGS Earthquake Catalog](https://earthquake.usgs.gov/)
- [Natural Earth (110m Coastline)](https://www.naturalearthdata.com/)

## Credits

Developed by **Khadichabegim Naymanova**
Frontend Developer · React · TypeScript · WebGL
