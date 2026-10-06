# Dock Dash — The Hundred Lanterns

A phone-friendly pixel-art sorting game: wait for the loading zone, match the parcel colour and shape, and tap its truck.

## Play

https://themanwithdream.github.io/Mobile-app-game-dock-dash/index.html?v=6.0-hundred-lanterns

## This release

- 100 playable story worlds, eight increasingly demanding missions each: 800 missions and 2,400 stars.
- A connected original story, The Hundred Lanterns, with a readable journal and a lantern restored by each world's final mission.
- Eight new chapters: Greenwood, Tidebound, Sky Roads, Wild Heart, Clockwork, Hearthside, Echoes and Starlight.
- Greenwood follows Rowan, an apprentice archer reopening medieval forest routes with food, tools, bows and rope bridges.
- Beacon Bay and its lighthouse keepers replace the retired licensed-character world and vehicles.
- 1,500 cargo identities, 37 trucks, 103 arcade places and 19 independent parcel/dock styles.
- Every world's first mission is free. Earned coins buy permanent vehicles, cosmetic styles and endless arcade places; there are no real-money purchases.
- A three-second countdown, explicit Home controls, saved progress and the existing gapless audio engine.

## Original art and music

Seventeen new pixel-art environment plates combine with native landmarks and cargo set dressing. The 77 appended worlds use sixteen reusable biome plates; Beacon Bay has a separate replacement plate. These are distinct authored missions, supply lists and story arcs, rather than 77 independently downloaded large backdrops. See [artwork provenance and exact prompts](assets/worlds/HUNDRED-LANTERNS-ARTWORK.md). Native icons and vehicles extend the existing canvas renderer.

Every world has its own original synthesized 32-bar instrumental score. Shared chapter melodies receive distinct phrase arrangements, transpositions and answers. Circular note tails and the buffered audio player preserve continuous loop joins.

## Save compatibility and performance

Existing cargo IDs, vehicle slots and location indices stay stable. The retired world's eight star records, venue, three vehicle purchases and parcel wrap translate to their original replacements without changing coins or spending. The save keys remain unchanged.

Cargo artwork is generated lazily in a 144-entry cache. Scenery downloads are lazy, deduplicated by source and bounded to twelve decoded images, with two full-resolution floors and seven small previews. Existing gameplay sprite, popup, particle and audio budgets remain bounded. A phone retains one decoded music player. Physical-device performance still depends on the browser and hardware.

## Development

The game is static HTML, JavaScript, PNG and MP3; no bundler or server dependency is required. Run `python -m http.server` locally. Pure rules live in `missions/`, `economy/`, `engine/` and `audio/`. Browser test hooks are injected only into temporary test responses.

Run unit checks with `node --test tests/*.test.cjs`. Playwright browser suites cover mission completion, native navigation, save migration, audio loops, shop transactions, canvas budgets and phone layouts. The soundtrack composer needs NumPy, SciPy, Node and FFmpeg: `python audio/compose-missions.py --lanterns-only` regenerates the new world pack and Beacon Bay score.
