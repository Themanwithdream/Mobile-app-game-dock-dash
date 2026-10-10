# Dock Boss — Open Roads

A phone-friendly pixel-art delivery adventure. One parcel. 183 places. Wait for the loading zone, match the parcel colour and shape, and tap its truck.

## Play

https://themanwithdream.github.io/Mobile-app-game-dock-dash/index.html?v=8.4-restaurants

Previously Dock Dash and Parcel Odyssey. The repository and play URL stay in place so existing browser progress carries over.

## Restaurant Row — 8.4

Four new places bring the game to **183 places, 1,464 missions and 4,392 stars**: Courtyard Pizzeria, Lantern Ramen House, Jade Steam Dim Sum and River Garden Bistro. Each has an individual painting, eight authored story missions, twelve named supplies and an optional arcade venue. Choose Restaurant Row in the mission map to visit all four; their opening missions are free. Their IDs append after the sky routes, preserving existing progress and purchases.

The collection now has three evenly sized navigation buttons with readable labels. Native menu grids override the old positioned control widths, including mission and shop pagination. A full-width cargo category dropdown jumps directly to any collection, with at least 44-pixel touch targets and 16-pixel form text. See [restaurant art direction](assets/worlds/open-roads/RESTAURANT-ARTWORK.md) for the generation prompts and runtime asset paths.

## Sky & Space — 8.3

Two new places, **Bifröst Skyport** and **Lunar Cargo Base**, bring the game to **179 places, 1,432 missions and 4,296 stars**. Each adds eight authored story missions, twelve named supplies, an individual painting and an optional arcade venue. The Sky & Space filter reaches both routes, and every first mission is free. Existing mission, cargo, location and save IDs stay in place.

Asgard now shows a golden palace, rainbow bridge and cascading waterfalls inspired by the supplied reference. Air Cargo Hub has a dedicated wide scenic picture on the home screen; other selected places show their own painting rather than a cropped gameplay floor. The home count follows the mission data.

The home menu, its shop and settings, and the mission map use **Runway Rush**, Air Cargo Hub’s music. Starting arcade or a story mission restores that place’s theme. Saved mute, music and volume settings still apply, with playback recovering on the first tap if required by the browser.

The new scene PNGs stay at 360 × 640 and below 240 KB. Their card previews keep the existing request and decode limits. The separate Air Cargo Hub home image is released when leaving home. The two original embedded game-floor PNGs now load as identical separate assets, reducing the startup HTML from 728 KB to 267 KB. Harbour Depot keeps its procedural home preview. See [art direction](assets/worlds/open-roads/SKY-ARTWORK.md) and [the full route list](missions/OPEN-ROADS.md).

## Phone Edition — 8.2

Home, missions, the shop, cargo and results now use native text and flexible layouts instead of scaling their controls with the game canvas. Controls have at least 44-pixel tap targets, place names wrap, and long collections scroll. Portrait menus use the available safe area; landscape play places large matching truck controls on both sides of the delivery belt. The install manifest now allows either orientation.

The visual viewport keeps searches usable above phone keyboards. Rotating, leaving the page and returning from a cached page pause the current run without consuming parcels or mission time. Stories have an independently scrolling body and an always-reachable Close button. Existing stories, artwork, music, purchases, save IDs and gameplay timing are preserved.

Full artwork now has a two-request download queue with four waiting slots; a newly selected place takes priority. Native place cards reuse the existing compact previews and bounded caches. Failed artwork can retry when the connection returns.

`tests/phone-layout.test.cjs` checks safe-area geometry, keyboard sizing and bounded artwork loading. The Phone quality workflow runs unit checks, real emulated phone gestures, gameplay timing/performance and mission details. [The manual phone layout check](tools/phone-preview.html) provides small, large, landscape and keyboard-space views. Browser emulation does not replace testing on physical phones.

## Illustrated places — 8.1

All 77 Open Roads places now have individually generated, detailed pixel-art paintings to match the original worlds. This release recovers 74 completed paintings from the interrupted artwork session and finishes the Flower Auction Hall, Cold Store Commons and Neighbourhood Repair Fair. Every place retains its own architecture, terrain, supplies and story; all backgrounds keep a clear central delivery lane and lower loading apron.

The 360 × 640 indexed PNGs total 14,114,196 bytes, with every scene below the original 240 KB per-world budget. The 77 refreshed WebP previews total 2,777,054 bytes; cards keep the same four-request and eight-image cache limits, and gameplay keeps its four-image decode limit. Versioned requests for the replaced paintings and previews prevent returning players from retaining the earlier simple scenes. No original painting, music file, story, mission ID, cargo ID, purchase or save key changes.

See [the artwork recovery record](assets/worlds/open-roads/ARTWORK.md). The earlier 8.0 artwork generator is retained for historical reference only; running it would replace these finished paintings. Regenerate previews with `python tools/build-previews.py` after an intentional artwork replacement.

## Open Roads expansion — 8.0

77 grounded places extend the original 100 to **177 places, 1,416 missions and 4,248 stars**. All twenty requested subjects are included, from Asgard’s restored heritage citadel to the hospital supply rooms. There are no magical characters, powers or surreal settings in the additions. Asgard, World Tree, Frost Giant Fortress, Dwarven Forge and Atlantis retain their requested names as ordinary heritage, conservation, workshop and coastal research places.

Each new place has eight authored delivery chapters, twelve named cargo items and an exclusive 360 × 640 pixel scene. A **New Places** mission filter reaches all 77 routes; eight local chapters organise them. First missions are free, and arcade versions are optional coin purchases. The original 100-place story and its ending remain independent of the new route log. See [all 77 places and story hooks](missions/OPEN-ROADS.md).

The additions bring the cargo catalogue to **2,424 items** and the arcade list to **180 places**. Existing mission IDs, cargo IDs 0–1499, locations 0–102, vehicle slots, purchase prices, wallet balances and storage keys are preserved. Existing Dock Boss, Parcel Odyssey and Dock Dash backups remain readable; new backups keep the same portable format and include old and new progress together. Backup previews show restored lanterns and completed new routes separately.

The initial 8.0 artwork was painted offline by `tools/build-open-roads-art.py`, using individually authored terrain, architecture and workshop plans. No old images are changed. Those initial 77 full scenes totalled about 1 MB and use the existing four-image decode budget. Card previews remain bounded to four requests and eight cached images. The new places reuse matching complete recordings from the original soundtrack library, retaining the first-tap autoplay recovery and sound effects. Music titles now cover every route, including the previously missing original-world labels.

Open Roads verification: **134 unit checks and 218 browser checks across 19 suites** pass, including all 1,416 missions at three stars, native browsing of all 77 additions, five viewport layouts, original and new completion logs, saved purchases, 20-minute phone simulation, sound and autoplay recovery, and exact older-backup restore/undo. The 77 additional full scenes total 1,015,441 bytes; their card previews total 767,880 bytes. No existing artwork or music recording is replaced.

## Dock Boss foundation — 7.1

- A gold Dock Boss badge in mission and shop headers, a larger gold home title, current install metadata and game-link previews.
- A clearer missed-parcel alert and a combined final-miss/result cue that survives the end of a run.
- Music attempts to start when opened, recovers on the first tap when required by the browser, and respects saved mute, music and volume preferences.
- Small previews of all 100 original worlds warm the mission map before opening. Four concurrent preview requests, an eight-image cache and a separate four-image full-art cache keep phone browsing bounded.
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

The original 100 worlds each have an original synthesized 32-bar instrumental score; Open Roads reuses matching recordings from this library. Shared chapter melodies receive distinct phrase arrangements, transpositions and answers. Circular note tails and the buffered audio player preserve continuous loop joins.

The sound-effect set combines rounded parcel thumps, filtered paper/engine textures and short wood/bell tones. Twenty-six cue variants prepare one at a time during idle periods, using less than 1 MB of mono PCM. Playback reuses per-context buffers on the same audio clock as music. Four active voices and two brief retiring voices have a shared gain budget; rapid duplicate taps cannot accumulate sources. Perfect hits use a single combined cue. Pause, mute, Home, page exit and phone interruptions cancel old feedback while retaining the cached samples. The existing independent Effects and Music switches remain available under Routes & audio. `tests/sound-effects.test.cjs` and `tests/sound-effects.browser.cjs` cover edge silence, mix headroom, cached playback, input bursts, native event bindings and context recovery.

## Save compatibility and performance

Existing cargo IDs, vehicle slots and location indices stay stable. The retired world's eight star records, venue, three vehicle purchases and parcel wrap translate to their original replacements without changing coins or spending. The save keys remain unchanged.

Cargo artwork is generated lazily in a 144-entry cache. Scenery downloads are lazy, deduplicated by source and bounded to four decoded full images and eight small preview images, with two full-resolution floors and seven small previews. Existing gameplay sprite, popup, particle and audio budgets remain bounded. A phone retains one decoded music player. Physical-device performance still depends on the browser and hardware.

## Development

The game is static HTML, JavaScript, PNG and MP3; no bundler or server dependency is required. Run `python -m http.server` locally. Pure rules live in `missions/`, `economy/`, `engine/` and `audio/`. Browser test hooks are injected only into temporary test responses.

Run unit checks with `node --test tests/*.test.cjs`. Playwright browser suites cover mission completion, native navigation, save migration, audio loops, shop transactions, canvas budgets and phone layouts. The soundtrack composer needs NumPy, SciPy, Node and FFmpeg: `python audio/compose-missions.py --lanterns-only` regenerates the new world pack and Beacon Bay score.

The Dock Boss completion release passes 127 unit checks and 209 browser checks across 18 suites, including all 800 missions at three stars. Coverage includes five viewport layouts, permitted and blocked autoplay, normal and final missed parcels, slow/failed preview requests, native touch navigation and exact legacy-save restore/undo. First-page mission previews total 110,262 bytes instead of 1,834,864 bytes of original paintings (94% less); all 100 previews total 3,253,356 bytes instead of 20,757,395 bytes (84% less). Browser checks emulate phones; physical-device performance depends on the browser and hardware.

## Finding worlds and shop items

The home screen now gives Arcade and Missions their own full-width mode cards. Mission search finds world names and themes within the selected chapter, with visible star progress on every card. Shop search combines with category and Owned filters, remembers the browsing page when cleared, and shows the coin gap or remaining deliveries for locked items. Escape clears a focused search; Enter dismisses the keyboard. All 100 backgrounds, the sorting rules, countdowns, coins and saved progression remain compatible.

Menu navigation and searching are covered by `tests/interface.browser.cjs` alongside the existing design, shop, mission, mobile and engine suites.

## Routes and audio

Route descriptions now wrap naturally beside their existing pixel-art previews, with separate cargo labels and an explicit selected state. The coloured preview underlines are removed. Search finds owned place names and themes across all 180 arcade places; a clear action recovers empty results. **Shop places** opens the arcade-place category and returns to the updated route list after a purchase. Shopping from a paused mission preserves its score, timer, parcels and mission soundtrack.

The scrollable panel has 44-pixel controls, an **Audio** shortcut, independent Music and Effects switches, accessible music volume, an explanation of Tour mode and the existing Visuals & saves dialog. A fixed Back button names its destination: Home, Results or the paused game. The three native preview canvases reuse the existing bounded image cache. `tests/routes.browser.cjs` checks search, purchases, native phone scrolling, paused-run preservation and five viewport layouts. Save fields and gameplay rules stay compatible.

## Mission details and fleet artwork

Mission briefings use native text and a touch-scrollable panel with separate, fixed Start and Mission map controls. Package, priority and time goals come first. The Levels shortcut reaches all eight levels, showing their unlock state and earned stars; choosing a new level returns to its objectives. Supply illustrations, story text and expandable star goals remain readable on smaller screens. Completion rewards reflect the player's previous stars, and replay keeps the original countdown and equipment.

All 37 fleets have detailed original pixel artwork, including passenger windows on buses, emergency equipment, larger off-road wheels and distinct space vehicles. Every fleet retains all four colour/shape sorting plates. Art is painted once into the existing lazy sprite cache; no new image downloads are needed. `tests/mission-design.browser.cjs` covers touch and keyboard scrolling, all 1,416 mission texts, five viewport layouts and the 148 sorting plates.

## Themed mission challenges

Worlds now choose an appropriate arrival pattern instead of sharing only the difficulty template. Sports alternate team deliveries and introduce gentle, announced rushes from level two. Historical merchants arrive in three-parcel convoys. Construction loads come in pairs, with short crane lifts that pause both the belt and mission timer. Water and sky routes ease between calm and faster crossings. Schools and workshops begin each cargo set with the three priority supplies. Woodland routes follow repeating colour-and-shape trails.

The existing eight levels, package goals, star rules, unlocks, rewards and save IDs remain compatible. Gold still fits any open truck. Pace changes ease in gradually, and the first mission keeps a steady belt while players learn the route. All 1,416 missions are covered by the complete gameplay check.

## Visual effects and portable saves

Open **Routes & audio → Visuals & saves**. Auto simplifies decoration after sustained slow frames; Reduced removes decorative particles, sway and screen shake and caps drawing at 60 frames per second. The simulation continues at the same 120 steps per second. Full preserves the decorative effects, and every mode respects the device's Reduce Motion setting. Music and sorting rules are unchanged.

**Save backup** creates a JSON file containing the current coins, purchased items, equipped truck and styles, arcade place, settings, cargo collection, mission records and arcade best. Supported phones can save through their share sheet; other browsers download the file. On another phone, choose the file, compare its progress with the current save, then press Restore. Restore returns Home and keeps the previous progress for **Undo last restore**, including after a reload. Only the latest restore has an undo copy. Keep the exported file outside the browser to recover from clearing browser data.

Files are checked before any progress changes. A restore journal recovers interrupted writes before startup; failed writes roll back, and unrelated browser-storage keys are never imported. `tests/save-backup.test.cjs`, `tests/world-challenges.test.cjs` and `tests/journey-upgrade.browser.cjs` cover damaged files, storage failures, exact restores, native file selection, touch scrolling, five layouts, all challenge patterns and a twenty-minute simulated mobile session with bounded caches.

New backups use `dock-boss-backup-YYYY-MM-DD.json` and the Dock Boss name. Previous Dock Dash and Parcel Odyssey backups remain readable with their original checksums, and every browser-storage key stays unchanged. Rebranding never resets coins, purchases, stars or collected cargo.

`tests/release.browser.cjs` covers current install and sharing metadata, saved progress, touch scrolling, five help layouts, sharing cancellation and fallbacks, optional practice, and an authentic previous-version backup fixture.

Mission previews retain each original painting and location ID. `tools/build-previews.py` creates 360×180 WebP crops for the existing mission-card and briefing-hero framing; `assets/previews/manifest.json` records source and preview hashes. The map fetches these crops instead of full paintings, promotes selected requests and warms only the following page during idle time. Failed previews fall back to the original artwork. Full backgrounds still load for actual missions and taller route/shop previews.
