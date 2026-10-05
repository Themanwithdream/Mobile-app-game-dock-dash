/* Real browser checks. Test hooks are injected into a temporary response only. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const root = path.resolve(__dirname, '..');
const output = process.env.DOCK_TEST_OUTPUT || path.join(os.tmpdir(), 'dock-dash-mission-checks');
fs.mkdirSync(output, { recursive: true });
const url = 'http://127.0.0.1:8840/';
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const html = source.replace('  buildBelt(); parcelCache', `  window.__dockTest={MR,settings,profile,discovered,soundtrack,startGame,launchMission,openMissionMap,openBriefing,loadLane,nextParcel,update,render,gameOver,finishTutorial,backToTitle,
    get state(){return state;},get game(){return game;},get paused(){return paused;},get records(){return missionRecords;},get scene(){return activeLocation;},get art(){return pixelArt;}};
  buildBelt(); parcelCache`);
assert.notEqual(html, source);
const checks = [];
function pass(name, detail) { checks.push({ name, detail }); console.log('PASS ' + name + (detail ? ' · ' + JSON.stringify(detail) : '')); }
async function setup(page, simulated = false) {
  await page.route(url, route => route.fulfill({ status: 200, contentType: 'text/html', body: html }));
  await page.addInitScript(({ simulated }) => {
    if (simulated) { window.requestAnimationFrame = () => 0; localStorage.setItem('dockDashMuted', 'true'); }
    if (!localStorage.getItem('dockDashProfileV2')) {
      localStorage.setItem('dockDashProfileV2', JSON.stringify({ totalDelivered: 180, totalPerfect: 64, totalTrucks: 24, totalGoals: 12, highestShift: 9, selectedSkin: 2, tutorialDone: true }));
      localStorage.setItem('dockDashBest', '12345'); localStorage.setItem('dockDashCargoCollectionV1', '[3,14,29]');
    }
  }, { simulated });
  await page.goto(url);
  await page.waitForFunction(() => window.__dockTest && [0,2,3,4,5,6].every(i => __dockTest.art[i]));
}
async function advance(page, seconds) {
  return page.evaluate(seconds => { for (let left = seconds; left > 1e-8; left -= 1/120) __dockTest.update(Math.min(left, 1/120)); __dockTest.render(); }, seconds);
}

(async () => {
  const server = spawn('python', ['-m', 'http.server', '8840', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(url)).ok) break; } catch (_) {} await new Promise(r => setTimeout(r, 100)); }
  const browser = await chromium.launch({ executablePath: process.env.DOCK_CHROME || '/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell', headless: true, args: ['--no-sandbox', '--autoplay-policy=document-user-activation-required'] });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    await setup(page);
    assert.equal(await page.locator('audio').evaluateAll(players => players.filter(p => !p.paused).length), 0);
    assert.equal(await page.evaluate(() => __dockTest.profile.totalDelivered), 180);
    assert.deepEqual(await page.evaluate(() => [...__dockTest.discovered]), [3,14,29]);
    pass('cold launch preserves existing progress and waits for an audio gesture');
    await page.screenshot({ path: path.join(output, 'title.png') });
    await page.locator('#missions').tap(); await page.screenshot({ path: path.join(output, 'mission-map.png') });
    for (const world of ['matchday','festival','rescue','space']) {
      await page.locator(`[data-world="${world}"]`).tap();
      assert.equal(await page.locator('[data-mission-stage="1"]').isDisabled(), true);
      assert.equal(await page.locator('[data-mission-stage="2"]').isDisabled(), true);
      const scene = await page.evaluate(() => __dockTest.scene);
      assert.equal(scene, ['matchday','festival','rescue','space'].indexOf(world) + 3);
      await page.waitForFunction(t => __dockTest.soundtrack.active?.track === t && !__dockTest.soundtrack.pending, scene);
      await page.locator('#briefing-back').tap();
    }
    pass('four worlds have distinct scenes and music, with first missions open');
    await page.locator('[data-world="matchday"]').tap(); await page.screenshot({ path: path.join(output, 'soccer-briefing.png') });
    await page.locator('#mission-launch').tap();
    assert.equal(await page.evaluate(() => Math.ceil(__dockTest.game.readyIn)), 3);
    await page.keyboard.press('1');
    assert.equal(await page.evaluate(() => __dockTest.game.delivered), 0);
    assert.equal(await page.locator('#lanes').isVisible(), false);
    await page.screenshot({ path: path.join(output, 'soccer-countdown.png') });
    await page.waitForFunction(() => Math.ceil(__dockTest.game.readyIn) === 2);
    await page.waitForFunction(() => Math.ceil(__dockTest.game.readyIn) === 1);
    const frozen = await page.evaluate(() => ({ y: __dockTest.game.parcels.map(p=>p.y), elapsed: __dockTest.game.missionElapsed, score: __dockTest.game.score }));
    assert.deepEqual(frozen, { y: [336,252,168], elapsed: 0, score: 0 });
    await page.locator('#pause').tap();
    const remaining = await page.evaluate(() => __dockTest.game.readyIn);
    await page.waitForTimeout(350);
    assert.equal(await page.evaluate(() => __dockTest.game.readyIn), remaining);
    await page.locator('#resume').tap(); await page.waitForFunction(() => __dockTest.game.readyIn === 0);
    assert.equal(await page.locator('#lanes').isVisible(), true);
    await page.screenshot({ path: path.join(output, 'soccer-play.png') });
    await page.locator('#pause').tap();
    pass('real touch start displays 3, 2, 1, freezes parcels/input/timer, and respects pause');
    const decoded = await page.evaluate(async () => {
      const media = JSON.parse(document.getElementById('bundled-media').textContent), ac = new AudioContext(), tracks = [];
      const metadata=await (await fetch('./audio/mission-music.json')).json();
      for (const src of media.music) {
        const buffer = await ac.decodeAudioData(await (await fetch(src)).arrayBuffer()), data = buffer.getChannelData(0);
        let sum = 0, peak = 0; for (const sample of data) { sum += sample * sample; peak = Math.max(peak, Math.abs(sample)); }
        const expected=metadata.find(m=>src.endsWith('/'+m.file));
        tracks.push({ src, duration: buffer.duration, expectedDuration:expected?.duration_seconds, channels: buffer.numberOfChannels, rms: Math.sqrt(sum/data.length), peak });
      }
      await ac.close(); return tracks;
    });
    assert.equal(decoded.length, 13);
    for (const t of decoded) { assert.ok(t.duration > 60);if(t.expectedDuration)assert.ok(Math.abs(t.duration-t.expectedDuration)<.1,t.src+' complete loop');assert.equal(t.channels, 2); assert.ok(t.rms > .04); assert.ok(t.peak < .99); }
    pass('all thirteen stereo soundtracks decode, contain music, and stay below clipping', decoded.map(t => ({ src: t.src, seconds: +t.duration.toFixed(2) })));
    const settingsTimer = await page.evaluate(() => __dockTest.game.missionElapsed);
    await page.locator('.settings-button:visible').tap(); await page.locator('[data-location="1"]').tap(); await page.locator('#settings-back').tap();
    assert.equal(await page.evaluate(() => __dockTest.scene), 3);
    assert.equal(await page.evaluate(() => __dockTest.game.missionElapsed), settingsTimer);
    pass('route preferences do not change the active mission when settings close');
    await page.locator('#exit-run').tap(); assert.equal(await page.evaluate(() => __dockTest.state), 'missions');
    await context.close();

    const simContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const sim = await simContext.newPage(); sim.on('pageerror', e => errors.push(e.message)); await setup(sim, true);
    for (const options of [{}, { tutorial: true }]) {
      await sim.evaluate(options => __dockTest.startGame(options), options);
      const initial = await sim.evaluate(() => __dockTest.game.parcels.map(p => p.y));
      await advance(sim, 2.95); await sim.keyboard.press('1');
      assert.deepEqual(await sim.evaluate(() => __dockTest.game.parcels.map(p => p.y)), initial);
      assert.equal(await sim.evaluate(() => __dockTest.game.delivered), 0); await advance(sim, .06);
      assert.equal(await sim.evaluate(() => __dockTest.game.readyIn), 0);
    }
    await sim.evaluate(() => __dockTest.finishTutorial());
    assert.equal(await sim.evaluate(() => __dockTest.game.readyIn), 3);
    await sim.evaluate(() => { __dockTest.gameOver(); }); await sim.waitForTimeout(520); await advance(sim,.001); await sim.locator('#replay').tap();
    assert.equal(await sim.evaluate(() => __dockTest.game.readyIn), 3);
    pass('arcade, replay, tutorial and the post-tutorial shift each start with three seconds');
    await sim.evaluate(() => __dockTest.openBriefing('matchday', 0)); await sim.locator('#mission-launch').tap(); await advance(sim, 1);
    await sim.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await advance(sim, 10); assert.ok(Math.abs(await sim.evaluate(() => __dockTest.game.readyIn) - 2) < 1e-6);
    await sim.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    await sim.locator('#resume').tap(); await advance(sim, 2.01);
    const timerBefore = await sim.evaluate(() => __dockTest.game.missionElapsed);
    await sim.locator('#pause').tap(); await advance(sim, 10);
    assert.equal(await sim.evaluate(() => __dockTest.game.missionElapsed), timerBefore);
    pass('hidden tabs freeze the countdown and pauses freeze mission deadlines');
    await sim.evaluate(() => __dockTest.openMissionMap());
    const results = await sim.evaluate(() => {
      const d = __dockTest, results = [];
      for (const world of d.MR.worlds) for (let stage = 0; stage < 3; stage++) {
        d.openBriefing(world.id, stage); d.launchMission();
        const m = d.game.mission;
        for (let frame = 0; frame < 7200 && d.state === 'play'; frame++) {
          d.update(1/120);
          const p = d.nextParcel();
          if (d.game.readyIn === 0 && !d.game.hold && p && p.y >= 363) {
            const lane = d.game.trucks.findIndex(t => (p.type === 4 || t.type === p.type) && !(d.game.shift === 1 && t.type === 3));
            d.loadLane(lane);
          }
          if (d.game.parcels.some(p => !m.products.includes(p.product))) throw new Error('Cross-world cargo');
        }
        results.push({ id: m.id, state: d.state, stars: d.records[m.id]?.stars || 0, loads: d.game.delivered,
          priority: d.game.priorityLoaded, seconds: d.game.missionElapsed, remixed: d.game.missionRemixed, lives: d.game.lives });
        d.render();
      }
      return results;
    });
    assert.equal(results.length, 30);
    for (const r of results) { assert.equal(r.state, 'missionResult', r.id); assert.equal(r.stars, 3, r.id); assert.equal(r.lives, 3, r.id); if (r.id.endsWith('-3')) assert.equal(r.remixed, true, r.id); }
    pass('all thirty missions can be completed at three stars with their own cargo and final-stage remix', results);
    await sim.screenshot({ path: path.join(output, 'space-result.png') });
    assert.equal(await sim.evaluate(() => localStorage.getItem('dockDashBest')), '12345');
    await sim.reload(); await sim.waitForFunction(() => window.__dockTest && [3,4,5,6].every(i=>__dockTest.art[i]));
    assert.equal(await sim.evaluate(() => __dockTest.MR.totalStars(__dockTest.records)), 90);
    assert.ok(await sim.evaluate(() => __dockTest.profile.totalDelivered > 180 && [3,14,29].every(id=>__dockTest.discovered.has(id))));
    pass('mission stars, fleet deliveries and cargo persist after reload; arcade best is preserved');
    await sim.evaluate(() => { __dockTest.openBriefing('matchday', 0); __dockTest.launchMission(); }); await advance(sim, 3.01);
    await sim.evaluate(() => { __dockTest.game.missionElapsed = 44.99; __dockTest.update(.02); __dockTest.render(); });
    assert.equal(await sim.evaluate(() => __dockTest.state), 'missionResult');
    assert.ok(await sim.locator('#mission-results').textContent().then(s=>s.includes('Time ran out')));
    assert.equal(await sim.evaluate(() => __dockTest.records['matchday-1'].stars), 3);
    await sim.locator('#mission-next').tap(); assert.equal(await sim.evaluate(() => __dockTest.game.readyIn), 3);
    pass('deadline failures preserve earned stars and retry restarts the countdown');
    await advance(sim, 3.01);
    await sim.evaluate(() => { const d=__dockTest;for(let i=0;i<3;i++){const p=d.nextParcel();p.type=0;p.y=365;d.render();d.loadLane(d.game.trucks.findIndex(t=>t.type===1));}d.render(); });
    assert.equal(await sim.evaluate(() => __dockTest.state), 'missionResult');
    assert.ok(await sim.locator('#mission-results').textContent().then(s=>s.includes('Out of lives')));
    pass('wrong docks can end a mission without granting or erasing stars');
    await sim.evaluate(() => { localStorage.setItem('dockDashMissionsV1','{broken'); }); await sim.reload(); await sim.waitForFunction(() => !!window.__dockTest);
    assert.equal(await sim.evaluate(() => __dockTest.MR.totalStars(__dockTest.records)), 0);
    assert.equal(await sim.evaluate(() => __dockTest.profile.highestShift), 9);
    pass('malformed mission storage recovers without damaging existing profile data');
    assert.deepEqual(errors, []); pass('no browser runtime errors');
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ checks, results, audio: decoded, errors }, null, 2));
    await simContext.close();
  } finally { await browser.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
