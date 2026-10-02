# Dock Dash — Route Soundtracks

A mobile-first warehouse sorting arcade with bundled artwork and route soundtracks.

## Play

Wait for the ringed parcel to reach the green loading zone. Tap its matching
truck or use keys 1–4. The original red circle, blue square, green triangle and
yellow diamond remain the sorting rules, regardless of the product pictured.
Golden star parcels fit any unlocked truck. The bright stripe earns a perfect
bonus. Pause with P or Escape.

## Route Soundtracks update

- Three new instrumental themes generated with ElevenLabs Music v2, then edited
  and mastered for the game: **Warehouse Groove** (69 seconds), **Harbour Breeze**
  (76 seconds), and **Runway Rush** (64 seconds). These replace the previous
  8–10 second loops with fuller melodies, chord changes and musical variation.
- The warehouse uses an electro-funk groove, the harbour has a warm electronic
  theme, and the airport has a driving arcade synth theme.
- Ending and opening bars are blended for smoother loop joins. All three tracks
  are mastered to consistent loudness with headroom for the game's sound effects.
- Route changes crossfade using two media players. The outgoing player stops
  after the transition; rapid route changes and delayed playback requests cannot
  restart a muted or paused soundtrack. Devices with read-only media volume use
  one player and a direct handoff instead of overlapping songs.
- Native media playback and transition timers remain independent of canvas
  animation. Existing touch/keyboard activation, pause/resume, hidden-page
  handling, retry after blocked playback, music toggles and saved settings remain.
- Tracks are in `audio/` and load only when needed. Ship the entire repository
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
- Music volume, music/effects switches, pause, hot-streak tempo and route changes
  all work with the new playback path. Existing scores and settings are preserved.

## Cargo Worlds features

- 300 named products in 25 categories, including PlayStation 5, running shoes,
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

Run the 13 soundtrack regression tests with:

```sh
node --test tests/route-music.test.cjs
```

They cover synchronous gesture activation, loading and crossfading, rapid route
changes, stale promises after mute, pause during transitions, resume position,
blocked playback and retry, failed assets, read-only volume, zero volume,
pitch-preserving hot-streak tempo, hidden pages and repeated input.

Playback is also checked in touch-enabled Chromium with autoplay restrictions:
actual MP3 decoding and nonzero stereo audio, saved progress, pause/resume,
route transitions independent of canvas frames, volume and music/effects
controls, native looping, hidden-page recovery, blocked playback retry, and
simulated read-only volume without WebAudio. Physical iPhone hardware was not
available for testing.

The warehouse and airport artwork remains embedded in the HTML. Music generation
is a development step; the installed game never contacts a generation service.

Version: 3.2-route-soundtracks.
