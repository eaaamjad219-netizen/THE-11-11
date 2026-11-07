# THE 11:11

A browser-based mystery game prototype built with plain HTML, CSS and JavaScript.

## Run locally
1. Download or clone this repository.
2. Open `index.html` in a modern browser.

No build tools or installation are required.

## Build 0.7
- Added an interactive close-up photograph reveal inside Room 11, with a cinematic photo-card entrance and a dismiss control.
- The photograph reveal is generated in the scene and supports both Arabic and English.

## Build 0.6
- Ambient lighting effects in the lobby and corridor, including soft glow drift, chandelier flicker and a moving light sweep.
- Hotspots appear with a staggered entrance animation.
- Dialogue panels and choice buttons animate when updated.
- New evidence reveals with a subtle notebook animation.
- The in-game clock animates on updates, and Room 11 gets a visual unlock pulse.
- Motion effects respect reduced-motion accessibility preferences.

## Build 0.4
- Cinematic transitions between the lobby, corridor and Room 11: brief fade-out, depth zoom, soft blur and a smooth scene reveal.
- Navigation is temporarily locked during transitions to prevent overlapping scene changes.
- Reduced-motion preferences are respected.

## Previous build: 0.3
- Responsive interface for desktop and mobile.
- Arabic and English interface toggle.
- Three connected hotel locations: lobby, east corridor and Room 11.
- Six discoverable clues and an evidence notebook.
- Room 11 unlocks after collecting four clues.
- The in-game clock stops exactly at 11:11 PM; the next interaction begins a new loop while keeping collected clues.
- A Chapter One completion scene becomes available after all six clues are collected.
- Progress is saved locally in the browser.

## Project structure
- `index.html` — game screens and interface.
- `style.css` — visual design and responsive layout.
- `game.js` — interactions, time loop, evidence and save system.

## Note
This is still an early playable prototype. Save data is stored in the browser on the device used to play.
