/* Dock Dash mission definitions and saved-star rules. No browser dependencies. */
(function (root, factory) {
  const rules = factory();
  if (typeof module === 'object' && module.exports) module.exports = rules;
  else root.DockDashMissions = rules;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const worlds = [
    { id: 'matchday', name: 'Matchday', category: 'Soccer supplies', badge: 'SOCCER',
      tag: 'Get the squad ready for kickoff.', location: 3, accent: '#b8e89b', tempo: 112,
      priority: 'TEAM ESSENTIALS', priorityCopy: 'Balls · jerseys · kits',
      stages: ['Warm-up delivery', 'Kickoff rush', 'Cup final'],
      cargo: 'Ball bundle|soccerball;Team jerseys|jersey;Match kit bag|kitbag;Football boots|boot;Keeper gloves|keepergloves;Training cones|cone;Shin guards|shinguards;Captain armbands|belt;Ball pump|pump;Team water bottles|bottle;Corner flags|flag;Cup trophy|trophy' },
    { id: 'festival', name: 'Festival Rush', category: 'Festival supplies', badge: 'FESTIVAL',
      tag: 'Keep the lights and music going.', location: 4, accent: '#ffbf89', tempo: 104,
      priority: 'SHOW ESSENTIALS', priorityCopy: 'Tickets · speakers · lights',
      stages: ['Gates open', 'Headline act', 'Encore rush'],
      cargo: 'Festival tickets|ticket;Stage speaker|speaker;String lights|festoon;Guitar case|guitar;Drum kit|drum;Popcorn tubs|popcorn;Pizza boxes|pizza;Drink cups|cup;Festival tent|tent;Artist wristbands|belt;Microphone kit|mic;Bunting flags|flag' },
    { id: 'rescue', name: 'Ocean Rescue', category: 'Rescue supplies', badge: 'RESCUE',
      tag: 'Equip the crew. Look after the coast.', location: 5, accent: '#92dfeb', tempo: 108,
      priority: 'CREW ESSENTIALS', priorityCopy: 'First aid · vests · water',
      stages: ['Ready the station', 'Harbour patrol', 'All hands'],
      cargo: 'First-aid case|firstaid;Life jackets|lifevest;Fresh water crate|watercrate;Rescue lifebuoy|lifebuoy;Warm blankets|blanket;Coiled rope|wheel;Rescue paddle|paddle;Signal lantern|lantern;Crew radio|radio;Rescue flares|torch;Dry bag|kitbag;Safety helmet|helmet' },
    { id: 'space', name: 'Space Launch', category: 'Space supplies', badge: 'SPACE',
      tag: 'Supply the next giant little leap.', location: 6, accent: '#c4baff', tempo: 120,
      priority: 'FLIGHT ESSENTIALS', priorityCopy: 'Helmets · oxygen · fuel',
      stages: ['Moonbase supplies', 'Launch window', 'Orbital express'],
      cargo: 'Astronaut helmet|astronaut;Oxygen tanks|oxygen;Rocket fuel cells|fuel;Solar panel|solar;Moon rover|car;Service robot|robot;Space food packs|box;Navigation tablet|tablet;Satellite kit|satellite;Star map|book;Launch rocket|rocket;Repair tools|tools' },
    { id:'batcave', name:'Batcave', category:'Batman gadgets', badge:'GOTHAM',
      tag:'Keep Gotham’s night shift ready.', location:7, accent:'#ffdf72', tempo:110,
      priority:'HERO ESSENTIALS', priorityCopy:'Batarangs · grapples · belts',
      stages:['Gadget delivery','Gotham patrol','Dark knight express'],
      stories:['Alfred is stocking the cave. Send the first gadget crates.', 'The Bat-Signal is on. Gear up all four patrol docks.', 'A busy night in Gotham. Fragile tech and express gadgets arrive.'],
      cargo:'Batarang case|bat;Grappling launcher|grapple;Utility belts|utilitybelt;Batman cowl|cowl;Folded cape|cape;Bat-Signal lens|batsignal;Batcomputer parts|chip;Detective scanner|scanner;Armoured gloves|gloves;Batmobile tools|tools;Smoke capsules|capsule;Gotham city map|map' },
    { id:'school', name:'School Run', category:'School supplies', badge:'SCHOOL',
      tag:'Little deliveries. Big bright ideas.', location:8, accent:'#ffd783', tempo:106,
      priority:'CLASSROOM ESSENTIALS', priorityCopy:'Books · pencils · backpacks',
      stages:['First bell','Art class rush','Science fair express'],
      stories:['The first bell is close. Fill the classrooms with essentials.', 'Art class needs a fresh supply of colour. Yellow joins the fleet.', 'The science fair opens soon. Handle models and express supplies.'],
      cargo:'Textbook stack|bookstack;Coloured pencils|pencils;School backpacks|backpack;Spiral notebooks|notebook;Geometry rulers|ruler;Lunch boxes|box;Art palettes|palette;Safety scissors|scissors;Glue sticks|bottle;Classroom globe|globe;Science microscope|microscope;School bell|bell' },
    { id:'dino', name:'Dino Park', category:'Dinosaur park supplies', badge:'DINOS',
      tag:'Tiny trucks. Jurassic-sized wonder.', location:9, accent:'#c3e89e', tempo:114,
      priority:'RANGER ESSENTIALS', priorityCopy:'Eggs · feed · ranger kits',
      stages:['Hatchery helpers','Ranger rounds','Jurassic jamboree'],
      stories:['A baby dinosaur is hatching. Deliver eggs and ranger supplies.', 'The park is waking up. Stock four ranger stations.', 'Visitors are arriving. Move fossils, feed and fragile eggs with care.'],
      cargo:'Dinosaur eggs|dinoegg;Dinosaur feed|feed;Ranger kits|kitbag;Fossil specimens|fossil;Excavation brushes|brush;Ranger binoculars|binoculars;Fern seedlings|plant;Tracking radios|radio;Park maps|map;Ranger hats|cap;Dinosaur models|dinosaur;Visitor passes|ticket' },
    { id:'candy', name:'Candy Works', category:'Candy factory supplies', badge:'CANDY',
      tag:'Sweet cargo. A perfectly timed treat.', location:10, accent:'#ffc1df', tempo:118,
      priority:'SWEET ESSENTIALS', priorityCopy:'Chocolate · sugar · sprinkles',
      stages:['Morning batch','Sugar rush','Midnight confection'],
      stories:['The first batch is mixing. Deliver the sweet ingredients.', 'The candy counters are busy. Keep all four docks supplied.', 'The special orders are ready. Fragile treats need perfect timing.'],
      cargo:'Chocolate bars|chocolate;Sugar sacks|bag;Rainbow sprinkles|sprinkles;Swirl lollipops|lollipop;Cupcake trays|cupcake;Cookie tins|cookie;Candy canes|candycane;Gummy bear boxes|teddy;Jam jars|jar;Baking tools|tools;Gift ribbons|bow;Sweet gift boxes|gift' },
    { id:'forest', name:'Moonleaf Forest', category:'Enchanted supplies', badge:'MAGIC',
      tag:'Deliver a little wonder after dark.', location:11, accent:'#d5bfff', tempo:100,
      priority:'MAGIC ESSENTIALS', priorityCopy:'Potions · spellbooks · crystals',
      stages:['Lantern trail','Potion moonrise','Starlight delivery'],
      stories:['Light the lantern trail. The woodland camp needs supplies.', 'Moonrise is near. Bring potions and books to four magic docks.', 'A starlight celebration awaits. Sort fragile crystals and swift spells.'],
      cargo:'Potion bottles|potion;Spellbooks|spellbook;Moon crystals|crystal;Mushroom lanterns|mushroom;Wizard hats|wizardhat;Magic wands|wand;Herb bundles|plant;Bottled starlight|starjar;Silver moon charms|moon;Enchanted maps|map;Fairy house kits|house;Woodland tea|jar' },
    { id:'arctic', name:'Arctic Outpost', category:'Polar expedition supplies', badge:'POLAR',
      tag:'Warm hearts. Ice-cool deliveries.', location:12, accent:'#bdeaff', tempo:102,
      priority:'EXPEDITION ESSENTIALS', priorityCopy:'Parkas · heaters · hot drinks',
      stages:['Warm the camp','Aurora rounds','Polar night express'],
      stories:['The research crew has arrived. Warm up the camp.', 'Aurora rounds are starting. Stock four expedition stations.', 'The polar night is quiet. Deliver instruments and express warmth.'],
      cargo:'Thermal parkas|parka;Camp heaters|heater;Hot drink flasks|thermos;Snow goggles|glasses;Ice axes|iceaxe;Sled repair kits|tools;Research sensors|scanner;Snow boots|boot;Polar radios|radio;Sample cases|crystal;Aurora camera|camera;Snowflake badges|snowflake' }
  ];
  const tiers = [
    { loads: 12, priority: 3, seconds: 45, perfects: 4, speed: 82, gap: 90, shift: 1, detail: 'Three docks. A steady belt. Find your rhythm.' },
    { loads: 20, priority: 5, seconds: 50, perfects: 7, speed: 102, gap: 84, shift: 2, detail: 'Four docks and a faster belt. Yellow joins in.' },
    { loads: 28, priority: 7, seconds: 55, perfects: 10, speed: 124, gap: 78, shift: 4, detail: 'Fragile, express and a dock shuffle after 14 loads.' }
  ];
  function getMission(worldId, stage) {
    const index = worlds.findIndex(w => w.id === worldId);
    if (index < 0 || !Number.isInteger(stage) || stage < 0 || stage >= tiers.length) return null;
    const world = worlds[index], base = 300 + index * 12;
    return { ...tiers[stage], id: `${worldId}-${stage + 1}`, world, stage,
      title: world.stages[stage], story:world.stories?.[stage] || world.tag, products: Array.from({ length: 12 }, (_, i) => base + i),
      priorityProducts: [base, base + 1, base + 2] };
  }
  const missions = worlds.flatMap(w => tiers.map((_, i) => getMission(w.id, i)));
  function readRecords(raw) {
    let saved;
    try { saved = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (_) { return {}; }
    const records = {};
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return records;
    for (const mission of missions) {
      const r = saved[mission.id];
      if (!r || typeof r !== 'object' || !Number.isInteger(r.stars) || r.stars < 1 || r.stars > 3) continue;
      records[mission.id] = { stars: r.stars,
        bestScore: Number.isFinite(r.bestScore) ? Math.max(0, Math.min(1e9, Math.floor(r.bestScore))) : 0,
        bestTime: Number.isFinite(r.bestTime) && r.bestTime >= 0 && r.bestTime <= mission.seconds ? r.bestTime : mission.seconds };
    }
    return records;
  }
  function isUnlocked(mission, records) {
    return !!mission && (mission.stage === 0 || (records[`${mission.world.id}-${mission.stage}`]?.stars || 0) > 0);
  }
  function grade(mission, stats) {
    if (!mission || !stats.won || !Number.isFinite(stats.elapsed) || stats.elapsed > mission.seconds || stats.elapsed < 0 ||
      stats.delivered < mission.loads || stats.priorityLoaded < mission.priority || stats.lives <= 0) return 0;
    if (stats.lives === 3 && stats.perfects >= mission.perfects) return 3;
    return stats.lives >= 2 ? 2 : 1;
  }
  function recordResult(records, mission, stats) {
    const stars = grade(mission, stats);
    if (!stars) return records;
    const old = records[mission.id];
    return { ...records, [mission.id]: { stars: Math.max(stars, old?.stars || 0),
      bestScore: Math.max(Math.floor(stats.score), old?.bestScore || 0),
      bestTime: Math.min(stats.elapsed, old?.bestTime ?? mission.seconds) } };
  }
  function totalStars(records, worldId) {
    return missions.filter(m => !worldId || m.world.id === worldId).reduce((sum, m) => sum + (records[m.id]?.stars || 0), 0);
  }
  return { worlds, missions, getMission, readRecords, isUnlocked, grade, recordResult, totalStars };
});
