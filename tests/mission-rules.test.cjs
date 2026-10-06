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
  assert.equal(rules.getMission('space', rules.levelCount), null);
  assert.equal(rules.isUnlocked(null, {}), false);
});

test('total stars count only known missions and survive a storage round trip', () => {
  let records = {};
  for (const m of rules.missions) records = rules.recordResult(records, m, { ...clear, delivered: m.loads, priorityLoaded: m.priority, perfects: m.perfects });
  records = rules.readRecords(JSON.stringify(records));
  assert.equal(rules.totalStars(records), rules.missions.length * 3);
  assert.equal(rules.totalStars(records, 'space'), rules.levelCount*3);
});

test('six new worlds provide distinct cargo, stories and open first missions', () => {
  assert.equal(rules.worlds.length,23);assert.equal(rules.missions.length,184);
  for(const id of ['batcave','school','dino','candy','forest','arctic']) {
    const world=rules.worlds.find(w=>w.id===id);
    assert.equal(new Set(world.stories.slice(0,3)).size,3);assert.equal(new Set(world.cargo.split(';')).size,12);
    for(let stage=0;stage<3;stage++)assert.equal(rules.getMission(id,stage).story,world.stories[stage]);
  }
});

test('eight tiers raise speed, density, special cargo, timing requirements and dock changes',()=>{
  assert.equal(rules.levelCount,8);
  for(const world of rules.worlds){
    assert.equal(new Set(world.stages).size,8);assert.equal(world.stories.length,8);
    for(let stage=1;stage<rules.levelCount;stage++){
      const old=rules.getMission(world.id,stage-1),next=rules.getMission(world.id,stage);
      assert.ok(next.speed>old.speed);assert.ok(next.gap<old.gap);assert.ok(next.loads>old.loads);
      assert.ok(next.seconds/next.loads<old.seconds/old.loads);
      assert.ok(next.perfects/next.loads>=old.perfects/old.loads);
      assert.ok(next.fragile+next.express>=old.fragile+old.express);
      assert.ok(next.shuffleAt.length>=old.shuffleAt.length);
      assert.ok(next.shuffleAt.every(at=>at>0 && at<next.loads));
      assert.equal(rules.isUnlocked(next,{[old.id]:{stars:1}}),true);
      assert.equal(rules.isUnlocked(next,{}),false);
    }
  }
  assert.equal(rules.tiers[7].shuffleAt.length,6);
});

test('returning players keep all thirty original records and can continue at level four',()=>{
  const old={};
  for(const world of rules.worlds.slice(0,10))for(let stage=0;stage<3;stage++)old[`${world.id}-${stage+1}`]={stars:3,bestScore:900,bestTime:30};
  const restored=rules.readRecords(JSON.stringify(old));assert.deepEqual(restored,old);
  assert.equal(rules.totalStars(restored),90);
  for(const world of rules.worlds.slice(0,10)){assert.equal(rules.isUnlocked(rules.getMission(world.id,3),restored),true);assert.equal(rules.isUnlocked(rules.getMission(world.id,4),restored),false);}
});

test('four historical routes have distinct cargo, stories and a single map page',()=>{
  const historical=rules.worlds.filter(w=>w.era==='history');
  assert.deepEqual(historical.map(w=>w.id),['rome','egypt','viking','silkroad']);
  assert.deepEqual(rules.worldPages[3],historical);
  assert.deepEqual(rules.worldPages.flat(),rules.worlds);
  for(const w of historical){assert.equal(new Set(w.stories).size,8);assert.equal(new Set(w.cargo.split(';')).size,12);assert.equal(rules.isUnlocked(rules.getMission(w.id,0),{}),true);}
});
