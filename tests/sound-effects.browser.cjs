/* Native sound bindings, shared audio recovery and real Web Audio rendering. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.DOCK_TEST_OUTPUT||path.join(os.tmpdir(),'dock-dash-sound-checks'),url='http://127.0.0.1:8865/';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const html=source.replace('  buildBelt(); parcelCache',`  window.__sfx={soundEffects,sound,wakeAudio,update,render,startGame,loadLane,loseLife,pauseGame,backToTitle,openBriefing,launchMission,finishMission,settings,soundtrack,syncAudioMix,
 get audio(){return audio;},get game(){return game;},get state(){return state;},get profile(){return profile;}};
 window.__attempts=[];window.__accepted=[];const originalPlay=soundEffects.play.bind(soundEffects);soundEffects.play=(kind,options)=>{__attempts.push(kind);const played=originalPlay(kind,options);if(played)__accepted.push(kind);return played;};
  buildBelt(); parcelCache`);assert.notEqual(html,source);
const checks=[],errors=[];function pass(name,detail){checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));}
async function prepare(page,{type=0,y=330,fill=0}={}){
 await page.evaluate(({type,y,fill})=>{const d=__sfx;d.soundEffects.stopAll();d.game.parcels=[{type,product:0,kind:'normal',y,phase:0,expressLeft:null}];d.game.trucks[0].fill=fill;d.game.earlyHint=0;d.render();__attempts.length=__accepted.length=0;},{type,y,fill});await page.waitForTimeout(10);
}
(async()=>{
 const server=spawn('python',['-m','http.server','8865','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;
 try{
  for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:process.env.DOCK_CHROME||'/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell',args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:664},isMobile:true,hasTouch:true,deviceScaleFactor:2}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.route(url,r=>r.fulfill({contentType:'text/html',body:html}));
  await page.addInitScript(()=>{
   requestAnimationFrame=()=>0;localStorage.setItem('dockDashProfileV2',JSON.stringify({totalDelivered:200,totalPerfect:0,totalTrucks:20,totalGoals:5,highestShift:8,tutorialDone:true,selectedSkin:0}));localStorage.setItem('dockDashSettingsV3',JSON.stringify({music:false,sfx:true,musicVolume:.65}));
   window.__counts={contexts:0,starts:0,live:new Set(),times:[]};const Base=AudioContext;window.AudioContext=class extends Base{constructor(...args){super(...args);__counts.contexts++;}};
   const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(at,...args){__counts.starts++;__counts.live.add(this);__counts.times.push({at:at??0,now:this.context.currentTime,duration:this.buffer?.duration});this.addEventListener('ended',()=>__counts.live.delete(this),{once:true});return start.call(this,at,...args);};
  });
  await page.goto(url);await page.waitForFunction(()=>window.__sfx?.soundEffects.pcm.size===25,null,{polling:50});
  assert.equal(await page.evaluate(()=>__counts.contexts),0);assert.equal(await page.evaluate(()=>__sfx.soundEffects.buffers.size),0);pass('all 25 cues prepare during idle time without autoplay or an audio context');
  await page.locator('#start').tap();await page.waitForFunction(()=>__sfx.audio?.state==='running',null,{polling:50});assert.equal(await page.locator('#lanes').isVisible(),false);
  for(let i=0;i<3;i++){await page.waitForTimeout(1010);await page.evaluate(()=>{for(let i=0;i<121;i++)__sfx.update(1/120);__sfx.render();});}
  assert.deepEqual(await page.evaluate(()=>__accepted.slice(0,4)),['count3','count2','count1','go']);assert.equal(await page.locator('#lanes').isVisible(),true);assert.equal(await page.evaluate(()=>__counts.contexts),1);pass('a trusted phone start plays 3, 2, 1 and GO once each on the shared context');
  await prepare(page,{y:372});await page.locator('[data-lane="0"]').tap();assert.deepEqual(await page.evaluate(()=>__accepted),['perfect']);assert.equal(await page.evaluate(()=>__sfx.game.perfects),1);assert.equal(await page.evaluate(()=>__sfx.game.score),15);pass('a perfect native delivery plays one combined cue and keeps its original score');
  await prepare(page);await page.locator('[data-lane="0"]').tap();assert.deepEqual(await page.evaluate(()=>__accepted),['load']);
  await prepare(page,{type:4});await page.locator('[data-lane="0"]').tap();assert.deepEqual(await page.evaluate(()=>__accepted),['gold']);pass('normal and golden deliveries have separate native feedback');
  await prepare(page,{fill:4});await page.locator('[data-lane="0"]').tap();assert.deepEqual(await page.evaluate(()=>__accepted),['load','dispatch']);assert.equal(await page.evaluate(()=>__sfx.game.dispatched),1);pass('a full truck adds its departure cue once and still dispatches normally');
  await prepare(page,{type:1});await page.locator('[data-lane="0"]').tap();assert.deepEqual(await page.evaluate(()=>__accepted),['wrong']);
  await prepare(page,{y:200});const lives=await page.evaluate(()=>__sfx.game.lives);await page.locator('[data-lane="0"]').tap();assert.ok(await page.evaluate(()=>__attempts.includes('early')));assert.equal(await page.evaluate(()=>__sfx.game.lives),lives);
  await page.evaluate(()=>{__sfx.loseLife('Missed');});assert.ok(await page.evaluate(()=>__attempts.includes('miss')));pass('wrong docks, missed parcels and safe early taps have distinct feedback');
  const stress=await page.evaluate(()=>{const d=__sfx;d.soundEffects.stopAll();const before=__counts.starts;for(let i=0;i<1000;i++)d.soundEffects.play(i%2?'load':'perfect',{streak:i});return {newSources:__counts.starts-before,voices:d.soundEffects.voices.size,retiring:d.soundEffects.retiring.size,buffers:d.soundEffects.buffers.size,pcm:d.soundEffects.pcm.size};});
  assert.ok(stress.newSources<=5);assert.ok(stress.voices<=4&&stress.retiring<=2&&stress.buffers<=25&&stress.pcm===25);pass('a thousand rapid requests reuse cached cues and keep live voices bounded',stress);
  await page.locator('#pause').tap();await page.waitForFunction(()=>__sfx.soundEffects.voices.size+__sfx.soundEffects.retiring.size===0,null,{polling:20});assert.equal(await page.evaluate(()=>__sfx.sound('load')),false);const accepted=await page.evaluate(()=>__accepted.length);await page.locator('#resume').tap();await page.waitForTimeout(30);assert.equal(await page.evaluate(()=>__accepted.length),accepted);pass('pause silences active effects and resume does not replay old feedback');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>__sfx.audio.state==='suspended',null,{polling:20});assert.equal(await page.evaluate(()=>__sfx.sound('win')),false);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await page.locator('#resume').tap();await page.waitForFunction(()=>__sfx.audio.state==='running',null,{polling:20});assert.equal(await page.evaluate(()=>__counts.contexts),1);assert.equal(await page.evaluate(()=>__sfx.soundEffects.voices.size),0);pass('an interrupted phone context resumes without creating another context or queuing hidden sounds');
  await page.locator('#pause').tap();await page.locator('.settings-button:visible').tap();await page.locator('#sfx-toggle').tap();assert.equal(await page.evaluate(()=>__sfx.sound('load')),false);
  await page.locator('#music-toggle').tap();await page.waitForFunction(()=>__sfx.soundtrack.active&&!__sfx.soundtrack.active.player.paused,null,{polling:50});assert.equal(await page.evaluate(()=>__sfx.settings.sfx),false);await page.locator('#music-toggle').tap();await page.locator('#sfx-toggle').tap();await page.locator('#settings-back').tap();await page.locator('#resume').tap();pass('the effects switch stays independent from music and preserves the existing settings');
  const mix=await page.evaluate(async()=>{
   const context=new OfflineAudioContext(1,48000,48000),bus=context.createGain();bus.gain.value=.2;bus.connect(context.destination);
   for(const key of ['perfect3','dispatch','goal','win']){const data=DockDashEffects.render(key),buffer=context.createBuffer(1,data.length,DockDashEffects.sampleRate);buffer.getChannelData(0).set(data);const source=context.createBufferSource(),gain=context.createGain();gain.gain.value=.3;source.buffer=buffer;source.connect(gain);gain.connect(bus);source.start(0);}
   const buffer=await context.startRendering(),data=buffer.getChannelData(0);let peak=0,power=0;for(const v of data){if(!Number.isFinite(v))throw Error('Invalid mix');peak=Math.max(peak,Math.abs(v));power+=v*v;}return {peak,rms:Math.sqrt(power/data.length),first:data[0],last:data.at(-1)};
  });assert.ok(mix.peak>.01&&mix.peak<.19);assert.ok(Math.abs(mix.first)<.00001&&Math.abs(mix.last)<.00001);pass('real Web Audio resampling and overlapping rewards retain quiet edges and ample headroom',mix);
  await page.evaluate(()=>{const d=__sfx;d.backToTitle();d.openBriefing('matchday',0);d.launchMission();d.game.readyIn=0;Object.assign(d.game,{missionElapsed:25,delivered:12,priorityLoaded:3,perfects:5,lives:3,score:100});__attempts.length=0;d.finishMission(true);});assert.ok(await page.evaluate(()=>__attempts.includes('win')));
  await page.locator('#mission-home').tap();assert.equal(await page.evaluate(()=>__sfx.soundEffects.voices.size),0);pass('mission completion uses its own victory cue and Home cancels remaining feedback');
  assert.deepEqual(errors,[]);pass('no browser runtime errors');fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,errors},null,2));
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
