# Open Roads illustrated artwork — 8.1

All 77 replacement scenes are independent image-generation paintings, reduced with nearest-neighbour sampling to 360 × 640 and quantized to 256 colours. The 74 previously generated source paintings were recovered intact on October 9, 2026. Three missing scenes were completed with the built-in image generation tool using Willow Keep and Town Reuse Exchange as style/composition references.

Full paintings: 14,114,196 bytes in total; largest: 209,948 bytes. New card previews: 2,777,054 bytes in total. Central paths and lower aprons stay clear for the existing belt, parcels, trucks and controls. Existing saves, story chapters, IDs, purchases, music and original-world paintings stay unchanged.

The 8.0 `tools/build-open-roads-art.py` is a historical generator of the superseded simple artwork. Do not run it over these finished paintings. Use `tools/import-open-roads-paintings.py` with a source directory to reproduce the final size/palette conversion, then `tools/build-previews.py`. Source hashes are recorded in `manifest.json`; original generated source images are kept separately from the runtime assets.

## Recovered source mapping

| Place asset | Recovered original painting |
| --- | --- |
| `asgard.png` | Golden Citadel Restoration.png |
| `worldtree.png` | Ancient Oak Arboretum at Dawn.png |
| `frostfortress.png` | Snowbound coastal stone fortress.png |
| `dwarvenforge.png` | Dwarven Forge Tool Workshop.png |
| `atlantis.png` | Atlantis Coastal Research Centre.png |
| `cornerburger.png` | Corner Burger Kitchen at Dusk.png |
| `seasideicecream.png` | Sunny Seaside Ice Cream Shop.png |
| `marketbasket.png` | Market Basket Receiving Court.png |
| `civicexchange.png` | Civic Enterprise Courtyard.png |
| `union1954.png` | 1954 Union Station Concourse.png |
| `palacecinema.png` | Palace Picture House Blue Hour.png |
| `fieldcamp.png` | Flood Response Training Camp.png |
| `threadavenue.png` | Thread Avenue Fashion House.png |
| `marketfloor.png` | Historic Market Exchange Courtyard.png |
| `accracoast.png` | Accra Coastal Exchange.png |
| `riversidecollege.png` | Riverside College Workshop Courtyard.png |
| `fourfieldfarm.png` | Four-Field Farm Harvest Path.png |
| `motorcourt.png` | Motor Court Assembly.png |
| `pitstopauto.png` | Neighborhood Pit Stop Auto Shop.png |
| `harbourhospital.png` | Harbour Hospital Supply Courtyard.png |
| `silverfishmarket.png` | Dawn at Silver Quay Market.png |
| `terracevineyard.png` | Sunlit Terrace Vineyard Depot.png |
| `olivecooperative.png` | Olive Cooperative Press Yard.png |
| `roofgreenhouse.png` | Rooftop greenhouse supply court.png |
| `valleycheesery.png` | Valley Cheesery Delivery Lane.png |
| `saltpanworks.png` | Coastal saltworks at sunrise.png |
| `hilltearooms.png` | Misty Hill Tea Processing House.png |
| `riceterracedepot.png` | Rice Terrace Harvest Depot.png |
| `tilemakerscourt.png` | Tilemakers’ Courtyard in Kiln Glow.png |
| `binderylane.png` | Bindery Lane Workshop.png |
| `brassbench.png` | Brass Instrument Repair Yard.png |
| `framearchive.png` | Restored Stone Film Archive.png |
| `clearglassyard.png` | Sunlit clear glass recovery yard.png |
| `silverprintstudio.png` | Silver Print Darkroom Courtyard.png |
| `sailmakersloft.png` | Sailmaker’s Loft Above the Quay.png |
| `loomhall.png` | Afternoon at Loom Hall Cooperative.png |
| `summitcabledepot.png` | Snowy summit cable car depot.png |
| `boxharbour.png` | Box Harbour Container Terminal.png |
| `pedalpostyard.png` | Pedal Post Courier Yard.png |
| `crossriverferry.png` | Crossriver Ferry Terminal.png |
| `medlifthangar.png` | Medlift Support Hangar.png |
| `centralmailworks.png` | Central Mail Sorting Works.png |
| `lockkeepersyard.png` | Lockkeeper’s Supply Yard at Dawn.png |
| `oldtowntramworks.png` | Old Town Tram Restoration Depot.png |
| `reedbedstation.png` | Dawn at the Reedbed Station.png |
| `ridgewindworks.png` | Ridge Wind Service Depot.png |
| `sunpanelrepair.png` | Sunlit Solar Repair Yard.png |
| `riverpowerhouse.png` | Historic River Powerhouse Supply Depot.png |
| `clearwaterplant.png` | Sunlit Clearwater Treatment Works.png |
| `desertweatherpost.png` | Desert Weather Station at Dawn.png |
| `dunecoastproject.png` | Coastal Dune Restoration Depot.png |
| `pineforestrydepot.png` | Pine Ridge Forestry Depot.png |
| `wildlifecareyard.png` | Wildlife care supply courtyard.png |
| `accessworkshop.png` | Accessible Mobility Repair Courtyard.png |
| `cedarfirestation.png` | Cedar Fire Station at Dusk.png |
| `givebloodcentre.png` | Bright Blood Donation Centre.png |
| `smilecourtyard.png` | Mint Courtyard Dental Clinic.png |
| `mapleseniorcentre.png` | Maple Senior Day Centre Courtyard.png |
| `lanepublicpool.png` | Lane Eight Public Pool Courtyard.png |
| `roundhousegym.png` | Roundhouse Youth Gym at Dusk.png |
| `marrakechroofcourt.png` | Marrakech Rooftop Makers’ Court.png |
| `nairobibusworks.png` | Nairobi Bus Works Depot.png |
| `dakarrecordcourt.png` | Dakar Courtyard Recording Studio.png |
| `kyotopaperworks.png` | Kyoto Paper Workshop Courtyard.png |
| `lisbontilequay.png` | Lisbon’s Blue-Tile Restoration Quay.png |
| `valparaisolift.png` | Valparaíso hill lift depot.png |
| `keralaboatyard.png` | Kerala monsoon boatyard.png |
| `montrealwinterhall.png` | Montréal winter market hall.png |
| `courthousearchive.png` | Courthouse Archive, Empty Shelf.png |
| `communitycredit.png` | Community Credit Cooperative Courtyard.png |
| `morningedition.png` | Morning Printworks Courtyard.png |
| `roadrepairdepot.png` | Town Road Repair Depot.png |
| `responsecoordination.png` | Community response training centre.png |
| `reuseexchange.png` | Cheerful Town Reuse Exchange.png |

## Exact prompts for the three completed paintings

### flowerauctionhall

Use case: stylized-concept. Asset type: exclusive portrait pixel-art environment for Dock Boss mobile game. Style: rich detailed hand-pixelled 16-bit game art with crisp visible square pixels, warm tactile tiny props, carefully authored distinct architecture, matching the illustrated style of the supplied reference images. Composition: full-bleed 9:16 portrait, one coherent scene viewed from a steep overhead orthographic camera, wide quiet uninterrupted central delivery path occupying middle 38% from top to bottom; rich storytelling architecture and props along side borders; lower quarter a darker uncluttered loading apron for the game to overlay four trucks; top quiet enough for a HUD. Each scene must have its own unmistakable architecture and landmarks. No text, lettering, logos, watermark, UI, people, actual trucks, magic, monsters, surreal things, no collage or contact sheet. Opaque background. Reference images are style/composition references only; generate an entirely new scene with the following subject: Flower Auction Hall: a Dutch-inspired glass-roofed wholesale flower market at dawn. Long benches of colourful tulips, sunflowers and peonies in clean metal buckets on both side edges, steel greenhouse ribs, green wheeled trolleys, timber crate stacks, packing paper and rolled sleeves. Cool morning blue glass with golden sunlight, wet brick paving, a beautiful clearly empty central receiving aisle. Flower bunches and trolleys remain on the edges, clear lower loading apron.

### coldstorecommons

Use case: stylized-concept. Asset type: exclusive portrait pixel-art environment for Dock Boss mobile game. Style: rich detailed hand-pixelled 16-bit game art with crisp visible square pixels, warm tactile tiny props, carefully authored distinct architecture, matching the illustrated style of the supplied reference images. Composition: full-bleed 9:16 portrait, one coherent scene viewed from a steep overhead orthographic camera, wide quiet uninterrupted central delivery path occupying middle 38% from top to bottom; rich storytelling architecture and props along side borders; lower quarter a darker uncluttered loading apron for the game to overlay four trucks; top quiet enough for a HUD. Each scene must have its own unmistakable architecture and landmarks. No text, lettering, logos, watermark, UI, people, actual trucks, magic, monsters, surreal things, no collage or contact sheet. Opaque background. Reference images are style/composition references only; generate an entirely new scene with the following subject: Cold Store Commons: a public refrigerated storage warehouse with pale blue insulated walls, heavy sliding cooling-room doors on the side edges, stainless shelving with stacked food crates, insulated cases, temperature gauges, maintenance tool cart, amber inspection lamps and readable organisation conveyed by colour panels with no lettering. Icy cyan shadows and warm yellow safety lamps. Wide clear dark blue-gray central receiving corridor and empty lower loading apron. Real practical warehouse, no fantasy ice cavern.

### neighbourrepairfair

Use case: stylized-concept. Asset type: exclusive portrait pixel-art environment for Dock Boss mobile game. Style: rich detailed hand-pixelled 16-bit game art with crisp visible square pixels, warm tactile tiny props, carefully authored distinct architecture, matching the illustrated style of the supplied reference images. Composition: full-bleed 9:16 portrait, one coherent scene viewed from a steep overhead orthographic camera, wide quiet uninterrupted central delivery path occupying middle 38% from top to bottom; rich storytelling architecture and props along side borders; lower quarter a darker uncluttered loading apron for the game to overlay four trucks; top quiet enough for a HUD. Each scene must have its own unmistakable architecture and landmarks. No text, lettering, logos, watermark, UI, people, actual trucks, magic, monsters, surreal things, no collage or contact sheet. Opaque background. Reference images are style/composition references only; generate an entirely new scene with the following subject: Neighbourhood Repair Fair: a welcoming public brick plaza during golden afternoon, canopy-covered worktables on the sides for a tailor with coloured cloth rolls and sewing machine, a bicycle mechanic with toolcases and bicycle wheels, a bookbinder with book stacks and binding press. Flowering planters, meal baskets, water crates, benches and pennants along borders. Bright bunting at very top, orange brick and cream canvas, distinct cheerful neighbourhood fair. Wide clear central stone delivery path and empty dark paved lower apron. No people.

## Verification

All 134 existing unit checks pass, including original mission fixtures, old and mixed expansion save restoration, distinct asset hashes, 360 × 640 bounds, source/preview integrity and download budgets. All 77 paintings were visually reviewed as a contact sheet. Browser regression suites could not run in this environment because no Chromium executable was installed and the browser download host was blocked. The 8.0 browser results in README are historical release results, not new 8.1 runs.

