const test = require('node:test');
const assert = require('node:assert/strict');
const DockDashSoundtrack = require('../audio/route-music.js');

function setup({readonlyVolume = false} = {}) {
  let now = 0, timerID = 0, allowed = true;
  const timers = new Map(), players = [], statuses = [];
  class Media extends EventTarget {
    constructor() { super(); this.paused = true; this.error = null; this._volume = 1; this.currentTime = 0; this.playCalls = 0; this.srcChanges = 0; this.mode = 'auto'; this.waiters = []; }
    setAttribute() {}
    get volume() { return this._volume; }
    set volume(value) { if (readonlyVolume) throw new TypeError('Readonly volume'); this._volume = value; }
    set src(value) { this._src = value; this.srcChanges++; this.currentTime = 0; this.error = null; }
    get src() { return this._src; }
    pause() { if (!this.paused) { this.paused = true; this.dispatchEvent(new Event('pause')); } }
    play() {
      this.playCalls++;
      if (this.mode === 'blocked') return Promise.reject(new Error('NotAllowedError'));
      if (this.mode === 'throw') throw new Error('NotSupportedError');
      if (this.mode === 'deferred') return new Promise((resolve, reject) => this.waiters.push({resolve: () => { this.paused = false; this.dispatchEvent(new Event('playing')); resolve(); }, reject}));
      this.paused = false;
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    }
  }
  global.document = {body: {appendChild() {}}, createElement: () => { const p = new Media(); players.push(p); return p; }};
  global.performance = {now: () => now};
  global.setInterval = callback => { const id = ++timerID; timers.set(id, callback); return id; };
  global.clearInterval = id => timers.delete(id);
  const music = new DockDashSoundtrack(['warehouse.mp3','harbour.mp3','airport.mp3'], {allowed: () => allowed, onStatus: s => statuses.push(s)});
  return {music, players, statuses, timers, hide: () => { allowed = false; }, show: () => { allowed = true; }, tick: ms => { now += ms; [...timers.values()].forEach(fn => fn()); }};
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
async function begin(e, track = 0) { e.music.play(track); await flush(); e.tick(700); }

test('no autoplay, and play() runs synchronously in the initiating gesture', async () => {
  const e = setup();
  assert.equal(e.players.reduce((n,p) => n+p.playCalls,0),0);
  e.music.play(0);
  assert.equal(e.players[0].playCalls,1);
  await flush(); e.tick(300);
  assert.equal(e.music.active.track,0);
  assert.equal(e.players[0].loop,true);
  assert.equal(e.players[0].volume,.52);
});
test('old music remains audible while the next route loads, then crossfades and stops', async () => {
  const e = setup(); await begin(e);
  e.players[1].mode = 'deferred'; e.music.play(1);
  assert.equal(e.players[0].paused,false);
  assert.equal(e.players[0].volume,.52);
  assert.equal(e.players[1].volume,0);
  e.players[1].waiters[0].resolve(); await flush(); e.tick(325);
  assert(e.players.every(p => !p.paused));
  assert(Math.abs(e.players[1].volume - .52/Math.sqrt(2)) < .001);
  e.tick(400);
  assert.equal(e.players[0].paused,true);
  assert.equal(e.players[1].paused,false);
  assert.equal(e.timers.size,0);
});
test('rapid route changes ignore an older pending play promise', async () => {
  const e = setup(); await begin(e);
  e.players[1].mode = 'deferred'; e.music.play(1); e.music.play(2);
  e.players[1].waiters[0].resolve(); await flush();
  assert.equal(e.music.active.track,0);
  assert.equal(e.music.pending.track,2);
  e.players[1].waiters[1].resolve(); await flush(); e.tick(700);
  assert.equal(e.music.active.track,2);
  assert.equal(e.players.filter(p => !p.paused).length,1);
});
test('muting stops both players even if a delayed play later resolves', async () => {
  const e = setup(); await begin(e);
  e.players[1].mode = 'deferred'; e.music.play(1);
  e.music.setMix(.52,false);
  e.players[1].waiters[0].resolve(); await flush();
  assert(e.players.every(p => p.paused && p.muted));
  assert.equal(e.music.pending,null);
  assert.equal(e.timers.size,0);
});
test('pause during a crossfade leaves no outgoing music playing', async () => {
  const e = setup(); await begin(e);
  e.music.play(1); await flush(); e.tick(100); e.music.pause();
  assert(e.players.every(p => p.paused));
  assert.equal(e.timers.size,0);
});
test('resuming a route preserves its playback position and source', async () => {
  const e = setup(); await begin(e);
  e.players[0].currentTime = 37.5;
  const changes = e.players[0].srcChanges;
  e.music.pause(); e.music.play(0); await flush(); e.tick(300);
  assert.equal(e.players[0].currentTime,37.5);
  assert.equal(e.players[0].srcChanges,changes);
  assert.equal(e.players[0].paused,false);
});
test('autoplay rejection surfaces a retry state, and the next gesture recovers', async () => {
  const e = setup(); e.players[0].mode = 'blocked'; e.music.play(0); await flush();
  assert.equal(e.music.blocked,true);
  e.players[0].mode = 'auto'; e.music.play(0); await flush(); e.tick(300);
  assert.equal(e.music.blocked,false);
  assert.equal(e.players[0].paused,false);
});
test('a failed new soundtrack preserves the old route until retry succeeds', async () => {
  const e = setup(); await begin(e);
  e.players[1].mode = 'throw'; e.music.play(1); await flush();
  assert.equal(e.music.blocked,true);
  assert.equal(e.players[0].paused,false);
  e.players[1].error = {code: 4}; e.players[1].mode = 'auto';
  e.music.play(1); await flush(); e.tick(700);
  assert.equal(e.music.active.track,1);
  assert.equal(e.players[1].srcChanges,2);
  assert.equal(e.players[0].paused,true);
});
test('readonly media volume uses one player with no overlapping tracks', async () => {
  const e = setup({readonlyVolume: true}); await begin(e);
  assert.equal(e.music.canFade,false);
  e.music.play(1); await flush();
  assert.equal(e.music.active.track,1);
  assert.equal(e.players.filter(p => !p.paused).length,1);
  assert.equal(e.players[1].playCalls,0);
});
test('zero music volume stops playback, and restoring volume resumes', async () => {
  const e = setup(); await begin(e);
  e.music.setMix(0,true);
  assert(e.players.every(p => p.paused && p.muted));
  e.music.setMix(.25,true); e.music.play(0); await flush(); e.tick(300);
  assert.equal(e.players[0].volume,.25);
  assert.equal(e.players[0].paused,false);
});
test('hot-streak tempo changes preserve pitch and do not restart a song', async () => {
  const e = setup(); await begin(e); e.players[0].currentTime = 20;
  e.music.setRate(116/108);
  assert.equal(e.players[0].preservesPitch,true);
  assert.equal(e.players[0].playbackRate,116/108);
  assert.equal(e.players[0].currentTime,20);
  assert.equal(e.players[0].playCalls,1);
  e.music.setRate(1); assert.equal(e.players[0].playbackRate,1);
});
test('hidden pages prevent new playback and stop an active crossfade', async () => {
  const e = setup(); await begin(e);
  e.music.play(1); await flush(); e.hide(); e.tick(100);
  assert(e.players.every(p => p.paused));
  e.music.play(2); assert.equal(e.music.pending,null);
  e.show(); e.music.play(2); await flush(); e.tick(700);
  assert.equal(e.music.active.track,2);
});
test('repeated input on the same playing route never starts duplicate audio', async () => {
  const e = setup(); await begin(e);
  for (let i=0;i<100;i++) e.music.play(0);
  assert.equal(e.players[0].playCalls,1);
  assert.equal(e.players[1].playCalls,0);
});
