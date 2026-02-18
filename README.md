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

## Data Sources
- USGS Earthquake Feeds (GeoJSON): https://earthquake.usgs.gov/earthquakes/feed/
- USGS Earthquake Catalog (FDSN Event API): https://earthquake.usgs.gov/fdsnws/event/1/

## Getting Started

### 1) Install
`
npm i
`
