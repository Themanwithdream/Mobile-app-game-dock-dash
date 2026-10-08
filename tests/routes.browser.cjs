/* Route search, native card layouts, touch scrolling and paused-run shopping. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.DOCK_TEST_OUTPUT||path.join(os.tmpdir(),'dock-dash-routes'),url='http://127.0.0.1:8867/';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'index.html'),'utf8'),html=source.replace('  buildBelt(); parcelCache',`  window.__routes={MR,ER,LOCATIONS,settings,profile,render,searchRoutes,syncSettings,backToTitle,openBriefing,launchMission,pauseGame,update,previewFloors,
 get state(){return state;},get game(){return game;},get paused(){return paused;},get scene(){return activeLocation;},get wallet(){return wallet;},setWallet(value){wallet=value;}};
  buildBelt(); parcelCache`);assert.notEqual(html,source);
const checks=[],errors=[],pass=(name,detail)=>{checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));};
async function places(p){return p.locator('.location-choice:visible').evaluateAll(a=>a.map(b=>Number(b.dataset.location)));}
async function paint(p){await p.evaluate(()=>__routes.render());}
async function open(p){await p.locator('.settings-button:visible').tap();await paint(p);}
async function snapshotRun(p){return p.evaluate(()=>{const g=__routes.game;return {mission:g.mission.id,score:g.score,lives:g.lives,time:g.missionElapsed,parcels:g.parcels.map(p=>({type:p.type,product:p.product,y:p.y})),trucks:g.trucks.map(t=>({type:t.type,fill:t.fill})),ready:g.readyIn};});}
(async()=>{const server=spawn('python',['-m','http.server','8867','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;
try{
 for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.DOCK_CHROME||'/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell',args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:664},hasTouch:true,isMobile:true,deviceScaleFactor:2}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.route(url,r=>r.fulfill({contentType:'text/html',body:html}));await p.addInitScript(()=>{
  requestAnimationFrame=()=>0;localStorage.setItem('dockDashMuted','true');
  localStorage.setItem('dockDashProfileV2',JSON.stringify({tutorialDone:true,totalDelivered:240,selectedSkin:0}));
  localStorage.setItem('dockDashWalletV1',JSON.stringify({version:1,coins:5000,earned:7000,spent:2000,owned:['venue:rome','venue:matchday']}));
  localStorage.setItem('dockDashSettingsV3',JSON.stringify({location:2,music:false,sfx:true,musicVolume:.65,rotate:false,effects:'auto'}));
 });await p.goto(url);await p.waitForFunction(()=>window.__routes,null,{polling:50});await open(p);
 assert.deepEqual(await places(p),[0,1,2]);assert.equal(await p.locator('[data-location="2"]').getAttribute('aria-pressed'),'true');
 assert.match(await p.locator('#route-selected-label').textContent(),/Air cargo hub/);assert.equal(await p.locator('#settings-back').textContent(),'Back to home←');
 assert.equal(await p.locator('.route-name:visible').count(),3);assert.equal(await p.locator('.route-check:visible').count(),1);await p.screenshot({path:path.join(out,'places-phone.png')});
 pass('the existing selected place is restored with readable native labels and one checkmark');

 const initialWallet=await p.evaluate(()=>JSON.parse(JSON.stringify(__routes.wallet)));await p.locator('#routes-next').tap();assert.equal((await places(p)).length,2);assert.equal(await p.locator('#routes-next').isDisabled(),true);await p.locator('#routes-prev').tap();assert.deepEqual(await places(p),[0,1,2]);
 await p.locator('#route-search').fill('roman empire');assert.deepEqual(await places(p),[13]);await p.locator('[data-location="13"]').tap();assert.equal(await p.evaluate(()=>__routes.settings.location),13);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('dockDashSettingsV3')).location),13);assert.deepEqual(await p.evaluate(()=>__routes.wallet),initialWallet);
 pass('pagination and multiword search select the correct owned world without spending coins');

 await p.locator('#route-search').fill('no such planet');assert.deepEqual(await places(p),[]);assert.equal(await p.locator('#routes-empty').isVisible(),true);assert.equal(await p.locator('#routes-pagination').isVisible(),false);await p.locator('#routes-clear').tap();assert.deepEqual(await places(p),[0,1,2]);
 await p.locator('#route-search').fill('air cargo');await p.keyboard.press('Escape');assert.equal(await p.locator('#route-search').inputValue(),'');assert.equal(await p.evaluate(()=>__routes.state),'settings');assert.deepEqual(await places(p),[0,1,2]);
 pass('empty searches are recoverable and Escape clears search before leaving the screen');

 const all=await p.evaluate(()=>{
  const d=__routes,old=d.wallet;d.setWallet({...old,owned:d.ER.venues.filter(v=>v.price).map(v=>v.id)});const rows=[];
  for(let index=0;index<d.LOCATIONS.length;index++){
   d.searchRoutes(d.LOCATIONS[index].name);const cards=[...document.querySelectorAll('.location-choice:not([hidden])')];
   rows.push({index,found:cards.some(b=>Number(b.dataset.location)===index),fits:cards.every(b=>b.scrollWidth<=b.clientWidth+1)});
  }
  d.setWallet(old);d.searchRoutes('');return rows;
 });assert.equal(all.length,180);for(const row of all){assert.equal(row.found,true,JSON.stringify(row));assert.equal(row.fits,true,JSON.stringify(row));}
 pass('all 180 arcade places remain searchable when owned, including every story world');

 const footer=await p.locator('#settings-back').boundingBox(),scroll=await p.locator('#settings-scroll').boundingBox(),cdp=await context.newCDPSession(p),x=scroll.x+scroll.width*.65,y=scroll.y+scroll.height*.8;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-scroll.height*.65*i/8}]});await new Promise(r=>setTimeout(r,20));}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 await p.waitForFunction(()=>document.getElementById('settings-scroll').scrollTop>30,null,{polling:50});assert.deepEqual(await p.locator('#settings-back').boundingBox(),footer);
 await p.locator('#settings-sound-jump').tap();assert.equal(await p.locator('#music-toggle').evaluate(b=>b===document.activeElement),true);assert.deepEqual(await p.locator('#settings-back').boundingBox(),footer);assert.equal(await p.locator('#stage').evaluate(e=>e.scrollTop),0);await p.screenshot({path:path.join(out,'audio-phone.png')});
 pass('trusted touch swipes and the Audio shortcut reach settings while Back stays fixed');

 await p.locator('#sfx-toggle').tap();assert.equal(await p.evaluate(()=>__routes.settings.sfx),false);assert.equal(await p.evaluate(()=>__routes.settings.music),false);await p.locator('#music-volume').focus();await p.keyboard.press('End');await p.keyboard.press('ArrowLeft');assert.equal(await p.evaluate(()=>__routes.settings.musicVolume),.99);assert.equal(await p.locator('#music-volume').getAttribute('aria-valuetext'),'99 percent');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('dockDashSettingsV3')).sfx),false);
 await p.locator('#rotate-locations').tap();assert.match(await p.locator('#route-tour-hint').textContent(),/all 5 owned places.*two arcade shifts/);await p.locator('#preferences-open').tap();assert.equal(await p.locator('#preferences-dialog').isVisible(),true);await p.locator('#preferences-close').tap();
 pass('effects, accessible keyboard volume, tour mode and save preferences retain independent saved controls');

 await p.locator('#settings-scroll').evaluate(e=>e.scrollTop=0);await p.locator('#routes-shop').tap();assert.equal(await p.evaluate(()=>__routes.state),'garage');assert.equal(await p.locator('#garage-back').getAttribute('aria-label'),'Back to routes and audio');assert.equal(await p.locator('[data-shop="venues"]').getAttribute('aria-pressed'),'true');
 const school=await p.evaluate(()=>__routes.ER.venues.find(v=>v.id==='venue:school'));await p.locator('#shop-search').fill(school.name);await p.locator('[data-item="venue:school"]').tap();const coins=await p.evaluate(()=>__routes.wallet.coins);assert.equal(coins,initialWallet.coins-school.price);await p.locator('[data-item="venue:school"]').tap();assert.equal(await p.evaluate(()=>__routes.wallet.coins),coins);await p.locator('#garage-back').tap();assert.equal(await p.evaluate(()=>__routes.state),'settings');assert.equal(await p.locator('#routes-shop').evaluate(b=>b===document.activeElement),true);await p.locator('#route-search').fill(school.name);assert.deepEqual(await places(p),[school.location]);assert.equal(await p.locator(`[data-location="${school.location}"]`).getAttribute('aria-pressed'),'true');
 pass('Shop places opens the correct category, buys once and returns to the updated route list');

 await p.locator('#settings-back').tap();await p.evaluate(()=>{__routes.openBriefing('rome',0);__routes.launchMission();__routes.update(3.01);__routes.pauseGame(true);});const run=await snapshotRun(p);await open(p);assert.equal(await p.locator('#settings-back').textContent(),'Back to paused game←');await p.locator('#routes-shop').tap();await p.locator('[data-item="venue:harbour"]').tap();assert.equal(await p.evaluate(()=>__routes.scene),13);await p.locator('#garage-back').tap();await p.locator('#settings-back').tap();assert.equal(await p.evaluate(()=>__routes.state),'play');assert.equal(await p.evaluate(()=>__routes.paused),true);assert.deepEqual(await snapshotRun(p),run);await p.locator('#resume').tap();assert.equal(await p.evaluate(()=>__routes.paused),false);assert.deepEqual(await snapshotRun(p),run);
 pass('route shopping from a paused mission preserves its parcels, score, timer and mission theme');

 await p.evaluate(()=>__routes.backToTitle());await open(p);const layouts=[];
 for(const size of [{width:320,height:568},{width:390,height:664},{width:414,height:896},{width:844,height:390},{width:1100,height:800}]){
  await p.setViewportSize(size);await p.waitForTimeout(80);await p.locator('#settings-scroll').evaluate(e=>e.scrollTop=0);await paint(p);
  const bounds=await p.evaluate(()=>{
   const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
   return {stage:box(document.getElementById('stage')),header:box(document.querySelector('.settings-header')),scroll:box(document.getElementById('settings-scroll')),footer:box(document.querySelector('.settings-footer'))};
  });assert.ok(bounds.header.y+bounds.header.h<=bounds.scroll.y+1,JSON.stringify({size,bounds}));assert.ok(bounds.scroll.y+bounds.scroll.h<=bounds.footer.y+1,JSON.stringify({size,bounds}));
  for(const b of await p.locator('#settings-menu button:visible,#settings-menu input:visible').all()){
   await b.scrollIntoViewIfNeeded();const r=await b.boundingBox();assert.ok(r.x>=bounds.stage.x-.5&&r.x+r.width<=bounds.stage.x+bounds.stage.w+.5,JSON.stringify({size,r}));assert.ok(await b.evaluate(e=>e.scrollWidth<=e.clientWidth+1));if(await b.evaluate(e=>e.closest('.settings-scroll')!==null))assert.ok(r.height>=43.5);
  }
  await p.locator('#settings-scroll').evaluate(e=>e.scrollTop=0);await p.screenshot({path:path.join(out,`places-${size.width}x${size.height}.png`)});layouts.push(size);
 }
 pass('five phone, landscape and desktop layouts have contained text, 44-pixel controls and separate fixed header/footer',layouts);

 const caches=await p.evaluate(()=>({previews:__routes.previewFloors.entries.size,canvases:document.querySelectorAll('.route-preview').length}));assert.ok(caches.previews<=7);assert.equal(caches.canvases,3);pass('route browsing reuses three thumbnails and the existing bounded preview cache',caches);
 assert.deepEqual(errors,[]);pass('no browser runtime errors');fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
