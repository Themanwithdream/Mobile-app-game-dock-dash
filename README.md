# Dock Dash — Your Fleet, Your World

A mobile-first parcel sorting arcade with 420 products, 30 missions in 10 worlds,
20 collectible vehicles, 13 arcade places, nine parcel/dock styles, earned coins
and 13 original soundtracks.

## Play

Wait for the ringed parcel to reach the green loading zone. Tap its matching
truck or use keys 1–4. The original red circle, blue square, green triangle and
yellow diamond remain the sorting rules, regardless of the product pictured.
Golden star parcels fit any unlocked truck. The bright stripe earns a perfect
bonus. Pause with P or Escape.

## Expanded Dock Shop

The shop has three paged categories: Trucks, Arcade Places and Style. Purchases
are permanent and also equip the item. Vehicles, arcade places, parcel wraps and
loading-zone styles are independent choices. Existing balances, ownership and
delivery rewards retain their original IDs and prices.

| New special edition | Coins | Native canvas details |
|---|---:|---|
| Batmobile | 900 | Swept wings, rear jet and an angular nose |
| Tumbler | 1,200 | Armour panels and six large tyres |
| Fire Engine | 600 | Roof ladder and emergency lights |
| Ice Cream Van | 700 | Striped counter and rooftop cone |
| Monster Truck | 950 | Oversized tyres and an off-road body |
| Moon Rover | 1,400 | Solar panels, satellite dish and six lunar wheels |

The three original arcade routes are included. The ten mission worlds can also
be purchased as **endless arcade places**, each using its own twelve cargo items,
scene and music. Their mission stages remain available independently. Pick a
place in the shop or in Routes & Audio; Tour mode rotates every two shifts
through included and purchased places only, starting at your selected place.

| Arcade place | Coins |
|---|---:|
| Soccer Field / School Campus | 250 each |
| Festival Stage / Candy Factory | 350 each |
| Rescue Harbour | 400 |
| Dino Park | 450 |
| Batcave | 500 |
| Arctic Station | 550 |
| Magic Forest | 650 |
| Moonbase | 750 |

Hero (120), Candy (150), Holo (180) and Star (220) parcel wraps decorate the
original parcel colours beneath the sorting sticker. Neon (200), Starlight (300)
and Golden (450) docks add side rails while retaining the green loading zone and
bright perfect stripe. Classic wraps and docks are included. Practice keeps its
original presentation. All artwork is baked into bounded caches; vehicle art is
built only when needed, and idle shop screens redraw only when invalidated.

`node tests/shop.browser.cjs` verifies native touch purchases across categories,
permanent equipment after reload, failed saves, every themed arcade cargo pool,
owned-only tours, mission route isolation, all special sorting plates, four phone
layouts and cache/rendering limits. The test hooks exist only in local responses.

## Coins and mission worlds

The Dock Shop opens from the home menu and arcade or mission results. The ten
original themed trucks cost earned coins; the four classic designs retain their delivery
unlocks. Buying also equips the truck, and owned trucks can be equipped again for
free. Every truck keeps its dock colour and sorting symbol. Purchases save price
and ownership together; if saving fails, the purchase leaves your coins intact.

| Earn coins | Reward |
|---|---:|
| Correct delivery | 2 |
| Perfect delivery | +1 |
| Golden, fragile or express cargo | +1 |
| Full truck dispatched | 8 |
| Arcade goal / next shift | 15 / 10 |
| Mission completion | 20 / 30 / 40 by stage |
| First clear | +50 / +75 / +100 by stage |
| Each newly earned mission star | +15 |

New players receive a one-time 100-coin welcome gift. Returning players also
receive credit for previous deliveries, perfects, trucks and goals, capped at
3,100 total gift coins. Tutorials, early taps, wrong docks and failed mission
completions award no coins. Correct deliveries already made on an unfinished or
failed run stay earned. Replaying a cleared mission earns its completion and
delivery coins; first-clear and new-star bonuses are awarded only for progress.
Coins, owned trucks and your equipped choice save on this device alongside all
previous stars, cargo, records and settings. Coins are earned by playing.

| New mission world | Cargo and stages | Shop truck |
|---|---|---|
| Batcave | Batman gadgets, batarangs, grappling launchers and utility belts; gadget delivery → Gotham patrol → dark knight express | Bat Courier, 320 coins |
| School Run | Books, pencils, backpacks and science supplies; first bell → art class rush → science fair express | School Bus, 150 coins |
| Dino Park | Eggs, feed, ranger kits and fossils; hatchery helpers → ranger rounds → Jurassic jamboree | Ranger Rover, 500 coins |
| Candy Works | Chocolate, sugar, sprinkles and sweet gifts; morning batch → sugar rush → midnight confection | Sweet Wheels, 420 coins |
| Moonleaf Forest | Potions, spellbooks, crystals and lanterns; lantern trail → potion moonrise → starlight delivery | Moonleaf, 650 coins |
| Arctic Outpost | Parkas, heaters, hot drinks and research gear; warm the camp → aurora rounds → polar night express | Polar Express, 560 coins |

The earlier soccer, festival, rescue and space worlds also have their own shop
trucks: Goal Getter (220), Tour Bus (280), Rescue Runner (360) and Star Hauler
(800). The paged mission map now has 30 missions and 90 stars; every world's first
mission starts open. Three stages per world add a fourth dock, then fragile and
express cargo with a safe pause for the dock shuffle. The 72 new cargo identities
append to the existing IDs, bringing the collection to 420 in 35 categories.

Six matching pixel-art scenes are in `assets/missions/`; final generation prompts
are in [the artwork notes](assets/missions/ARTWORK.md). Six original synthesized
32-bar scores are in `audio/`, with source and metadata alongside them. The extra
world images load when their page or briefing is opened, soundtrack playback
loads only the selected theme, and truck artwork is built as needed. The layered
renderer, bounded caches, deferred delivery saves and steady phone music remain.

The coin unit tests cover migration, legacy rewards, exact purchases, repeated
taps, insufficient coins, ownership persistence, practice exclusion and replay
bonuses. `node tests/economy.browser.cjs` exercises the native touch shop, saved
purchases, failed storage, all mission pages, earned rewards, four phone layouts
and retained rendering/input budgets. Test hooks are injected only in local
test responses.

## Smooth gameplay update

- Parcel, conveyor, flight and truck motion use the remaining fraction of each
  fixed simulation step for smooth drawing between updates. Touch timing uses
  the last displayed parcel position, including the perfect stripe. Early taps
  remain safe. Native dock press feedback and the next canvas frame respond
  without refreshing the entire menu.
- Scenery, HUD labels, goals, cargo cards and stationary trucks live on a separate
  static canvas. Only changing content repaints it. Panel canvases are reused;
  moving parcels, animated trucks and effects draw on the transparent front layer.
- Parcel illustrations and sorting stickers are composed once, with a 96-image
  cache. Truck lights and glows are baked once, score popups are cached, and
  particles are drawn in colour/fade batches. Full-size floor caching holds two
  scenes; the seven menu previews use small 180×320 canvases.
- Gameplay follows refresh rates up to 120 Hz. Sustained slow frames gradually
  reduce the moving layer's pixel resolution with a cooldown. Static artwork and
  small labels retain their full resolution; layout, game speed, deadlines and
  scoring do not depend on that adjustment. Pauses and isolated hitches do not
  accumulate pressure against the next run.
- Deliveries queue the latest cargo and fleet snapshots for an idle save, with a
  one-second timeout and a timer fallback. Pause, home, results, hidden pages and
  page exit flush pending progress. Shift milestones still save immediately.
  Failed storage writes stay pending for a later retry.
- Unchanged viewport resize events avoid canvas allocation and drawing. Rotation
  still fits both layers and rebuilds the static scene at the new size.

The browser regression suites cover touch phones, desktop, all thirty missions,
countdown and pause handling, saved progress, native music and rendering budgets.
Performance measurements use mobile-sized Chromium emulation; physical iPhone
hardware was not available.

A before/after run used a 390×844 touch viewport, DPR 2, 4× CPU throttling,
140 particles, eight score popups, three parcel flights and three departing
trucks. Both releases used the same warmed scene. Frame spacing below is the
median after the first five seconds; the moving layer adapted to DPR 1.5 while
static labels retained DPR 2. Timing depends on the browser and machine.

| Measurement | Previous release | This release |
| --- | ---: | ---: |
| Repeated canvas paths per busy frame | 344 | 23 |
| Median spacing between busy frames | 43.8 ms | 16.7 ms |
| Busy render callback, 95th percentile | 6.6 ms | 2.9 ms |
| Storage writes inside 40 delivery handlers | 83 | 6 |
| Control attribute writes across those deliveries | 860 | 95 |

## Engine and arcade home update

- The pause keyboard hint has its own row beneath the back button and is hidden
  on touch devices, fixing the overlapping text reported on iPhone.
- Arcade results include **Back to home**, alongside replay and the existing
  fleet, audio and collection controls. The short results tap guard applies to
  the new button too. Returning keeps best scores, stars, cargo and fleet data.
- Gameplay now advances in fixed 1/120-second steps. Countdown, parcel positions
  and mission deadlines match at 30, 60 and 120 Hz, including short frame hitches.
- Gameplay rendering follows the display up to 120 FPS and animated menus target 30 FPS. Paused
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

Run the 59 economy, engine, gameplay, mission and soundtrack regression tests with:

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
all thirty missions through three-star completion, real touch countdowns,
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

`node tests/gameplay.browser.cjs` checks static-layer reuse without allocations
or runtime blur, touch timing against the displayed perfect stripe, safe early
taps, deferred saves and lifecycle flushes, fractional rendering without state
changes, adaptive motion resolution with sharp static labels, bounded caches,
all seven small route previews, and a full 140-particle burst. Like the other
browser suites, its hooks are injected into the local test response only.

Version: 5.1-expanded-shop.
