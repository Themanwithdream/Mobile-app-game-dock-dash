# Sky & Space artwork — 8.3

Four illustrations were generated with imagegen and inspected before integration.
The supplied Asgard photograph guided the edited Asgard painting. Existing
Asgard and Air Cargo Hub art provided the two edit targets. Bifröst Skyport and
Lunar Cargo Base are new paintings. Original generated files are kept separately
from these small runtime assets. The world manifest records each source hash.

## Art direction

- **Asgard:** finely drawn pixel art of a soaring golden palace, a rainbow bridge
  leading towards its doors, sheer cliffs with white waterfalls, distant
  mountains, and a deep blue and amber sky. Keep the lower foreground clear
  for the game belt. No text, interface or characters.
- **Air Cargo Hub:** a wide isometric view of a white cargo aircraft, illuminated
  loading bays, cargo dollies, a control tower and runway lights at blue hour.
  Replace the empty overhead floor crop with a scenic menu picture. No text,
  interface, logos or characters. This is a separate home asset; the original
  gameplay floor stays in place.
- **Bifröst Skyport:** a golden and teal cargo terminal where a luminous rainbow
  bridge meets the clouds, with Nordic arches, suspended cargo skiffs, crystal
  guides and cascading waterfalls. Use an uncluttered central delivery lane.
  No text, interface or characters.
- **Lunar Cargo Base:** ivory pressure domes, an open cargo lander, solar arrays,
  a loading crane and rover tracks on grey lunar ground. A blue Earth hangs
  above the outpost in a navy starfield. Keep the centre clear for gameplay.
  No text, interface or logos.

World paintings use the existing nearest-neighbour 360 × 640, 256-colour PNG
pipeline and stay below 240 KB each. Their previews use the standard 360 × 180
WebP pipeline. The Air Cargo Hub home image is a separate 720 × 480 WebP.

Location IDs 0–179 retain their existing meaning. The new locations
are 180 (Bifröst Skyport) and 181 (Lunar Cargo Base); no previous save IDs move.
