/* Actual audio-clock playback and offline PCM checks at every soundtrack join. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.DOCK_TEST_OUTPUT||path.join(os.tmpdir(),'dock-dash-music-loop-checks'),url='http://127.0.0.1:8848/';
fs.mkdirSync(output,{recursive:true});
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const html=source.replace('  buildBelt(); parcelCache',`  window.__dockTest={soundtrack,wakeAudio,tickMusic,render,startGame,backToTitle,openBriefing,launchMission,settings,profile,
 get audio(){return audio;},get game(){return game;},get state(){return state;},get location(){return activeLocation;},get art(){return pixelArt;}};
  buildBelt(); parcelCache`);
assert.notEqual(html,source);const checks=[],errors=[];
function pass(name,detail){checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));}
async function setup(page,{failDecode=false}={}){
 await page.route(url,r=>r.fulfill({contentType:'text/html',body:html}));
 await page.addInitScript(failDecode=>{
  window.requestAnimationFrame=()=>0;localStorage.setItem('dockDashMuted','true');localStorage.setItem('dockDashProfileV2',JSON.stringify({tutorialDone:true,totalDelivered:180,selectedSkin:0}));
  window.__audioCounts={sources:0,nativePlays:0,targets:0};
  const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...args){if(this.loop)__audioCounts.sources++;return start.apply(this,args);};
  const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){__audioCounts.nativePlays++;return play.call(this);};
  const target=AudioParam.prototype.setTargetAtTime;AudioParam.prototype.setTargetAtTime=function(...args){__audioCounts.targets++;return target.apply(this,args);};
  if(failDecode)AudioContext.prototype.decodeAudioData=async()=>{throw new Error('unsupported codec');};
 },failDecode);
 page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForFunction(()=>window.__dockTest && __dockTest.art[0],null,{polling:50});
}
async function ready(page,track){await page.waitForFunction(track=>__dockTest.soundtrack.active?.track===track && !__dockTest.soundtrack.pending && !__dockTest.soundtrack.active.player.paused && __dockTest.soundtrack.active.player.readyState>=3,track,{polling:50});}
(async()=>{
 const server=spawn('python',['-m','http.server','8848','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;
 try{
  for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:process.env.DOCK_CHROME||'/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell',args:['--no-sandbox','--autoplay-policy=document-user-activation-required']});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage();await setup(page);
  assert.equal(await page.evaluate(()=>__audioCounts.sources+__audioCounts.nativePlays),0);assert.equal(await page.evaluate(()=>__dockTest.audio),null);
  await page.locator('.sound:visible').tap();await ready(page,0);
  const primary=await page.evaluate(()=>{const s=__dockTest.soundtrack,p=s.active.player;return {voices:s.slots.length,loop:p.source.loop,end:p.source.loopEnd,duration:p.buffer.duration,context:p.context===__dockTest.audio,native:__audioCounts.nativePlays,decoded:s.pool.entries.size,bytes:p.buffer.length*p.buffer.numberOfChannels*4};});
  assert.equal(primary.voices,1);assert.equal(primary.loop,true);assert.equal(primary.end,primary.duration);assert.equal(primary.context,true);assert.equal(primary.native,0);assert.equal(primary.decoded,1);assert.ok(primary.bytes<31*1024*1024);
  pass('a phone starts one bounded buffered voice on the shared effects context, after a gesture',primary);
  const seams=await page.evaluate(async()=>{
   const tracks=JSON.parse(document.getElementById('bundled-media').textContent).music,results=[];
   for(const src of tracks){
    const decoder=new OfflineAudioContext(2,1,12000),buffer=await decoder.decodeAudioData(await (await fetch(src)).arrayBuffer());
    const length=buffer.length;DockDashLoopPlayer.prepare(buffer);
    const offline=new OfflineAudioContext(2,length*2+360,buffer.sampleRate),voice=offline.createBufferSource();voice.buffer=buffer;voice.loop=true;voice.loopEnd=buffer.duration;voice.connect(offline.destination);voice.start();
    const output=await offline.startRendering();let error=0,jump=0,quiet=0,peak=0;
    for(let ch=0;ch<2;ch++){
     const input=buffer.getChannelData(ch),data=output.getChannelData(ch);
     jump=Math.max(jump,Math.abs(input[0]-input[length-1]));
     for(const boundary of [length,length*2])for(let i=boundary-180;i<boundary+180;i++)error=Math.max(error,Math.abs(data[i]-input[i%length]));
     for(let i=0;i<input.length;i++)peak=Math.max(peak,Math.abs(input[i]));
     for(const boundary of [length,length*2]){let silence=0;for(let i=boundary-180;i<boundary+180;i++){silence=Math.abs(data[i])<1e-7?silence+1:0;quiet=Math.max(quiet,silence);}}
    }
    results.push({src,seconds:buffer.duration,frames:length,rendered:output.length,error,jump,quiet,peak});
   }
   return results;
  });
  for(const s of seams){assert.equal(s.rendered,s.frames*2+360);assert.equal(s.jump,0);assert.ok(s.error<.0001,JSON.stringify(s));assert.ok(s.quiet<12,JSON.stringify(s));assert.ok(s.peak<1,JSON.stringify(s));}
  pass('all 103 tracks render two complete repeats with continuous samples, no silent gap and no clipping',seams);
  await page.evaluate(async()=>{const p=__dockTest.soundtrack.active.player;p.currentTime=p.buffer.duration-.06;await p.play();window.__repeatSource=p.source;window.__beforeRepeat={...__audioCounts,decodes:__dockTest.soundtrack.pool.decodes};});
  await page.waitForTimeout(180);
  const repeat=await page.evaluate(()=>{const s=__dockTest.soundtrack,p=s.active.player;return {position:p.currentTime,same:p.source===__repeatSource,sources:__audioCounts.sources-__beforeRepeat.sources,native:__audioCounts.nativePlays-__beforeRepeat.nativePlays,decodes:s.pool.decodes-__beforeRepeat.decodes};});
  assert.equal(repeat.same,true);assert.equal(repeat.sources,0);assert.equal(repeat.native,0);assert.equal(repeat.decodes,0);assert.ok(repeat.position>0 && repeat.position<1);
  pass('actual playback crosses the repeat boundary without seeking, restarting, allocating a voice or decoding again',repeat);
  const busy=await page.evaluate(()=>{const p=__dockTest.soundtrack.active.player,source=p.source,before=p.currentTime,start=performance.now();while(performance.now()-start<180){}return {advance:p.currentTime-before,same:p.source===source};});
  assert.ok(busy.advance>.12);assert.equal(busy.same,true);pass('audio continues while the JavaScript thread is busy and the canvas frame loop is stopped',busy);
  await page.locator('#start').tap();await ready(page,0);
  const stable=await page.evaluate(()=>{const d=__dockTest;d.game.readyIn=0;d.game.hold=100;d.render();const before={...__audioCounts,decodes:d.soundtrack.pool.decodes};for(let i=0;i<1000;i++){d.game.hot=i%2?10:0;d.tickMusic();d.wakeAudio();if(i<120)d.render();}return {sources:__audioCounts.sources-before.sources,native:__audioCounts.nativePlays-before.nativePlays,targets:__audioCounts.targets-before.targets,decodes:d.soundtrack.pool.decodes-before.decodes,rate:d.soundtrack.active.player.playbackRate};});
  assert.deepEqual(stable,{sources:0,native:0,targets:0,decodes:0,rate:1});pass('repeated touches, hot streaks and 120 game renders add no audio work or pitch changes',stable);
  await page.locator('#pause').tap();const position=await page.evaluate(()=>__dockTest.soundtrack.active.player.currentTime);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>__dockTest.soundtrack.active.player.currentTime),position);
  await page.locator('#resume').tap();await ready(page,0);assert.ok(await page.evaluate(()=>__dockTest.soundtrack.active.player.currentTime)>=position);assert.equal(await page.evaluate(()=>__dockTest.soundtrack.pool.decodes),1);
  pass('pause freezes the position and resume reuses the decoded song');
  await page.evaluate(async()=>{window.__interruptedSource=__dockTest.soundtrack.active.player.source;await __dockTest.audio.suspend();});
  await page.waitForFunction(()=>__dockTest.soundtrack.blocked,null,{polling:50});await page.locator('#game').tap({position:{x:18,y:120}});await ready(page,0);
  assert.equal(await page.evaluate(()=>__dockTest.soundtrack.active.player.source===__interruptedSource),true);
  pass('a suspended audio context recovers in the next touch gesture without replacing the loop source');
  for(const world of ['matchday','beacon','school','arctic','rome','egypt','viking','silkroad','diner','robot','prism']){await page.evaluate(world=>__dockTest.openBriefing(world,0),world);const track=await page.evaluate(()=>__dockTest.location);await ready(page,track);assert.equal(await page.evaluate(()=>__dockTest.soundtrack.pool.entries.size),1);assert.equal(await page.evaluate(()=>__dockTest.soundtrack.slots.filter(s=>!s.player.paused).length),1);assert.equal(await page.evaluate(()=>__audioCounts.nativePlays),0);}
  pass('theme changes keep one phone voice and one cached decoded theme');
  await page.evaluate(()=>__dockTest.backToTitle());await ready(page,0);await page.locator('.sound:visible').tap();assert.equal(await page.evaluate(()=>__dockTest.soundtrack.active.player.paused),true);
  pass('mute stops the looping source immediately');
  const failedContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),fallback=await failedContext.newPage();await setup(fallback,{failDecode:true});
  await fallback.locator('.sound:visible').tap();await ready(fallback,0);assert.equal(await fallback.evaluate(()=>__dockTest.soundtrack.active.player.fallback),true);assert.equal(await fallback.evaluate(()=>__audioCounts.sources),0);assert.equal(await fallback.evaluate(()=>__audioCounts.nativePlays),1);await fallback.locator('.sound:visible').tap();assert.equal(await fallback.evaluate(()=>document.querySelector('audio').paused),true);
  pass('an unsupported decoder retains working single-player native music and mute');
  assert.deepEqual(errors,[]);pass('no browser runtime errors');fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,errors},null,2));
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
