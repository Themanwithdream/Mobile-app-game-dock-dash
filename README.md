# Dock Dash — Cargo Worlds

A mobile-first warehouse sorting arcade in one self-contained HTML game.

## Play

Wait for the ringed parcel to reach the green loading zone. Tap its matching
truck or use keys 1–4. The original red circle, blue square, green triangle and
yellow diamond remain the sorting rules, regardless of the product pictured.
Golden star parcels fit any unlocked truck. The bright stripe earns a perfect
bonus. Pause with P or Escape.

## Cargo Worlds update

- 300 named products in 25 categories, including PlayStation 5, running shoes,
  spiral notebooks, cameras, groceries, tools and toys.
- Product illustrations rendered in canvas, with the sorting sticker drawn on
  top so it stays visible. No image downloads or third-party runtime libraries.
- Cargo Collection: browse all products, filter by category, and track unique
  products delivered correctly. Tutorial loads do not affect collection records.
- Warehouse, Harbour depot and Air cargo hub locations; Tour mode changes the
  location every two shifts. Scenery does not change sorting rules or difficulty.
- Original synthesized music with bass, melody, chords and percussion. Each
  location has its own arrangement; hot streaks add energy. Audio begins after
  user interaction and pauses when the game pauses or the page is hidden.
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

47 core-game checks and 35 Cargo Worlds checks pass. Coverage includes a
100-delivery run reaching shift 9, scoring and lives, touch and keyboard input,
all product pages, settings persistence, mobile sizing, actual music signal,
pause/mute behavior, and unavailable localStorage.

Higgsfield generation was attempted for location artwork but the connected
account required a Basic plan. This release uses procedural canvas scenery and
WebAudio music; it does not claim to contain Higgsfield-generated artwork/audio.

Version: 3.0-cargo-worlds.
