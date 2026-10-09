/* Real touch gestures, native menus and lifecycle checks. Hooks exist only in test responses. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),url='http://127.0.0.1:8852/',checks=[],errors=[];
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const html=source.replace('  buildBelt(); parcelCache',`  window.__phone={engine,fullArtQueue,settings,profile,backups,fit,update,render,startGame,pauseGame,backToTitle,openMissionMap,openBriefing,finishMission,saveSnapshot,
    get state(){return state;},get game(){return game;},get paused(){return paused;},get art(){return pixelArt;},get records(){return missionRecords;}};
  buildBelt(); parcelCache`);assert.notEqual(html,source);
function pass(name){checks.push(name);console.log('PASS '+name);}
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,url).pathname,target=path.resolve(root,'.'+pathname);if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403);res.end();return;}try{const file=target===root||pathname==='/'?'index.html':path.relative(root,target),body=file==='index.html'?html:fs.readFileSync(path.join(root,file));res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.json':'application/json','.webmanifest':'application/manifest+json'})[path.extname(file)]||'application/octet-stream');res.end(body);}catch(_){res.writeHead(404);res.end();}});
async function controls(page){
 const result=await page.evaluate(()=>{
  const stage=document.getElementById('stage').getBoundingClientRect(),visible=e=>!e.closest('[hidden]')&&e.getBoundingClientRect().width>0;
  return [...document.querySelectorAll('#stage button,#stage input,#stage select')].filter(visible).filter(e=>!e.closest('.ui-scroll,.briefing-scroll,.settings-scroll,dialog')).map(e=>{const b=e.getBoundingClientRect();return {id:e.id||e.dataset.world||e.dataset.item||e.className,h:b.height,w:b.width,contained:b.left>=stage.left-1&&b.right<=stage.right+1&&b.top>=stage.top-1&&b.bottom<=stage.bottom+1};});
 });
 for(const control of result){assert.ok(control.h>=43.5,`${control.id} has ${control.h}px height`);assert.ok(control.contained,`${control.id} outside stage`);}
}
async function swipe(page,selector){
 const box=await page.locator(selector).boundingBox(),cdp=await page.context().newCDPSession(page),x=box.x+box.width*.7,y=box.y+box.height*.8;
 const before=await page.locator(selector).evaluate(e=>e.scrollTop);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*Math.min(25,box.height/12)}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 await page.waitForFunction(({selector,before})=>document.querySelector(selector).scrollTop>before,{selector,before});
}
(async()=>{
 await new Promise(resolve=>server.listen(8852,'127.0.0.1',resolve));let browser,page;
 const output=process.env.DOCK_TEST_OUTPUT||path.join(root,'phone-test-output');fs.mkdirSync(output,{recursive:true});
 try{
  browser=await chromium.launch({executablePath:process.env.DOCK_CHROME||undefined,headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('dockDashMuted','true');localStorage.setItem('dockDashBest','12345');localStorage.setItem('dockDashProfileV2',JSON.stringify({tutorialDone:true,totalDelivered:180,selectedSkin:2}));localStorage.setItem('dockDashWalletV1',JSON.stringify({version:1,coins:5000,earned:5000,spent:0,owned:[]}));localStorage.setItem('dockDashMissionsV1',JSON.stringify({'rome-1':{stars:3,bestScore:1000,fastest:20}}));});
  await page.goto(url);await page.waitForFunction(()=>window.__phone&&__phone.art[0]);
  const original=await page.evaluate(()=>__phone.saveSnapshot());
  assert.equal(await page.locator('meta[name="dock-dash-version"]').getAttribute('content'),'8.2-phone-edition');
  for(const size of [{width:320,height:568},{width:390,height:844},{width:430,height:932},{width:844,height:390},{width:1280,height:800}]){
   await page.setViewportSize(size);await page.locator('#start').waitFor();await controls(page);
   await page.locator('#missions').tap();await controls(page);
   assert.ok(await page.locator('.world-cards .card-name').first().innerText());assert.equal(await page.locator('#mission-search').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)),16);
   await page.locator('#mission-chapter').selectOption('openroads');await page.locator('#mission-search').fill('Asgard');assert.equal(await page.locator('.mission-card:visible').count(),1);
   await page.locator('.mission-card:visible').tap();await controls(page);assert.match(await page.locator('#mission-briefing-title').innerText(),/Asgard/);
   await page.locator('#mission-home').tap();await page.locator('.title-menu .fleet-button').tap();await controls(page);
   assert.ok(await page.locator('.shop-cards .card-name').first().innerText());await page.locator('#garage-back').tap();
   await page.locator('.title-menu .catalog-button').tap();await controls(page);const firstCargo=await page.locator('.cargo-name').first().innerText();await page.locator('#catalog-next').tap();const nextCargo=await page.locator('.cargo-name').first().innerText();assert.notEqual(nextCargo,firstCargo);assert.ok((await page.locator('.cargo-choice').first().getAttribute('aria-label')).startsWith(nextCargo+'.'));await page.locator('#catalog-back').tap();
  }
  pass('Home, missions, briefing, shop and collection have contained 44px controls at five screen sizes');
  assert.deepEqual(await page.evaluate(()=>__phone.saveSnapshot()),original);pass('native browsing preserves existing coins, purchases, stars, cargo and best score');
  await page.setViewportSize({width:390,height:844});await page.locator('#missions').tap();await page.locator('#mission-chapter').selectOption('');await page.locator('#mission-search').fill('');await page.locator('#mission-journal').tap();
  await swipe(page,'#story-content');await page.locator('#story-close').tap();await page.locator('#story-dialog').waitFor({state:'hidden'});assert.equal(await page.evaluate(()=>__phone.state),'missions');pass('long story journal scrolls with a real phone swipe and keeps Close available');
  await page.locator('#mission-search').fill('Asgard');await page.waitForFunction(()=>document.getElementById('mission-search').value==='Asgard'&&document.querySelectorAll('.mission-card:not([hidden])').length===1);await page.locator('.mission-card:visible').tap();await swipe(page,'#briefing-scroll');await page.locator('#mission-launch').tap();
  await page.waitForFunction(()=>__phone.game.readyIn===0);await page.locator('#pause').tap();const beforePause=await page.evaluate(()=>({elapsed:__phone.game.missionElapsed,lives:__phone.game.lives,parcels:__phone.game.parcels.map(p=>p.y)}));
  await page.waitForTimeout(150);assert.deepEqual(await page.evaluate(()=>({elapsed:__phone.game.missionElapsed,lives:__phone.game.lives,parcels:__phone.game.parcels.map(p=>p.y)})),beforePause);await controls(page);
  await page.locator('#resume').tap();await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>__phone.paused);await controls(page);
  await page.locator('#resume').tap();assert.equal(await page.locator('.stage').getAttribute('class'),'stage wide');
  for(const button of await page.locator('.lane-input:enabled').all()){const box=await button.boundingBox();assert.ok(box.width>=112&&box.height>=98);}
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));assert.equal(await page.evaluate(()=>__phone.paused),true);
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));assert.equal(await page.evaluate(()=>__phone.paused),true);
  await page.locator('#mission-home').tap();pass('swipe briefing, pause, rotation and restored pages preserve the run and require an explicit resume');
  await page.setViewportSize({width:390,height:844});await page.locator('.title-menu .settings-button').tap();await swipe(page,'#settings-scroll');await page.locator('#settings-sound-jump').tap();await page.locator('#preferences-open').tap();
  assert.equal(await page.locator('#preferences-dialog').isVisible(),true);const validBackup=await page.evaluate(()=>{const data=__phone.saveSnapshot();return {data,restored:__phone.backups.read(__phone.backups.export(data)).data};});assert.deepEqual(validBackup.restored,validBackup.data);await page.locator('#preferences-close').tap();await page.locator('#settings-back').tap();pass('settings and save controls remain reachable by touch, with an exact backup round trip');
  await page.locator('#missions').tap();for(let i=0;i<15;i++){if(await page.locator('#missions-next').isEnabled())await page.locator('#missions-next').tap();}
  const requests=await page.evaluate(()=>({active:__phone.fullArtQueue.active.size,queued:__phone.fullArtQueue.jobs.size}));assert.ok(requests.active<=2&&requests.queued<=4);pass('fast browsing stays within the two-request full-art limit');
  assert.deepEqual(errors,[]);pass('no browser runtime errors');
  await page.locator('#mission-home').tap();await page.screenshot({path:path.join(output,'phone-home.png')});
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,errors},null,2));await context.close();
 }catch(error){
  if(page){await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});const state=await page.evaluate(()=>({state:__phone.state,dialogOpen:document.getElementById('story-dialog').open,search:document.getElementById('mission-search').value,focused:document.activeElement?.id,worlds:[...document.querySelectorAll('.mission-card:not([hidden])')].map(e=>e.dataset.world)})).catch(()=>null);fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({error:error.message,checks,errors,state},null,2));console.error('Failure state: '+JSON.stringify(state));}
  throw error;
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
