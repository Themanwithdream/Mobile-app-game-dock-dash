# Parcel Odyssey — The Hundred Lanterns

A phone-friendly pixel-art delivery adventure. One parcel. A hundred worlds. Wait for the loading zone, match the parcel colour and shape, and tap its truck.

## Play

https://themanwithdream.github.io/Mobile-app-game-dock-dash/index.html?v=7.0-parcel-odyssey

Formerly Dock Dash. The repository and play URL stay in place so existing browser progress carries over.

## This release

- Consistent Parcel Odyssey branding, a two-line title, current install metadata and game-link previews.
- A readable How to play & share panel, optional three-step practice, native sharing and copy-link fallback.
- 100 playable story worlds, eight increasingly demanding missions each: 800 missions and 2,400 stars.
- A connected original story, The Hundred Lanterns, with a readable journal and a lantern restored by each world's final mission.
- Eight new chapters: Greenwood, Tidebound, Sky Roads, Wild Heart, Clockwork, Hearthside, Echoes and Starlight.
- Greenwood follows Rowan, an apprentice archer reopening medieval forest routes with food, tools, bows and rope bridges.
- Beacon Bay and its lighthouse keepers replace the retired licensed-character world and vehicles.
- 1,500 cargo identities, 37 trucks, 103 arcade places and 19 independent parcel/dock styles.
- Every world's first mission is free. Earned coins buy permanent vehicles, cosmetic styles and endless arcade places; there are no real-money purchases.
- A three-second countdown, explicit Home controls, saved progress and the existing gapless audio engine.
- Six themed mission patterns: match rushes, merchant convoys, crane relays, tide crossings, supply sets and trail markers.
- Auto, Reduced and Full visual-effects settings, plus portable save files with preview, restore and undo.
- Refined guitar cargo: a wood acoustic body, electric pickups, a smaller four-string ukulele, a fitted case and a separate string pack. All five keep their existing identities and cached sorting stickers.
- Original layered sound effects for parcels, perfect timing, golden cargo, truck departures, countdowns, purchases and mission results. Four musical delivery tiers reward longer streaks.
- Redesigned Routes & audio: readable native place cards without decorative underlines, owned-place search, a direct place-shop shortcut, grouped audio controls and a fixed context-aware Back button.

## Original art and music

All 100 story worlds have exclusive pixel-art environment images, each with its own architecture, terrain and landmarks. The newer chapters now use 77 separate place images: 16 existing paintings assigned to one matching world each and 61 new illustrations. No two worlds share a backdrop URL or identical image bytes. See [individual artwork and exact prompts](assets/worlds/INDIVIDUAL-WORLDS-ARTWORK.md). Native icons and vehicles extend the existing canvas renderer.

Every world has its own original synthesized 32-bar instrumental score. Shared chapter melodies receive distinct phrase arrangements, transpositions and answers. Circular note tails and the buffered audio player preserve continuous loop joins.

The sound-effect set combines rounded parcel thumps, filtered paper/engine textures and short wood/bell tones. Twenty-five cue variants prepare one at a time during idle periods, using less than 1 MB of mono PCM. Playback reuses per-context buffers on the same audio clock as music. Four active voices and two brief retiring voices have a shared gain budget; rapid duplicate taps cannot accumulate sources. Perfect hits use a single combined cue. Pause, mute, Home, page exit and phone interruptions cancel old feedback while retaining the cached samples. The existing independent Effects and Music switches remain available under Routes & audio. `tests/sound-effects.test.cjs` and `tests/sound-effects.browser.cjs` cover edge silence, mix headroom, cached playback, input bursts, native event bindings and context recovery.

## Save compatibility and performance

Existing cargo IDs, vehicle slots and location indices stay stable. The retired world's eight star records, venue, three vehicle purchases and parcel wrap translate to their original replacements without changing coins or spending. The save keys remain unchanged.

Cargo artwork is generated lazily in a 144-entry cache. Scenery downloads are lazy, deduplicated by source and bounded to twelve decoded images, with two full-resolution floors and seven small previews. Existing gameplay sprite, popup, particle and audio budgets remain bounded. A phone retains one decoded music player. Physical-device performance still depends on the browser and hardware.

## Development

The game is static HTML, JavaScript, PNG and MP3; no bundler or server dependency is required. Run `python -m http.server` locally. Pure rules live in `missions/`, `economy/`, `engine/` and `audio/`. Browser test hooks are injected only into temporary test responses.

Run unit checks with `node --test tests/*.test.cjs`. Playwright browser suites cover mission completion, native navigation, save migration, audio loops, shop transactions, canvas budgets and phone layouts. The soundtrack composer needs NumPy, SciPy, Node and FFmpeg: `python audio/compose-missions.py --lanterns-only` regenerates the new world pack and Beacon Bay score.

## Finding worlds and shop items

The home screen now gives Arcade and Missions their own full-width mode cards. Mission search finds world names and themes within the selected chapter, with visible star progress on every card. Shop search combines with category and Owned filters, remembers the browsing page when cleared, and shows the coin gap or remaining deliveries for locked items. Escape clears a focused search; Enter dismisses the keyboard. All 100 backgrounds, the sorting rules, countdowns, coins and saved progression remain compatible.

Menu navigation and searching are covered by `tests/interface.browser.cjs` alongside the existing design, shop, mission, mobile and engine suites.

## Routes and audio

Route descriptions now wrap naturally beside their existing pixel-art previews, with separate cargo labels and an explicit selected state. The coloured preview underlines are removed. Search finds owned place names and themes across all 103 arcade places; a clear action recovers empty results. **Shop places** opens the arcade-place category and returns to the updated route list after a purchase. Shopping from a paused mission preserves its score, timer, parcels and mission soundtrack.

The scrollable panel has 44-pixel controls, an **Audio** shortcut, independent Music and Effects switches, accessible music volume, an explanation of Tour mode and the existing Visuals & saves dialog. A fixed Back button names its destination: Home, Results or the paused game. The three native preview canvases reuse the existing bounded image cache. `tests/routes.browser.cjs` checks search, purchases, native phone scrolling, paused-run preservation and five viewport layouts. Save fields and gameplay rules stay compatible.

## Mission details and fleet artwork

Mission briefings use native text and a touch-scrollable panel with separate, fixed Start and Mission map controls. Package, priority and time goals come first. The Levels shortcut reaches all eight levels, showing their unlock state and earned stars; choosing a new level returns to its objectives. Supply illustrations, story text and expandable star goals remain readable on smaller screens. Completion rewards reflect the player's previous stars, and replay keeps the original countdown and equipment.

All 37 fleets have detailed original pixel artwork, including passenger windows on buses, emergency equipment, larger off-road wheels and distinct space vehicles. Every fleet retains all four colour/shape sorting plates. Art is painted once into the existing lazy sprite cache; no new image downloads are needed. `tests/mission-design.browser.cjs` covers touch and keyboard scrolling, all 800 mission texts, five viewport layouts and the 148 sorting plates.

## Themed mission challenges

Worlds now choose an appropriate arrival pattern instead of sharing only the difficulty template. Sports alternate team deliveries and introduce gentle, announced rushes from level two. Historical merchants arrive in three-parcel convoys. Construction loads come in pairs, with short crane lifts that pause both the belt and mission timer. Water and sky routes ease between calm and faster crossings. Schools and workshops begin each cargo set with the three priority supplies. Woodland routes follow repeating colour-and-shape trails.

The existing eight levels, package goals, star rules, unlocks, rewards and save IDs remain compatible. Gold still fits any open truck. Pace changes ease in gradually, and the first mission keeps a steady belt while players learn the route. All 800 missions are covered by the complete gameplay check.

## Visual effects and portable saves

Open **Routes & audio → Visuals & saves**. Auto simplifies decoration after sustained slow frames; Reduced removes decorative particles, sway and screen shake and caps drawing at 60 frames per second. The simulation continues at the same 120 steps per second. Full preserves the decorative effects, and every mode respects the device's Reduce Motion setting. Music and sorting rules are unchanged.

**Save backup** creates a JSON file containing the current coins, purchased items, equipped truck and styles, arcade place, settings, cargo collection, mission records and arcade best. Supported phones can save through their share sheet; other browsers download the file. On another phone, choose the file, compare its progress with the current save, then press Restore. Restore returns Home and keeps the previous progress for **Undo last restore**, including after a reload. Only the latest restore has an undo copy. Keep the exported file outside the browser to recover from clearing browser data.

Files are checked before any progress changes. A restore journal recovers interrupted writes before startup; failed writes roll back, and unrelated browser-storage keys are never imported. `tests/save-backup.test.cjs`, `tests/world-challenges.test.cjs` and `tests/journey-upgrade.browser.cjs` cover damaged files, storage failures, exact restores, native file selection, touch scrolling, five layouts, all challenge patterns and a twenty-minute simulated mobile session with bounded caches.

New backups use `parcel-odyssey-backup-YYYY-MM-DD.json` and the Parcel Odyssey name. Previous Dock Dash backups remain readable with their original checksum, and every browser-storage key stays unchanged. Rebranding never resets coins, purchases, stars or collected cargo.

`tests/release.browser.cjs` covers current install and sharing metadata, saved progress, touch scrolling, five help layouts, sharing cancellation and fallbacks, optional practice, and an authentic previous-version backup fixture.
