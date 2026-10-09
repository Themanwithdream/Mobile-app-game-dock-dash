/* Exercise actual rendered art, audio playback and save continuity on a phone. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),url='http://127.0.0.1:8853/',out=process.env.DOCK_TEST_OUTPUT||'/tmp/dock-boss-sky-checks';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'index.html'),'utf8'),html=source.replace('  buildBelt(); parcelCache',`  window.__sky={settings,soundtrack,backToTitle,render,openBriefing,saveSnapshot,fullArtQueue,
    get state(){return state;},get location(){return activeLocation;},get game(){return game;},get art(){return pixelArt;}};
  buildBelt(); parcelCache`);assert.notEqual(html,source);
const errors=[],checks=[];function pass(name){checks.push(name);console.log('PASS '+name);}
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,url).pathname,target=path.resolve(root,'.'+pathname);if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403);res.end();return;}try{const file=pathname==='/'?'index.html':path.relative(root,target),body=file==='index.html'?html:fs.readFileSync(path.join(root,file));res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'})[path.extname(file)]||'application/octet-stream');res.end(body);}catch(_){res.writeHead(404);res.end();}});
async function ready(p,track){await p.waitForFunction(track=>__sky.soundtrack.active?.track===track&&!__sky.soundtrack.pending&&!__sky.soundtrack.active.player.paused,track);}
async function setup(context,{location=103,music=true,volume=.65}={}){
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(({location,music,volume})=>{
    localStorage.setItem('dockDashMuted','true');
    localStorage.setItem('dockDashProfileV2',JSON.stringify({tutorialDone:true,totalDelivered:180,selectedSkin:0}));
    localStorage.setItem('dockDashWalletV1',JSON.stringify({version:1,coins:2668,earned:2668,spent:0,owned:['venue:asgard']}));
    localStorage.setItem('dockDashSettingsV3',JSON.stringify({location,rotate:false,music,sfx:true,musicVolume:volume,effects:'auto'}));
    localStorage.setItem('dockDashMissionsV1',JSON.stringify({'asgard-1':{stars:2,bestScore:1200,bestTime:20}}));
  },{location,music,volume});
  await p.goto(url);await p.waitForFunction(()=>window.__sky&&(document.querySelector('.home-art').hidden||(document.querySelector('.home-art').complete&&document.querySelector('.home-art').naturalWidth>0)));
  return p;
}
(async()=>{let browser;await new Promise(r=>server.listen(8853,'127.0.0.1',r));try{
  browser=await chromium.launch({executablePath:process.env.DOCK_CHROME,args:['--no-sandbox','--autoplay-policy=document-user-activation-required']});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await setup(context);
  const before=await p.evaluate(()=>__sky.saveSnapshot());
  assert.match(await p.locator('.home-art').getAttribute('src'),/asgard\.png\?v=8\.3/);assert.match(await p.locator('.home-subtitle').textContent(),/179 places/);
  assert.equal(await p.evaluate(()=>__sky.soundtrack.active?.player.paused??true),true);
  await p.locator('.sound:visible').tap();await ready(p,2);assert.equal(await p.evaluate(()=>__sky.settings.location),103);
  await p.locator('.settings-button:visible').tap();assert.match(await p.locator('#route-theme-status').textContent(),/Runway Rush/);await ready(p,2);
  await p.locator('#settings-back').tap();await p.locator('.fleet-button:visible').tap();await ready(p,2);await p.locator('#garage-back').tap();
  assert.deepEqual(await p.evaluate(()=>__sky.saveSnapshot()),{...before,muted:false});
  pass('home, settings and shop play Air Cargo Hub music without changing the saved Asgard selection or progress');
  await p.locator('#start').tap();await ready(p,103);assert.equal(await p.locator('.home-art').getAttribute('src'),null);
  await p.evaluate(()=>__sky.backToTitle());await ready(p,2);
  pass('arcade restores its selected theme, releases the home picture and returns to Runway Rush on home');
  await p.locator('#missions').tap();await p.locator('#mission-chapter').selectOption('skyfrontiers');
  assert.deepEqual(await p.locator('.mission-card:visible').evaluateAll(a=>a.map(b=>b.dataset.world)),['bifrostskyport','lunarcargobase']);
  for(const [id,track,title] of [['bifrostskyport',180,'Above the clouds'],['lunarcargobase',181,'Earth above the bay']]){
    await p.locator(`[data-world="${id}"]`).tap();await ready(p,track);
    await p.waitForFunction(track=>!!__sky.art[track],track);
    assert.equal(await p.locator('#briefing-mission-title').textContent(),title);assert.equal(await p.locator('[data-mission-stage="0"]').isEnabled(),true);assert.equal(await p.locator('[data-mission-stage="1"]').isDisabled(),true);
    assert.deepEqual(await p.evaluate(track=>[__sky.art[track].width,__sky.art[track].height],track),[360,640]);
    await p.screenshot({path:path.join(out,id+'.png')});await p.locator('#briefing-back').tap();await ready(p,2);
  }
  pass('both new routes appear in Sky & Space with their own loaded art, free opening missions and distinct themes');
  const hubContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),hub=await setup(hubContext,{location:2});
  assert.match(await hub.locator('.home-art').getAttribute('src'),/heroes\/air-cargo-hub\.webp/);assert.deepEqual(await hub.locator('.home-art').evaluate(e=>[e.naturalWidth,e.naturalHeight]),[720,480]);
  for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
    await hub.setViewportSize(size);await hub.waitForTimeout(100);
    assert.equal(await hub.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const image=await hub.locator('.home-art').boundingBox();assert.ok(image.width>50&&image.height>=60);
  }
  await hub.setViewportSize({width:390,height:844});await hub.screenshot({path:path.join(out,'air-cargo-home.png')});
  pass('the Air Cargo Hub scenic hero loads and fits small phone, portrait and landscape menus');
  const harbourContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),harbour=await setup(harbourContext,{location:1});
  assert.equal(await harbour.locator('.home-art').isVisible(),false);assert.equal(await harbour.locator('.home-hero canvas').isVisible(),true);
  await harbour.locator('.sound:visible').tap();await ready(harbour,2);await harbourContext.close();
  pass('Harbour Depot keeps its drawn home preview while using Runway Rush');
  for(const option of [{music:false},{volume:0}]){
    const quietContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),quiet=await setup(quietContext,option);
    await quiet.locator('.sound:visible').tap();await quiet.waitForTimeout(200);
    assert.equal(await quiet.evaluate(()=>__sky.soundtrack.active?.player.paused??true),true);await quietContext.close();
  }
  pass('saved music-off and zero-volume choices prevent the home theme from playing');
  assert.deepEqual(errors,[]);pass('no browser exceptions');
  fs.writeFileSync(path.join(out,'sky-routes-results.json'),JSON.stringify({checks,errors},null,2));
}finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
