/* Touch-device regressions; test hooks and counters never ship in the game. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const {chromium} = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const root = path.resolve(__dirname, '..');
const output = process.env.DOCK_TEST_OUTPUT || path.join(os.tmpdir(), 'dock-dash-mobile-checks');
fs.mkdirSync(output, {recursive:true});
const url = 'http://127.0.0.1:8841/';
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const html = source.replace('  buildBelt(); parcelCache', `  window.__dockTest={soundtrack,settings,profile,fit,wakeAudio,tickMusic,update,render,openMissionMap,openBriefing,launchMission,backToTitle,startGame,finishMission,
    get state(){return state;},get game(){return game;},get paused(){return paused;},get records(){return missionRecords;},get scene(){return activeLocation;},get art(){return pixelArt;}};
  buildBelt(); parcelCache`);
assert.notEqual(html,source);
const checks=[],errors=[];
function pass(name,detail) { checks.push({name,detail}); console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):'')); }
async function readyMusic(page,track) {
  await page.waitForFunction(track => __dockTest.soundtrack.active?.track===track && !__dockTest.soundtrack.pending && __dockTest.soundtrack.active.player.readyState>=3 && !__dockTest.soundtrack.active.player.paused,track,{polling:50});
}
async function setup(page,{quiet=false,readonly=false}={}) {
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(url,route=>route.fulfill({status:200,contentType:'text/html',body:html}));
  await page.addInitScript(({quiet,readonly})=>{
    window.requestAnimationFrame=()=>0;
    localStorage.setItem('dockDashProfileV2',JSON.stringify({totalDelivered:180,totalPerfect:64,totalTrucks:24,totalGoals:12,highestShift:9,selectedSkin:2,tutorialDone:true}));
    localStorage.setItem('dockDashMissionsV1',JSON.stringify({'matchday-1':{stars:3,bestScore:1000,fastest:20}}));
    if(quiet)localStorage.setItem('dockDashMuted','true');
    window.__counts={canvases:0,plays:0,gainTargets:0};
    const create=document.createElement.bind(document);
    document.createElement=(name,...args)=>{if(name==='canvas')__counts.canvases++;return create(name,...args);};
    const play=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(){__counts.plays++;return play.call(this);};
    if(window.AudioParam){const target=AudioParam.prototype.setTargetAtTime;AudioParam.prototype.setTargetAtTime=function(...args){__counts.gainTargets++;return target.apply(this,args);};}
    if(readonly){Object.defineProperty(HTMLMediaElement.prototype,'volume',{configurable:true,get:()=>1,set:()=>{}});window.AudioContext=undefined;window.webkitAudioContext=undefined;}
  },{quiet,readonly});
  await page.goto(url);await page.waitForFunction(()=>window.__dockTest && [0,2,3,4,5,6].every(i=>__dockTest.art[i]),null,{polling:50});
}
async function assertHome(page,oldRecords) {
  assert.equal(await page.evaluate(()=>__dockTest.state),'title');
  assert.equal(await page.evaluate(()=>__dockTest.game),null);
  assert.equal(await page.evaluate(()=>__dockTest.paused),false);
  assert.equal(await page.locator('#title-menu').isVisible(),true);
  assert.equal(await page.locator('#mission-home').isVisible(),false);
  assert.equal(await page.locator('#lanes').isVisible(),false);
  assert.equal(await page.locator('#pause-menu').isVisible(),false);
  assert.deepEqual(await page.evaluate(()=>__dockTest.records),oldRecords);
  assert.equal(await page.evaluate(()=>__dockTest.scene),0);
}

(async()=>{
  const server=spawn('python',['-m','http.server','8841','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
  let browser;
  try {
    for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch(_){}await new Promise(r=>setTimeout(r,100));}
    browser=await chromium.launch({executablePath:process.env.DOCK_CHROME || '/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell',headless:true,args:['--no-sandbox','--autoplay-policy=document-user-activation-required']});
    const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
    const page=await mobile.newPage();await setup(page);
    assert.equal(await page.locator('audio').count(),1);
    assert.equal(await page.evaluate(()=>__dockTest.soundtrack.lowPower),true);
    assert.equal(await page.evaluate(()=>__counts.plays),0);
    await page.waitForFunction(()=>document.querySelector('audio').readyState>=3,null,{polling:50});
    pass('phone buffers its selected theme with one player and no autoplay');
    await page.locator('#missions').tap();await readyMusic(page,0);
    await page.locator('[data-world="matchday"]').tap();await readyMusic(page,3);
    await page.evaluate(()=>__dockTest.render());
    await page.screenshot({path:path.join(output,'briefing-main-menu.png')});
    await page.locator('#mission-launch').tap();
    await page.evaluate(()=>{__dockTest.game.hot=10;for(let i=0;i<1000;i++){__dockTest.tickMusic();__dockTest.wakeAudio();}});
    const steady=await page.evaluate(()=>({rate:document.querySelector('audio').playbackRate,plays:__counts.plays,gain:__counts.gainTargets,fade:__dockTest.soundtrack.timer,time:document.querySelector('audio').currentTime}));
    await page.waitForTimeout(250);
    const after=await page.evaluate(()=>({rate:document.querySelector('audio').playbackRate,plays:__counts.plays,gain:__counts.gainTargets,fade:__dockTest.soundtrack.timer,time:document.querySelector('audio').currentTime}));
    assert.equal(after.rate,1);assert.equal(after.fade,null);assert.equal(after.plays,steady.plays);assert.equal(after.gain,steady.gain);assert.ok(after.time>steady.time);
    pass('hot streaks and repeated touches keep the decoded song advancing at steady tempo',after);
    const beforeResize=await page.evaluate(()=>__counts.canvases);
    await page.evaluate(()=>{for(let i=0;i<100;i++){window.dispatchEvent(new Event('resize'));window.visualViewport.dispatchEvent(new Event('resize'));}});
    assert.equal(await page.evaluate(()=>__counts.canvases),beforeResize);
    await page.setViewportSize({width:390,height:800});
    assert.equal(await page.evaluate(()=>__counts.canvases),beforeResize);
    await page.setViewportSize({width:844,height:390});
    await page.waitForFunction(n=>__counts.canvases>n,beforeResize,{polling:50});
    await page.screenshot({path:path.join(output,'landscape-menu.png')});
    await page.setViewportSize({width:390,height:844});
    await page.waitForTimeout(100);
    const canvases=await page.evaluate(()=>__counts.canvases);
    await page.evaluate(()=>__dockTest.fit());assert.equal(await page.evaluate(()=>__counts.canvases),canvases);
    pass('duplicate viewport events and browser-bar changes reuse scene bitmaps; rotation still resizes');
    await page.evaluate(()=>{__dockTest.update(3.01);__dockTest.render();});
    const home=await page.locator('#mission-home').boundingBox(),pause=await page.locator('#pause').boundingBox();
    assert.ok(home.x+home.width<pause.x);
    assert.equal(await page.locator('#mission-home').textContent(),'← Menu');
    await page.screenshot({path:path.join(output,'play-menu.png')});
    await page.locator('#pause').tap();assert.equal(await page.locator('#mission-home').textContent(),'← Main menu');
    assert.equal(await page.evaluate(()=>document.querySelector('audio').paused),true);
    await page.locator('#resume').tap();await readyMusic(page,3);
    const position=await page.evaluate(()=>{const p=document.querySelector('audio');p.pause();return p.currentTime;});
    await page.waitForFunction(()=>__dockTest.soundtrack.blocked,null,{polling:50});
    await page.locator('#game').tap({position:{x:18,y:120}});await readyMusic(page,3);
    assert.ok(await page.evaluate(()=>document.querySelector('audio').currentTime)>=position);
    pass('pause and an interrupted phone player recover from touch without resetting the song');
    await page.locator('#pause').tap();
    await page.locator('.settings-button:visible').tap();await readyMusic(page,3);
    await page.evaluate(()=>{const slider=document.getElementById('music-volume');slider.value='25';slider.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.ok(Math.abs(await page.evaluate(()=>document.querySelector('audio').volume)-.2)<1e-8);
    const mixBefore=await page.evaluate(()=>__counts.gainTargets);
    await page.locator('#sfx-toggle').tap();
    assert.equal(await page.evaluate(()=>__dockTest.settings.sfx),false);
    assert.equal(await page.evaluate(()=>document.querySelector('audio').paused),false);
    assert.equal(await page.evaluate(()=>__counts.gainTargets),mixBefore+1);
    await page.evaluate(()=>{for(let i=0;i<100;i++)__dockTest.wakeAudio();});
    assert.equal(await page.evaluate(()=>__counts.gainTargets),mixBefore+1);
    await page.locator('#music-toggle').tap();
    assert.equal(await page.evaluate(()=>document.querySelector('audio').paused),true);
    await page.locator('#music-toggle').tap();await readyMusic(page,3);
    await page.locator('#sfx-toggle').tap();
    await page.locator('#settings-back').tap();
    assert.equal(await page.evaluate(()=>document.querySelector('audio').paused),true);
    await page.locator('#resume').tap();await readyMusic(page,3);
    pass('phone volume, independent effects/music switches and resumed mission audio work');
    const records=await page.evaluate(()=>__dockTest.records);
    await page.locator('#pause').tap();const calls=await page.evaluate(()=>__counts.plays);
    await page.locator('#mission-home').tap();await assertHome(page,records);await readyMusic(page,0);
    assert.equal(await page.evaluate(()=>__counts.plays),calls+1);
    pass('paused mission returns directly to the main menu and starts only the menu theme');
    await mobile.close();

    const navigation=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
    const nav=await navigation.newPage();await setup(nav,{quiet:true});
    const saved=await nav.evaluate(()=>__dockTest.records);
    for(const state of ['missions','briefing','countdown','active','paused','result']) {
      await nav.locator('#missions').tap();
      if(state!=='missions')await nav.locator('[data-world="matchday"]').tap();
      if(['countdown','active','paused','result'].includes(state))await nav.locator('#mission-launch').tap();
      if(['active','paused','result'].includes(state))await nav.evaluate(()=>{__dockTest.update(3.01);__dockTest.render();});
      if(state==='paused')await nav.locator('#pause').tap();
      if(state==='result')await nav.evaluate(()=>{__dockTest.finishMission(false,'Time ran out');__dockTest.render();});
      assert.equal(await nav.locator('#mission-home').isVisible(),true);
      await nav.locator('#mission-home').tap();await assertHome(nav,saved);
    }
    assert.equal(await nav.evaluate(()=>__counts.plays),0);
    await nav.locator('#start').tap();assert.equal(await nav.locator('#mission-home').isVisible(),false);
    pass('main-menu touch button works from all six mission states, keeps saved stars and respects mute');
    await navigation.close();

    const safari=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    const fallback=await safari.newPage();await setup(fallback,{readonly:true});
    await fallback.locator('#missions').tap();await readyMusic(fallback,0);
    await fallback.locator('[data-world="space"]').tap();await readyMusic(fallback,6);
    assert.equal(await fallback.locator('audio').count(),1);
    assert.equal(await fallback.evaluate(()=>__dockTest.soundtrack.canFade),false);
    await fallback.locator('#mission-home').tap();await readyMusic(fallback,0);
    pass('simulated Safari volume restrictions and absent WebAudio retain native phone music');
    await safari.close();

    const desktop=await browser.newContext({viewport:{width:1100,height:800}});
    const pc=await desktop.newPage();await setup(pc);
    assert.equal(await pc.locator('audio').count(),2);
    assert.equal(await pc.evaluate(()=>__dockTest.soundtrack.canFade),true);
    await pc.locator('#missions').click();await readyMusic(pc,0);
    await pc.waitForFunction(()=>__dockTest.soundtrack.timer===null,null,{polling:50});
    await pc.locator('[data-world="festival"]').click();await readyMusic(pc,4);
    await pc.waitForFunction(()=>__dockTest.soundtrack.timer===null,null,{polling:50});
    assert.equal(await pc.locator('audio').evaluateAll(players=>players.filter(p=>!p.paused).length),1);
    pass('desktop keeps crossfades and stops the outgoing player');
    await desktop.close();
    assert.deepEqual(errors,[]);pass('no browser runtime errors');
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,errors},null,2));
  } finally {if(browser)await browser.close();server.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
