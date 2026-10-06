/* Expanded shop: real touch purchases, themed arcade routes and cached styles. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.DOCK_TEST_OUTPUT||path.join(os.tmpdir(),'dock-dash-shop-checks'),url='http://127.0.0.1:8846/';
fs.mkdirSync(output,{recursive:true});const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const html=source.replace('  buildBelt(); parcelCache',`  window.__dockTest={ER,MR,SKINS,profile,settings,progress,openGarage,closeGarage,selectShopItem,changeShopCategory,changeShopPage,openOverlay,closeOverlay,openBriefing,launchMission,openMissionMap,startGame,backToTitle,pauseGame,routeLocation,pickProduct,spawnParcel,parcelSprite,zoneSprite,render,update,trucksForSkin,parcelSprites,zoneSprites,previewFloors,soundtrack,COLORS,
 get wallet(){return wallet;},get state(){return state;},get game(){return game;},get location(){return activeLocation;},get art(){return pixelArt;}};
  buildBelt(); parcelCache`);
assert.notEqual(html,source);const checks=[],errors=[];
function pass(name,detail){checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));}
async function paint(page){await page.evaluate(()=>__dockTest.render());}
async function setup(page,seed={}){
 await page.route(url,r=>r.fulfill({contentType:'text/html',body:html}));
 await page.addInitScript(seed=>{
   window.requestAnimationFrame=()=>0;
   if(!localStorage.getItem('dockDashProfileV2')){
     localStorage.setItem('dockDashProfileV2',JSON.stringify({totalDelivered:180,totalPerfect:60,totalTrucks:20,totalGoals:10,highestShift:8,tutorialDone:true,selectedSkin:7,...seed.profile}));
     localStorage.setItem('dockDashWalletV1',JSON.stringify({version:1,coins:20000,earned:20720,spent:720,owned:['batcave','school'],...seed.wallet}));
     if(seed.settings)localStorage.setItem('dockDashSettingsV3',JSON.stringify(seed.settings));
   }
   localStorage.setItem('dockDashMuted','true');
   window.__counts={canvases:0,storage:0,blur:0};const create=document.createElement.bind(document);document.createElement=(tag,...args)=>{if(tag==='canvas')__counts.canvases++;return create(tag,...args);};
   const save=Storage.prototype.setItem;window.__save=save;Storage.prototype.setItem=function(...args){__counts.storage++;return save.apply(this,args);};
   const blur=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'shadowBlur');Object.defineProperty(CanvasRenderingContext2D.prototype,'shadowBlur',{...blur,set(v){if(v>0)__counts.blur++;return blur.set.call(this,v);}});
 },seed);page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForFunction(()=>window.__dockTest && __dockTest.art[0],null,{polling:50});
}
const overlap=(a,b)=>a.x<b.x+b.width && a.x+a.width>b.x && a.y<b.y+b.height && a.y+a.height>b.y;
(async()=>{
 const server=spawn('python',['-m','http.server','8846','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;
 try {
   for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
   browser=await chromium.launch({executablePath:process.env.DOCK_CHROME||'/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell',args:['--no-sandbox']});
   const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2}),page=await context.newPage();await setup(page);
   assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),20000);assert.equal(await page.evaluate(()=>__dockTest.profile.selectedSkin),7);
   pass('an existing wallet and original paid fleet survive the catalog expansion unchanged');
   await page.locator('.fleet-button:visible').tap();await page.locator('#shop-next').tap();await page.locator('#shop-next').tap();await paint(page);
   await page.screenshot({path:path.join(output,'batmobile-tumbler-shop.png')});
   await page.locator('[data-item="batmobile"]').tap();for(let i=0;i<4;i++)await page.locator('[data-item="batmobile"]').tap();
   assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),19100);assert.equal(await page.evaluate(()=>__dockTest.profile.selectedSkin),14);
   assert.equal(await page.locator('[data-item="batmobile"]').getAttribute('aria-pressed'),'true');
   pass('native touch buys the Batmobile, equips it and never charges repeated taps');
   await page.locator('#shop-next').tap();await paint(page);assert.equal(await page.locator('.skin-choice:visible').count(),4);assert.equal(await page.locator('#shop-next').isDisabled(),true);
   await page.screenshot({path:path.join(output,'special-edition-shop.png')});
   const plates=await page.evaluate(()=>__dockTest.SKINS.slice(14).map((skin,j)=>__dockTest.trucksForSkin(j+14).map((image,type)=>{
     const scale=image.width/90,pixel=Array.from(image.getContext('2d').getImageData(45*scale,43*scale,1,1).data),ink=__dockTest.COLORS[type].ink;
     return {id:skin.id,type,size:[image.width,image.height],pixel,expected:[1,3,5].map(n=>parseInt(ink.slice(n,n+2),16)).concat(255)};
   })).flat());for(const p of plates){assert.deepEqual(p.size,[180,282]);assert.deepEqual(p.pixel,p.expected,JSON.stringify(p));}
   pass('all six special bodies retain four large, readable colour and shape plates');
   await page.locator('[data-shop="venues"]').tap();await paint(page);assert.equal(await page.locator('[data-item="venue:warehouse"]').getAttribute('aria-pressed'),'true');
   await page.locator('#shop-next').tap();await page.locator('[data-item="venue:batcave"]').tap();await paint(page);
   assert.equal(await page.evaluate(()=>__dockTest.settings.location),7);assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),18600);
   await page.waitForFunction(()=>!!__dockTest.art[7],null,{polling:50});await paint(page);await page.screenshot({path:path.join(output,'arcade-places-shop.png')});
   pass('an arcade place purchase selects its scenery and costs exactly its listed price');
   await page.locator('#garage-back').tap();await page.locator('#start').tap();
   const bat=await page.evaluate(()=>{const d=__dockTest,products=Array.from({length:48},()=>d.pickProduct());return {mission:d.game.mission,location:d.location,ready:d.game.readyIn,initial:d.game.parcels.map(p=>p.product),products,expected:d.MR.getMission('batcave',0).products};});
   assert.equal(bat.mission,null);assert.equal(bat.location,7);assert.equal(bat.ready,3);for(const id of [...bat.initial,...bat.products])assert.ok(bat.expected.includes(id));
   assert.equal(new Set([...bat.initial,...bat.products.slice(0,9)]).size,12);
   await page.evaluate(()=>{__dockTest.game.readyIn=0;__dockTest.render();});await page.screenshot({path:path.join(output,'batmobile-batcave-arcade.png')});
   pass('Batcave arcade starts with a countdown and continuously shuffles only its twelve themed cargo items');
   await page.evaluate(()=>{const d=__dockTest;d.settings.rotate=true;});
   const tour=await page.evaluate(()=>{const d=__dockTest;return [1,2,3,5,7,9].map(shift=>{d.game.shift=shift;return d.routeLocation();});});
   assert.deepEqual(tour,[7,7,0,1,2,7]);
   pass('Tour starts at the selected place and rotates through owned locations only');
   await page.evaluate(()=>{const d=__dockTest;d.settings.rotate=false;d.backToTitle();d.openGarage();d.changeShopCategory('styles');});
   await page.locator('[data-item="wrap:hero"]').tap();for(let i=0;i<3;i++)await page.locator('[data-item="wrap:hero"]').tap();await paint(page);
   assert.equal(await page.evaluate(()=>__dockTest.profile.selectedWrap),'wrap:hero');assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),18480);
   await page.screenshot({path:path.join(output,'parcel-wraps-shop.png')});
   await page.locator('#shop-next').tap();await page.locator('[data-item="zone:neon"]').tap();await paint(page);
   assert.equal(await page.evaluate(()=>__dockTest.profile.selectedZone),'zone:neon');assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),18280);
   await page.screenshot({path:path.join(output,'loading-zone-styles-shop.png')});
   pass('a parcel wrap and dock style equip independently and remain one-time purchases');
   await page.reload();await page.waitForFunction(()=>!!window.__dockTest,null,{polling:50});
   assert.deepEqual(await page.evaluate(()=>[__dockTest.wallet.coins,__dockTest.profile.selectedSkin,__dockTest.settings.location,__dockTest.profile.selectedWrap,__dockTest.profile.selectedZone]),[18280,14,7,'wrap:hero','zone:neon']);
   assert.deepEqual(await page.evaluate(()=>__dockTest.wallet.owned),['batcave','school','batmobile','venue:batcave','wrap:hero','zone:neon']);
   pass('coins, old ownership, new ownership and all four equipped choices persist after reload');
   await page.waitForFunction(()=>!!__dockTest.art[7],null,{polling:50});await paint(page);await page.screenshot({path:path.join(output,'equipped-place-after-reload.png')});
   pass('a saved arcade place loads its pixel scenery immediately on the home screen after reload');
   await page.locator('.settings-button:visible').tap();await paint(page);
   assert.deepEqual(await page.locator('.location-choice:visible').evaluateAll(a=>a.map(b=>Number(b.dataset.location))),[7]);
   assert.equal(await page.locator('#routes-next').isDisabled(),true);await page.locator('#routes-prev').tap();
   assert.deepEqual(await page.locator('.location-choice:visible').evaluateAll(a=>a.map(b=>Number(b.dataset.location))),[0,1,2]);
   await page.locator('#routes-next').tap();await page.locator('[data-location="7"]').tap();await page.locator('#settings-back').tap();
   pass('Routes and Audio pages list every owned place and omit unpurchased places');
   await page.locator('.fleet-button:visible').tap();await page.locator('[data-shop="venues"]').tap();await page.locator('#shop-next').tap();await page.locator('#shop-next').tap();
   await page.evaluate(()=>{Storage.prototype.setItem=function(key,...args){if(key==='dockDashWalletV1')throw new Error('full');return __save.call(this,key,...args);};});
   await page.locator('[data-item="venue:school"]').tap();assert.match(await page.locator('#shop-message').textContent(),/Coins kept/);
   assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),18280);assert.equal(await page.evaluate(()=>__dockTest.settings.location),7);assert.equal(await page.evaluate(()=>__dockTest.wallet.owned.includes('venue:school')),false);
   await page.evaluate(()=>{Storage.prototype.setItem=__save;});
   pass('a failed place purchase save leaves the wallet, ownership and equipped route intact');
   await page.locator('[data-item="venue:school"]').tap();await page.locator('#garage-back').tap();await page.locator('#start').tap();
   assert.equal(await page.evaluate(()=>__dockTest.game.mission),null);assert.equal(await page.evaluate(()=>__dockTest.location),8);
   assert.equal(await page.evaluate(()=>__dockTest.game.parcels.every(p=>__dockTest.MR.getMission('school',0).products.includes(p.product))),true);
   await page.evaluate(()=>{__dockTest.game.readyIn=0;__dockTest.render();});await page.screenshot({path:path.join(output,'school-arcade-custom-fleet.png')});
   pass('School Campus arcade uses school supplies and keeps the chosen fleet and styles');
   const zoneBounds=await page.evaluate(()=>{const d=__dockTest,art=d.zoneSprite(d.profile.selectedZone),draw=CanvasRenderingContext2D.prototype.drawImage,calls=[];CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(image===art)calls.push(args);return draw.call(this,image,...args);};try{d.render();}finally{CanvasRenderingContext2D.prototype.drawImage=draw;}return {calls,width:art.width/2,height:art.height/2};});
   assert.equal(zoneBounds.calls.length,1);assert.deepEqual(zoneBounds.calls[0],[123,302,114,zoneBounds.height]);assert.equal(zoneBounds.width,114);assert.ok(zoneBounds.calls[0][1]+zoneBounds.height<474);
   pass('dock style art stays within the loading window and cannot extend into truck controls');
   const stable=await page.evaluate(()=>{const d=__dockTest;d.game.hold=100;d.game.parcels=[{type:0,product:360,kind:'normal',y:372,phase:0}];d.render();const before={...__counts};for(let i=0;i<120;i++)d.render();return {canvases:__counts.canvases-before.canvases,blur:__counts.blur-before.blur,storage:__counts.storage-before.storage};});
   assert.deepEqual(stable,{canvases:0,blur:0,storage:0});
   const bounded=await page.evaluate(()=>{const d=__dockTest;for(const wrap of d.ER.styles.filter(s=>s.style==='wrap'))for(let product=0;product<300+d.MR.worlds.length*12;product++)d.parcelSprite(product%5,'normal',product,wrap.id);for(const s of d.ER.styles.filter(s=>s.style==='zone'))d.zoneSprite(s.id);return {parcels:d.parcelSprites.entries.size,zones:d.zoneSprites.entries.size};});
   assert.deepEqual(bounded,{parcels:96,zones:4});
   pass('equipped styles add no canvas allocation, blur or storage work over 120 frames and caches stay bounded');
   await page.evaluate(()=>{const d=__dockTest;d.backToTitle();d.openBriefing('matchday',0);d.launchMission();d.pauseGame(true);d.openOverlay('settings');});
   await page.locator('[data-location="7"]').tap();assert.equal(await page.evaluate(()=>__dockTest.location),3);await page.locator('#settings-back').tap();assert.equal(await page.evaluate(()=>__dockTest.routeLocation()),3);
   pass('changing the future arcade place during a paused mission preserves its scene and mission route');
   const themed=await page.evaluate(()=>{const d=__dockTest;d.backToTitle();d.openGarage();return d.ER.venues.filter(v=>v.world).map(v=>{d.selectShopItem(v.id);d.closeGarage();d.startGame({skipTutorial:true});const ids=Array.from({length:36},()=>d.pickProduct()),expected=d.MR.getMission(v.world,0).products;const out={name:v.name,location:d.location,expected:v.location,valid:ids.every(id=>expected.includes(id)),unique:new Set(ids).size,mission:d.game.mission};d.backToTitle();d.openGarage();return out;});});
   for(const v of themed){assert.equal(v.location,v.expected);assert.equal(v.valid,true);assert.equal(v.unique,12);assert.equal(v.mission,null);}
   pass('all fourteen purchasable places produce their own endless arcade cargo pools');
   await page.locator('[data-shop="styles"]').tap();await page.locator('#shop-next').tap();await page.locator('#shop-next').tap();assert.equal(await page.locator('.skin-choice:visible').count(),1);assert.equal(await page.locator('#shop-next').isDisabled(),true);
   pass('short final pages hide unused cards and prevent advancing past the catalog');
   for(const size of [{width:320,height:568},{width:390,height:844},{width:414,height:896},{width:844,height:390}]){
     await page.setViewportSize(size);await page.waitForFunction(()=>{const v=document.getElementById('viewport'),b=v.getBoundingClientRect(),c=getComputedStyle(v),s=Math.min((b.width-parseFloat(c.paddingLeft)-parseFloat(c.paddingRight))/360,(b.height-parseFloat(c.paddingTop)-parseFloat(c.paddingBottom))/640);return Math.abs(document.getElementById('stage').getBoundingClientRect().width-360*s)<1;},null,{polling:50});
     for(const category of ['trucks','venues','styles']){
       await page.evaluate(category=>{__dockTest.changeShopCategory(category);__dockTest.render();},category);
       const boxes=await page.locator('#garage-menu button:visible').evaluateAll(a=>a.map(b=>{const r=b.getBoundingClientRect();return {id:b.id||b.dataset.item||b.dataset.shop,x:r.x,y:r.y,width:r.width,height:r.height};})),stage=await page.locator('#stage').boundingBox();
       for(let i=0;i<boxes.length;i++){const a=boxes[i];assert.ok(a.x>=stage.x-.5 && a.x+a.width<=stage.x+stage.width+.5 && a.y+a.height<=stage.y+stage.height+.5);for(let j=i+1;j<boxes.length;j++)assert.equal(overlap(a,boxes[j]),false,JSON.stringify({category,size,a,b:boxes[j]}));}
     }
   }
   pass('three shop categories fit four phone orientations without overlapping touch controls');
   await page.setViewportSize({width:390,height:844});
   await page.evaluate(()=>{const d=__dockTest;d.selectShopItem('venue:batcave');d.closeGarage();});await page.locator('.sound:visible').tap();
   const ready=async track=>{await page.waitForFunction(track=>__dockTest.soundtrack.active?.track===track && !__dockTest.soundtrack.pending && !__dockTest.soundtrack.active.player.paused && __dockTest.soundtrack.active.player.readyState>=3,track,{polling:50});assert.equal(await page.evaluate(()=>__dockTest.soundtrack.slots.filter(s=>!s.player.paused).length),1);};
   await ready(7);await page.locator('#start').tap();await ready(7);
   await page.locator('#pause').tap();assert.equal(await page.evaluate(()=>__dockTest.soundtrack.slots.filter(s=>!s.player.paused).length),0);
   await page.locator('#resume').tap();await ready(7);await page.locator('#pause').tap();await page.locator('#exit-run').tap();
   pass('native Batcave arcade music uses one phone player and pauses and resumes without overlap');
   await page.locator('.fleet-button:visible').tap();await page.locator('[data-shop="venues"]').tap();
   await page.evaluate(()=>{__dockTest.changeShopPage(-20);__dockTest.changeShopPage(2);});await page.locator('[data-item="venue:school"]').tap();await ready(8);
   await page.locator('#garage-back').tap();await page.locator('#start').tap();await ready(8);await page.evaluate(()=>{__dockTest.game.readyIn=0;__dockTest.render();});await page.screenshot({path:path.join(output,'school-arcade-with-music.png')});
   pass('a native venue equip switches to school music and keeps a single decoder through arcade launch');
   const other=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),low=await other.newPage();
   await setup(low,{wallet:{coins:100,earned:820},profile:{selectedSkin:19,selectedWrap:'wrap:hero',selectedZone:'zone:gold'},settings:{location:12}});
   assert.deepEqual(await low.evaluate(()=>[__dockTest.wallet.coins,__dockTest.profile.selectedSkin,__dockTest.settings.location,__dockTest.profile.selectedWrap,__dockTest.profile.selectedZone]),[100,0,0,'wrap:classic','zone:classic']);
   await low.locator('.fleet-button:visible').tap();await low.locator('[data-shop="venues"]').tap();await low.locator('[data-item="venue:matchday"]').tap();assert.match(await low.locator('#shop-message').textContent(),/Need 150 more/);
   assert.equal(await low.evaluate(()=>__dockTest.wallet.coins),100);assert.equal(await low.evaluate(()=>__dockTest.settings.location),0);
   pass('unowned saved equipment falls back safely and insufficient place purchases cannot equip or deduct');
   assert.deepEqual(errors,[]);pass('no browser runtime errors');fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,errors},null,2));
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
