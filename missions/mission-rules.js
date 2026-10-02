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
      cargo: 'Astronaut helmet|astronaut;Oxygen tanks|oxygen;Rocket fuel cells|fuel;Solar panel|solar;Moon rover|car;Service robot|robot;Space food packs|box;Navigation tablet|tablet;Satellite kit|satellite;Star map|book;Launch rocket|rocket;Repair tools|tools' }
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
      title: world.stages[stage], products: Array.from({ length: 12 }, (_, i) => base + i),
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
