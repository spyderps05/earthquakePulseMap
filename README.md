# Earthquake Pulse Map

An interactive 3D earthquake visualization on a globe: events appear as points, and a click triggers a “pulse” wave (ring) from the selected quake.  
Data is fetched from **USGS Earthquake Feed / Catalog** (GeoJSON).

## Tech Stack
- Vite + React + TypeScript (SWC)
- Three.js
- @react-three/fiber, @react-three/drei

## Planned Features
- 3D globe (rotate / zoom)
- Earthquakes as points:
  - size by magnitude (mag)
  - color by depth (depth)
  - timeline playback (events in time order)
- Click on a point:
  - pulse wave (ring shockwave)
  - tooltip/side panel (place, mag, depth, time, USGS link)
- Filters:
  - date range (e.g. last 30 days)
  - minimum magnitude
  - depth range
- Playback speed controls (x1 / x4 / x16)

## Current Status

- 3D globe scene implemented
- Transparent Earth mesh
- Coastline rendered from Natural Earth GeoJSON
- Glowing contour lines (custom shader material)
- Orbit controls (rotate / zoom)

## Data Sources
- USGS Earthquake Feeds (GeoJSON): https://earthquake.usgs.gov/earthquakes/feed/
- USGS Earthquake Catalog (FDSN Event API): https://earthquake.usgs.gov/fdsnws/event/1/
- Natural Earth – 110m Coastline (Physical Vectors):  
  https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-coastline/

## Getting Started

### 1) Install
```bash
npm install
```

### 2) Run
```bash
npm run dev