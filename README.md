# Dock Dash — Mission Worlds

A mobile-first parcel sorting arcade with 348 products, themed pixel-art missions,
and seven original soundtracks.

## Play

Wait for the ringed parcel to reach the green loading zone. Tap its matching
truck or use keys 1–4. The original red circle, blue square, green triangle and
yellow diamond remain the sorting rules, regardless of the product pictured.
Golden star parcels fit any unlocked truck. The bright stripe earns a perfect
bonus. Pause with P or Escape.

## Engine and arcade home update

- The pause keyboard hint has its own row beneath the back button and is hidden
  on touch devices, fixing the overlapping text reported on iPhone.
- Arcade results include **Back to home**, alongside replay and the existing
  fleet, audio and collection controls. The short results tap guard applies to
  the new button too. Returning keeps best scores, stars, cargo and fleet data.
- Gameplay now advances in fixed 1/120-second steps. Countdown, parcel positions
  and mission deadlines match at 30, 60 and 120 Hz, including short frame hitches.
- Gameplay rendering targets 60 FPS and animated menus target 30 FPS. Paused
  scenes and static menus paint when their content changes. Hidden pages stop
  drawing through the frame loop. Touch feedback still requests an immediate
  repaint on the next animation callback.
- A frame gap longer than 250 ms pauses active gameplay, protecting lives and
  mission time from a long browser freeze. Resume resets the clock so background
  time cannot rush the conveyor forward.
- The update loop reuses its dock-flash array and calculates particle drag once
  per step, reducing repeated allocation and math during bursts.
- The existing pixel artwork, cargo and music controller remain bundled with
  the game. Publish the new `engine/` folder together with the other assets.

## Phone audio and mission navigation update

- Touch devices use one native music player and a steady playback rate. This
  avoids overlapping MP3 decoders and pitch resampling during hot streaks;
  desktop route changes still crossfade.
- The selected menu theme buffers before the first tap without autoplay. Repeated
  taps and unchanged frames no longer rewrite media volume, rate or pitch flags,
  or schedule identical effects gain automation. Interrupted music still recovers
  from the next touch and resumes its position.
- Duplicate viewport events and phone browser-bar changes reuse the existing
  scene bitmaps. Actual size changes, including rotation, still resize the canvas.
- **Main menu** is available from the mission map, briefing, countdown, running
  mission, pause screen and results. During play the compact button reads
  **← Menu**. Returning clears the current run and restores the chosen arcade
  route; earned stars, delivered cargo and fleet progress stay saved. The
  separate **Mission map** controls still let players browse other challenges.
- The player script has a release-specific URL so cached phone sessions receive
  the updated playback controller when the game reloads.

## Mission Worlds update

Choose **Missions** from the main menu. All four worlds start open; completing a
mission unlocks the next challenge in that world.

| World | Cargo and setting | Soundtrack |
| --- | --- | --- |
| Matchday | Soccer field, ball bundles, jerseys, kits, boots, gloves, cones and trophies | Matchday Anthem, 112 BPM |
| Festival Rush | Festival stage, tickets, speakers, lights, instruments and food | Festival Lights, 104 BPM |
| Ocean Rescue | Coastal station, first-aid cases, life jackets, water and rescue equipment | Rescue Tide, 108 BPM |
| Space Launch | Moonbase, astronaut helmets, oxygen, fuel, solar panels and robots | Orbital Express, 120 BPM |

- Twelve missions, with three challenges per world and 36 stars to earn.
  Deliver the required number of packages **and** priority supplies before the
  deadline. The briefing explains both targets and the next difficulty changes.
- One star for a successful delivery, two with at most one mistake, and three
  for a mistake-free delivery with the displayed perfect-load target.
- The second challenge opens the yellow dock. The final challenge adds fragile
  and express cargo, and shuffles docks after 14 loads with a safe reading pause.
- Every new arcade shift, replay, tutorial, post-tutorial run and mission starts
  with a visible **3, 2, 1** countdown. Input, parcels, timers and scoring wait for
  GO. Pausing or hiding the page freezes the countdown and mission deadline.
- Mission stars, best scores and fastest clear times save separately from the
  arcade record. Replays retain the best of each. Mission deliveries also build
  the existing cargo collection and unlock fleet designs.
- 48 additional illustrated products extend the collection to 348 across 29
  categories. Existing 0–299 product IDs and all prior storage keys are preserved.
- Four matching pixel scenes are in `assets/missions/`. Their generation prompts
  and processing notes are in [the artwork notes](assets/missions/ARTWORK.md).
- Four original, synthesized 32-bar mission scores run 64–74 seconds. Their
  note tails wrap around the loop boundary; all are mastered near −18 LUFS with
  headroom for effects. [Source](audio/compose-missions.py) and
  [track metadata](audio/mission-music.json) are included. The prior three
  ElevenLabs route tracks remain unchanged. The connected ElevenLabs account
  lacked credits for the new request, so no ElevenLabs-generated mission audio
  is claimed or included.

## Route Soundtracks update

- Three new instrumental themes generated with ElevenLabs Music v2, then edited
  and mastered for the game: **Warehouse Groove** (69 seconds), **Harbour Breeze**
  (76 seconds), and **Runway Rush** (64 seconds). These replace the previous
  8–10 second loops with fuller melodies, chord changes and musical variation.
- The warehouse uses an electro-funk groove, the harbour has a warm electronic
  theme, and the airport has a driving arcade synth theme.
- Ending and opening bars are blended for smoother loop joins. All three tracks
  are mastered to consistent loudness with headroom for the game's sound effects.
- Desktop route changes crossfade using two media players. The outgoing player stops
  after the transition; rapid route changes and delayed playback requests cannot
  restart a muted or paused soundtrack. Devices with read-only media volume use
  one player and a direct handoff instead of overlapping songs.
- Native media playback and transition timers remain independent of canvas
  animation. Existing touch/keyboard activation, pause/resume, hidden-page
  handling, retry after blocked playback, music toggles and saved settings remain.
- Tracks are in `audio/`. Only the selected theme is buffered before the first tap; other themes load when selected. Ship the entire repository
  folder together; `index.html` now uses the bundled audio and player files.

## Pixel Routes artwork

- Original generated pixel art for the Warehouse and Air cargo hub. The warehouse
  has stocked shelves, pallets, work lights and forklifts. The airport has a
  cargo freighter, loading equipment, baggage carts and apron lights.
- Pixel scenery is pre-rendered with nearest-neighbour sampling. The HUD and
  sorting stickers stay clear above the artwork. Both scenes are embedded in
  the HTML, so they need no image downloads.
- Returning from another app waits for Resume. Any new touch recovers interrupted
  playback; blocked music shows a Tap for music button. Effects also recover from
  interrupted or closed audio contexts.
- Music volume, music/effects switches, pause, desktop hot-streak tempo and route changes
  all work with the new playback path. Existing scores and settings are preserved.

## Cargo Worlds features

- 348 named products in 29 categories, including PlayStation 5, running shoes,
  spiral notebooks, cameras, groceries, tools and toys.
- Product illustrations rendered in canvas, with the sorting sticker drawn on
  top so it stays visible. No image downloads or third-party runtime libraries.
- Cargo Collection: browse all products, filter by category, and track unique
  products delivered correctly. Tutorial loads do not affect collection records.
- Warehouse, Harbour depot and Air cargo hub locations; Tour mode changes the
  location every two shifts. Scenery does not change sorting rules or difficulty.
- Original music with bass, melody, chords and percussion. Each location has its
  own arrangement; hot streaks add energy. Music pauses with the game or app.
- Saved music/effects toggles, music volume, location and Tour mode preferences.
- Existing best scores, fleet unlocks and tutorial progress remain compatible.

## Home Screen installation

Publish the contents of this repository through GitHub Pages from main / root.
Open the game URL in iPhone Safari, choose Share > Add to Home Screen and enable
Open as Web App if offered. The manifest and supplied icons support the app name,
portrait preference and standalone launch. Some browsers ignore orientation.

The game uses no external runtime libraries, API keys or third-party music
services. Soundtrack files load from the same game folder. This release does not
include a service worker, so offline reopening of the hosted Home Screen app is not
guaranteed. Browser storage may also be cleared by the device or user.

## Validation

Run the 36 engine, mission and soundtrack regression tests with:

```sh
node --test tests/*.test.cjs
```

Mission tests cover unlocking, both objective requirements, deadlines, star
grades, safe storage recovery, replay records and stable cargo IDs. Soundtrack
tests cover synchronous gesture activation, loading and crossfading, rapid route
changes, stale promises after mute, pause during transitions, resume position,
blocked playback and retry, failed assets, read-only volume, zero volume,
pitch-preserving desktop hot-streak tempo, hidden pages, repeated input,
selected-theme buffering, single-player phone handoffs, steady mobile tempo,
interruption recovery and elimination of repeated native media writes.

Playback is also checked in touch-enabled Chromium with autoplay restrictions:
actual MP3 decoding and nonzero stereo audio, saved progress, pause/resume,
route transitions independent of canvas frames, volume and music/effects
controls, native looping, hidden-page recovery, blocked playback retry, and
simulated read-only volume without WebAudio. Physical iPhone hardware was not
available for testing.

The warehouse and airport artwork remains embedded in the HTML. Music generation
is a development step; the installed game never contacts a generation service.

The mission browser suite, `node tests/missions.browser.cjs`, additionally checks
all twelve missions through three-star completion, real touch countdowns,
arcade/replay/tutorial starts, pause/tab handling, scene/music selection,
decoded MP3s, storage reloads, failed missions, retries and existing progress.
It requires Playwright and Chromium; set `DOCK_CHROME` to the browser executable
and `DOCK_TEST_OUTPUT` to a directory for screenshots and the JSON report.
Test hooks are injected into the local test response and are absent from the
published game.

The phone regression suite, `node tests/mobile.browser.cjs`, checks real MP3
playback with one player, steady tempo under repeated touches, interruption
recovery, viewport cache reuse, rotation, all six mission-to-menu paths, saved
stars, mute, desktop crossfades and simulated Safari volume restrictions without
WebAudio. It uses the same Playwright and Chromium environment variables.

The engine tests also verify equivalent elapsed time across frame rates, bounded
catch-up, long-stall recovery, rendering cadence, frozen-screen invalidation,
resume resets and invalid timestamps. `node tests/engine.browser.cjs` checks
actual gameplay timing, four phone layouts, the pause hint, arcade home/replay,
stored progress, content repainting, stalls and hidden-page recovery. Test hooks
and canvas counters are injected only into the local test response.

Version: 4.2-engine-and-home.
