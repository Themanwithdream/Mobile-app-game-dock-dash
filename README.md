# Dock Dash — Pixel Routes

A mobile-first warehouse sorting arcade in one self-contained HTML game.

## Play

Wait for the ringed parcel to reach the green loading zone. Tap its matching
truck or use keys 1–4. The original red circle, blue square, green triangle and
yellow diamond remain the sorting rules, regardless of the product pictured.
Golden star parcels fit any unlocked truck. The bright stripe earns a perfect
bonus. Pause with P or Escape.

## Pixel Routes update

- Original generated pixel art for the Warehouse and Air cargo hub. The warehouse
  has stocked shelves, pallets, work lights and forklifts. The airport has a
  cargo freighter, loading equipment, baggage carts and apron lights.
- Pixel scenery is pre-rendered with nearest-neighbour sampling. The HUD and
  sorting stickers stay clear above the artwork. Both scenes are embedded in
  the HTML, so they need no image downloads.
- Three original music arrangements are embedded as compact MP3 loops. Music
  starts directly from a touch or keyboard action and uses the phone's media
  playback path. It continues independently of the canvas animation loop.
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

The game code has no runtime network dependencies. This release does not include
a service worker, so offline reopening of the hosted Home Screen app is not
guaranteed. Browser storage may also be cleared by the device or user.

## Validation

The 47 core-game checks pass, including a 100-delivery run reaching shift 9,
scoring, lives, touch and keyboard input, mobile sizing, saved records and denied
localStorage. Dedicated Pixel Routes checks cover image decoding and pixel
sampling, touch-authorized media playback, nonzero decoded audio, looping,
volume, independent effects, pause/resume, hidden pages, blocked play requests,
simulated interrupted Safari audio contexts, and music without WebAudio support.
The Home Screen manifest, launch scope and all icons also load from a subfolder.

Playback was verified in a touch-enabled Chromium browser with autoplay
restrictions. Safari interruption states were simulated; physical iPhone
hardware was not available for testing.

Higgsfield artwork generation was attempted but the connected account required
an upgraded plan. The warehouse and airport artwork were created with the
built-in image generator, then compressed and embedded. The game has no runtime
image-generation or external library dependency.

Version: 3.1-pixel-routes.
