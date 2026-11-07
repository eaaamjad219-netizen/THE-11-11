# THE 11:11

## Build 1.5
- Added a playable Chapter Two, “The Forgotten Night,” unlocked from the Chapter One ending.
- Introduced three new clues: a tape recording in the lobby, a torn calendar page in the corridor, and strange digits in Room 11's mirror.
- Added a four-digit mirror puzzle (0311) and a new bilingual cinematic cliffhanger.
- Chapter Two progress is saved separately and restored when continuing a saved game.


## Build 1.4
- Added a cinematic Chapter One ending overlay with a glowing 11:11 clock, the mysterious guest silhouette, and a bilingual story reveal.
- Both Chapter One completion paths now lead into the same ending scene.
- Added a clear handoff teaser for Chapter Two: The Forgotten Night.
- Ending respects reduced-motion preferences and can be closed to return to the case notes.


A browser-based mystery game prototype built with plain HTML, CSS and JavaScript.

## Run locally
1. Download or clone this repository.
2. Open `index.html` in a modern browser.

No build tools or installation are required.

## Build 1.3
- Added an interactive four-digit lock puzzle to the box in Room 11.
- The clue points players toward the repeated 11:11 time; entering 1111 opens the box and reveals a new story note.
- Chapter One completion now requires all six clues and solving the room puzzle.
- Puzzle completion is saved locally and remains solved when continuing an older save.

## Build 1.2
- Added a real Key 11 discovery in the east corridor after meeting the mysterious guest.
- Room 11 now requires both four collected clues and Key 11; the key can be collected earlier and used once the clue requirement is met.
- Updated saved-game loading so older saves can continue with the new key objective.

## Build 1.1
- Added layered scene details to the hotel lobby, east corridor and Room 11: architectural pillars, floor runner, distant door, wall lamps, bed, bedside light, mirror and window.
- Scene details are created per location and adapt to smaller mobile screens.
- Existing clue hotspots, mysterious guest interaction, audio controls and saved progress remain in place.

## Build 0.9
- Added optional, gentle ambient tones that change by location: lobby, corridor and Room 11.
- Added a volume slider; sound enablement and volume preference are saved locally.
- Ambient sound starts only after sound is enabled, and scene changes blend smoothly.
- Ambient audio is synthesized with the Web Audio API; no external audio files are required.

## Build 0.8
- Added optional sound effects generated with the Web Audio API: clue discovery, location transitions, Room 11 door reveal and photograph inspection.
- Added an Arabic/English sound toggle; sound is off unless enabled by the player and the preference is saved locally.
- No external audio files or downloads are required.

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
