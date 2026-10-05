const test = require('node:test');
const assert = require('node:assert/strict');
const rules = require('../missions/mission-rules.js');
const first = rules.getMission('matchday', 0);
const clear = { won: true, elapsed: 24, delivered: 12, priorityLoaded: 3, lives: 3, perfects: 4, score: 640 };

test('every world starts open and later challenges need a completed predecessor', () => {
  for (const w of rules.worlds) {
    assert.equal(rules.isUnlocked(rules.getMission(w.id, 0), {}), true);
    assert.equal(rules.isUnlocked(rules.getMission(w.id, 1), {}), false);
    assert.equal(rules.isUnlocked(rules.getMission(w.id, 2), { [`${w.id}-1`]: { stars: 3 } }), false);
  }
  const saved = rules.recordResult({}, first, clear);
  assert.equal(rules.isUnlocked(rules.getMission('matchday', 1), saved), true);
  assert.equal(rules.isUnlocked(rules.getMission('festival', 1), saved), false);
});

test('success requires both package and priority targets before the deadline', () => {
  assert.equal(rules.grade(first, clear), 3);
  for (const patch of [{ delivered: 11 }, { priorityLoaded: 2 }, { elapsed: 45.01 }, { elapsed: NaN }, { elapsed: -1 }, { lives: 0 }, { won: false }]) {
    assert.equal(rules.grade(first, { ...clear, ...patch }), 0);
  }
});

test('star grades reward a clear, one-mistake run, and flawless perfect timing', () => {
  assert.equal(rules.grade(first, { ...clear, lives: 1 }), 1);
  assert.equal(rules.grade(first, { ...clear, lives: 2 }), 2);
  assert.equal(rules.grade(first, { ...clear, perfects: 3 }), 2);
  assert.equal(rules.grade(first, clear), 3);
});

test('replays retain highest stars, score and fastest successful time independently', () => {
  const saved = rules.recordResult({}, first, clear);
  const replay = rules.recordResult(saved, first, { ...clear, lives: 1, score: 900, elapsed: 30 });
  assert.deepEqual(replay[first.id], { stars: 3, bestScore: 900, bestTime: 24 });
  const failed = rules.recordResult(replay, first, { ...clear, won: false, score: 1200 });
  assert.equal(failed, replay);
  assert.equal(saved[first.id].bestScore, 640);
});

test('malformed storage and unknown records cannot unlock missions', () => {
  for (const raw of ['{broken', 'null', '[]', '"text"', '{"matchday-1":{"stars":4}}', '{"matchday-1":{"stars":"3"}}']) {
    assert.deepEqual(rules.readRecords(raw), {});
  }
  const parsed = rules.readRecords({ 'unknown-1': { stars: 3 }, 'matchday-1': { stars: 1, bestScore: Infinity, bestTime: -4 } });
  assert.deepEqual(parsed, { 'matchday-1': { stars: 1, bestScore: 0, bestTime: 45 } });
});

test('mission product IDs extend existing cargo without collisions or cross-world parcels', () => {
  const all = new Set();
  for (const w of rules.worlds) {
    const m = rules.getMission(w.id, 0);
    assert.equal(w.cargo.split(';').length, 12);
    assert.equal(new Set(m.products).size, 12);
    assert.ok(m.priorityProducts.every(id => m.products.includes(id)));
    for (const id of m.products) { assert.ok(id >= 300 && id < 300 + rules.worlds.length * 12); assert.equal(all.has(id), false); all.add(id); }
  }
  assert.equal(all.size, rules.worlds.length * 12);
  for (const [i,id] of ['matchday','festival','rescue','space'].entries()) assert.equal(rules.getMission(id,0).products[0],300+i*12);
  assert.equal(rules.getMission('unknown', 0), null);
  assert.equal(rules.getMission('space', 3), null);
  assert.equal(rules.isUnlocked(null, {}), false);
});

test('total stars count only known missions and survive a storage round trip', () => {
  let records = {};
  for (const m of rules.missions) records = rules.recordResult(records, m, { ...clear, delivered: m.loads, priorityLoaded: m.priority, perfects: m.perfects });
  records = rules.readRecords(JSON.stringify(records));
  assert.equal(rules.totalStars(records), rules.missions.length * 3);
  assert.equal(rules.totalStars(records, 'space'), 9);
});

test('six new worlds provide distinct cargo, stories and open first missions', () => {
  assert.equal(rules.worlds.length,10);assert.equal(rules.missions.length,30);
  for(const id of ['batcave','school','dino','candy','forest','arctic']) {
    const world=rules.worlds.find(w=>w.id===id);
    assert.equal(new Set(world.stories).size,3);assert.equal(new Set(world.cargo.split(';')).size,12);
    for(let stage=0;stage<3;stage++)assert.equal(rules.getMission(id,stage).story,world.stories[stage]);
  }
});
