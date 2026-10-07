/* Gameplay performance invariants; hooks and counters are test-response only. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.DOCK_TEST_OUTPUT || path.join(os.tmpdir(),'dock-dash-gameplay-checks'),url='http://127.0.0.1:8844/';
fs.mkdirSync(output,{recursive:true});
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const html=source.replace('  buildBelt(); parcelCache',`  window.__dockTest={engine,frameBudget,progress,frame,render,update,startGame,loadLane,nextParcel,pauseGame,backToTitle,useLocation,fit,parcelSprite,parcelSprites,popupSprites,previewFloors,panels,burst,popup,openMissionMap,openOverlay,settings,applyEffectSettings,
 get game(){return game;},get art(){return pixelArt;},get clock(){return clock;},get floors(){return locationFloors;},get popups(){return popups;},get particles(){return particles;},get profile(){return profile;},get discovered(){return discovered;}};
  buildBelt(); parcelCache`);
assert.notEqual(html,source);const checks=[],errors=[];
function pass(name,detail){checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));}
(async()=>{const server=spawn('python',['-m','http.server','8844','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;try{
 for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.DOCK_CHROME || '/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell',args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route(url,route=>route.fulfill({contentType:'text/html',body:html}));
 await page.addInitScript(()=>{
  window.requestAnimationFrame=()=>0;window.__idle=new Map();let next=0;
  window.requestIdleCallback=fn=>{__idle.set(++next,fn);return next;};window.cancelIdleCallback=id=>__idle.delete(id);
  localStorage.setItem('dockDashMuted','true');localStorage.setItem('dockDashProfileV2',JSON.stringify({totalDelivered:200,totalPerfect:0,tutorialDone:true,selectedSkin:3}));
  window.__counts={scenePaints:0,paths:0,shadows:0,storage:0,attributes:0,canvases:0};
  const create=document.createElement.bind(document);document.createElement=(name,...a)=>{if(name==='canvas')__counts.canvases++;return create(name,...a);};
  const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...a){if(this.canvas.id==='scenery' && a[0].width===this.canvas.width && a[0].height===this.canvas.height)__counts.scenePaints++;return draw.apply(this,a);};
  const path=CanvasRenderingContext2D.prototype.beginPath;CanvasRenderingContext2D.prototype.beginPath=function(){if(this.canvas.id==='game')__counts.paths++;return path.call(this);};
  const blur=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'shadowBlur');Object.defineProperty(CanvasRenderingContext2D.prototype,'shadowBlur',{...blur,set(value){if(this.canvas.id==='game' && value>0)__counts.shadows++;return blur.set.call(this,value);}});
  const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){__counts.storage++;return set.apply(this,a);};
  const attr=Element.prototype.setAttribute;Element.prototype.setAttribute=function(...a){__counts.attributes++;return attr.apply(this,a);};
 });
 await page.goto(url);await page.waitForFunction(()=>window.__dockTest && [0,2,3,4,5,6].every(i=>__dockTest.art[i]),null,{polling:50});
 const layers=await page.evaluate(()=>{
  const d=__dockTest;d.startGame({skipTutorial:true});Object.assign(d.game,{readyIn:0,go:0,hold:100});d.render();const before={...__counts};
  for(let i=0;i<120;i++)d.render();
  return {scenePaints:__counts.scenePaints-before.scenePaints,canvases:__counts.canvases-before.canvases,shadows:__counts.shadows-before.shadows,floors:d.floors.filter(Boolean).length};
 });
 assert.deepEqual(layers,{scenePaints:0,canvases:0,shadows:0,floors:1});pass('120 unchanged frames reuse scenery, panels and truck art without allocation or runtime blur',layers);
 const boundary=await page.evaluate(()=>{
  const d=__dockTest;d.startGame({skipTutorial:true});Object.assign(d.game,{readyIn:0,go:0});const p={type:1,product:1,kind:'normal',y:351.8,phase:0};d.game.parcels=[p];d.render(.004);
  __counts.storage=__counts.attributes=0;document.querySelector('[data-lane="1"]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,pointerType:'touch'}));
  return {physicalY:p.y,delivered:d.game.delivered,perfects:d.game.perfects,score:d.game.score,storage:__counts.storage,attributes:__counts.attributes,dirty:d.engine.dirty,idle:__idle.size,popup:d.popups[0].message};
 });
 assert.equal(boundary.delivered,1);assert.equal(boundary.perfects,1);assert.equal(boundary.score,15);assert.equal(boundary.storage,0);assert.equal(boundary.attributes,1);assert.equal(boundary.dirty,true);assert.equal(boundary.idle,1);
 pass('touch scores the visible perfect stripe and updates one dock immediately without saving or refreshing menus',boundary);
 const wait=await page.evaluate(()=>{
  const d=__dockTest;d.startGame({skipTutorial:true});Object.assign(d.game,{readyIn:0,go:0});d.game.parcels=[{type:1,product:2,kind:'normal',y:309.7,phase:0}];d.render();d.update(1/120);d.loadLane(1);
  const result={delivered:d.game.delivered,lives:d.game.lives,hint:d.popups[0].message};d.update(.12);d.loadLane(1);return {...result,afterStaleView:d.game.delivered};
 });
 assert.equal(wait.delivered,0);assert.equal(wait.lives,3);assert.equal(wait.hint,'WAIT FOR GREEN');assert.equal(wait.afterStaleView,1);pass('early taps remain safe, and an old displayed position cannot block a later valid load',wait);
 const preserved=await page.evaluate(()=>{
  const d=__dockTest;d.pauseGame(true);return {saved:JSON.parse(localStorage.getItem('dockDashProfileV2')).totalDelivered,current:d.profile.totalDelivered,cargo:JSON.parse(localStorage.getItem('dockDashCargoCollectionV1')),idle:__idle.size};
 });
 assert.equal(preserved.saved,preserved.current);assert.ok(preserved.cargo.includes(1)&&preserved.cargo.includes(2));assert.equal(preserved.idle,0);pass('pause flushes delivered cargo and fleet progress before cancelling the idle save',preserved);
 const exit=await page.evaluate(()=>{
  const d=__dockTest;d.startGame({skipTutorial:true});d.game.readyIn=0;d.game.parcels=[{type:1,product:3,kind:'normal',y:372,phase:0}];d.render();d.loadLane(1);window.dispatchEvent(new Event('pagehide'));
  return {saved:JSON.parse(localStorage.getItem('dockDashProfileV2')).totalDelivered,current:d.profile.totalDelivered,cargo:JSON.parse(localStorage.getItem('dockDashCargoCollectionV1')),idle:__idle.size};
 });
 assert.equal(exit.saved,exit.current);assert.ok(exit.cargo.includes(3));assert.equal(exit.idle,0);pass('page exit saves the newest delivery before the tab can disappear');
 const projection=await page.evaluate(()=>{
  const d=__dockTest;d.startGame({skipTutorial:true});Object.assign(d.game,{readyIn:0,go:0,hold:0});const before={clock:d.clock,y:d.game.parcels.map(p=>p.y),score:d.game.score,lives:d.game.lives};
  for(const fraction of [0,.001,.004,.008])d.render(fraction);
  return {before,after:{clock:d.clock,y:d.game.parcels.map(p=>p.y),score:d.game.score,lives:d.game.lives}};
 });
 assert.deepEqual(projection.after,projection.before);pass('fractional movement rendering does not advance physics, points or lives');
 const pressure=await page.evaluate(()=>{
  const d=__dockTest;d.startGame({skipTutorial:true});Object.assign(d.game,{readyIn:0,go:0,hold:100});d.engine.reset();d.render();const rect=()=>{const r=document.getElementById('stage').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
  const before={box:rect(),width:document.getElementById('game').width,game:d.game},clock=d.clock;
  for(let i=0;i<=70;i++)d.frame(i*30);
  const motion=document.getElementById('game'),scene=document.getElementById('scenery');
  return {sameGame:d.game===before.game,before:before.width,after:motion.width,scale:d.frameBudget.scale,sameLayout:JSON.stringify(rect())===JSON.stringify(before.box),elapsed:d.clock-clock,lives:d.game.lives,aligned:JSON.stringify(motion.getBoundingClientRect())===JSON.stringify(scene.getBoundingClientRect()),sharpScenery:scene.width===before.width};
 });
 assert.equal(pressure.scale,1.5);assert.ok(pressure.after<pressure.before);assert.equal(pressure.sameGame,true);assert.equal(pressure.sameLayout,true);assert.equal(pressure.aligned,true);assert.equal(pressure.sharpScenery,true);assert.equal(pressure.lives,3);assert.ok(Math.abs(pressure.elapsed-2.1)<1e-9);
 pass('sustained frame pressure reduces pixels while retaining layout, alignment and exact game time',pressure);
 const cache=await page.evaluate(()=>{
  const d=__dockTest;for(let id=0;id<420;id++)for(let type=0;type<5;type++)d.parcelSprite(type,id%2?'fragile':'normal',id);
  for(const loc of [2,1,3,4,5,6,0])d.useLocation(loc);
  d.game.parcels=[];d.render();return {parcels:d.parcelSprites.entries.size,floors:d.floors.filter(Boolean).length,cargoPanel:d.panels.has('cargo')};
 });
 assert.equal(cache.parcels,96);assert.equal(cache.floors,2);assert.equal(cache.cargoPanel,false);pass('long runs and route changes bound sprite memory and remove empty cargo cards',cache);
 const previews=await page.evaluate(()=>{const d=__dockTest;d.openMissionMap();d.render();d.backToTitle();d.openOverlay('settings');d.render();return {count:d.previewFloors.entries.size,widths:[...d.previewFloors.entries.values()].map(c=>c.width),floors:d.floors.filter(Boolean).length};});
 assert.equal(previews.count,7);assert.ok(previews.widths.every(w=>w===180));assert.ok(previews.floors<=2);pass('mission and route previews render small cached scenes independently of full-size floors',previews);
 await page.evaluate(()=>{const d=__dockTest;d.settings.effects='full';d.applyEffectSettings();d.startGame({skipTutorial:true});Object.assign(d.game,{readyIn:0,go:0,shift:12,hold:0,streak:30,score:18055,hot:5,slow:4});for(let i=0;i<10;i++)d.burst(45+i*30,535,'#ffb365',14);for(let i=0;i<8;i++)d.popup('PERFECT +150',65+i*30,345+i*20,'#dafaaf',16);d.render();__counts.paths=__counts.shadows=0;d.render();});
 const busy=await page.evaluate(()=>({paths:__counts.paths,blur:__counts.shadows,particles:__dockTest.particles.length}));
 assert.ok(busy.paths<50);assert.equal(busy.blur,0);assert.equal(busy.particles,140);pass('a full 140-particle burst uses bounded drawing paths and no per-frame blur',busy);
 await page.evaluate(()=>{const d=__dockTest;d.popups.length=d.particles.length=0;d.render();});
 await page.screenshot({path:path.join(output,'smooth-gameplay.png')});
 assert.deepEqual(errors,[]);pass('no browser runtime errors');fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
