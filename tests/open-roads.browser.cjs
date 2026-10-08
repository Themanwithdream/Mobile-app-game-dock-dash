/* Native mobile navigation for all 77 routes, independent endings and save continuity. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'..'),out=process.env.DOCK_TEST_OUTPUT||path.join(os.tmpdir(),'dock-boss-open-roads'),url='http://127.0.0.1:8890/';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'index.html'),'utf8'),html=source.replace('  buildBelt(); parcelCache',`  window.__roads={MR,ER,PRODUCTS,MEDIA,profile,settings,render,update,openMissionMap,openBriefing,backToTitle,sceneFloor,previewImages,pendingPreviews,previewQueue,imageSources,previewFloors,cargoSprites,parcelSprites,soundtrack,backups,saveSnapshot,installSnapshot,progress,
get state(){return state;},get game(){return game;},get art(){return pixelArt;},get records(){return missionRecords;},get wallet(){return wallet;},get selected(){return selectedMission;},setRecords(r){missionRecords=MR.readRecords(r);saveMissions();syncControls();}};
  buildBelt(); parcelCache`);assert.notEqual(source,html);
const checks=[],errors=[],failed=[];const pass=(name,detail)=>{checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));};
const paint=p=>p.evaluate(()=>__roads.render());
async function layout(p,section){
 const stage=await p.locator('#stage').boundingBox(),boxes=await p.locator(section+' button:visible,'+section+' select:visible').evaluateAll(a=>a.map(b=>{
  const r=b.getBoundingClientRect(),s=b.closest('.briefing-scroll')?.getBoundingClientRect();return {id:b.id||b.dataset.world,x:s?Math.max(r.x,s.x):r.x,y:s?Math.max(r.y,s.y):r.y,right:s?Math.min(r.right,s.right):r.right,bottom:s?Math.min(r.bottom,s.bottom):r.bottom};
 }).filter(b=>b.right>b.x&&b.bottom>b.y));
 for(const b of boxes)assert.ok(b.x>=stage.x-.6&&b.right<=stage.x+stage.width+.6&&b.y>=stage.y-.6&&b.bottom<=stage.y+stage.height+.6,JSON.stringify(b));
}
(async()=>{
 const server=spawn('python',['-m','http.server','8890','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;
 try{
  for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:process.env.DOCK_CHROME,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:664},isMobile:true,hasTouch:true,deviceScaleFactor:2}),p=await context.newPage();
  p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push(r.url()));await p.route(url,r=>r.fulfill({contentType:'text/html',body:html}));
  const oldRecords=Object.fromEntries(require('../missions/mission-rules').missions.slice(0,800).map(m=>[m.id,{stars:3,bestScore:1234,bestTime:30}]));
  await p.addInitScript(records=>{
   requestAnimationFrame=()=>0;if(localStorage.getItem('dockDashBest')!==null)return;localStorage.setItem('dockDashMuted','true');localStorage.setItem('dockDashBest','54321');
   localStorage.setItem('dockDashProfileV2',JSON.stringify({tutorialDone:true,totalDelivered:240,totalPerfect:80,totalTrucks:40,totalGoals:20,highestShift:12,selectedSkin:14,selectedWrap:'wrap:crest',selectedZone:'zone:gold'}));
   localStorage.setItem('dockDashWalletV1',JSON.stringify({version:1,coins:6000,earned:8000,spent:2000,owned:['beacon','beacon-runner','venue:rome','wrap:crest','zone:gold']}));
   localStorage.setItem('dockDashSettingsV3',JSON.stringify({location:13,music:false,sfx:true,musicVolume:.42,effects:'auto'}));
   localStorage.setItem('dockDashCargoCollectionV1','[3,14,456,1499]');localStorage.setItem('dockDashMissionsV1',JSON.stringify(records));
  },oldRecords);
  await p.goto(url);await p.waitForFunction(()=>window.__roads,null,{polling:30});
  const initial=await p.evaluate(()=>__roads.saveSnapshot());assert.equal(initial.best,54321);assert.equal(initial.wallet.coins,6000);assert.equal(initial.settings.location,13);assert.equal(initial.profile.selectedSkin,14);assert.deepEqual(initial.missions,oldRecords);assert.deepEqual(initial.cargo,[3,14,456,1499]);
  pass('a completed original save retains all 800 records, balance, cargo, selected vehicle, styles and settings');
  await paint(p);await p.screenshot({path:path.join(out,'home-177-places.png')});await p.locator('#missions').tap();await p.locator('#mission-journal').tap();
  assert.match(await p.locator('#story-content').textContent(),/A hundred lanterns shine/);assert.match(await p.locator('#story-content').textContent(),/100 \/ 100 lanterns restored · 0 \/ 77 new routes complete/);assert.equal(await p.locator('.journal-world.lit').count(),100);await p.locator('#story-close').tap();
  pass('the original ending remains visible immediately and the new completion log starts at zero');
  await p.locator('#mission-chapter').selectOption('openroads');await paint(p);assert.deepEqual(await p.locator('.mission-card:visible').evaluateAll(a=>a.map(b=>b.dataset.world)),['asgard','worldtree','frostfortress','dwarvenforge']);
  await p.waitForFunction(()=>[103,104,105,106].every(i=>__roads.previewImages.has(i)),null,{polling:30});await paint(p);await p.screenshot({path:path.join(out,'requested-first-places.png')});
  const visited=[],scenes=[],sources=[];let pages=0;
  while(true){
   const ids=await p.locator('.mission-card:visible').evaluateAll(a=>a.map(b=>b.dataset.world));pages++;
   for(const id of ids){
    await p.locator(`[data-world="${id}"]`).tap();await paint(p);assert.equal(await p.evaluate(()=>__roads.selected.stage),0);assert.equal(await p.locator('[data-mission-stage="1"]').isDisabled(),true);
    await p.waitForFunction(()=>__roads.art[__roads.selected.world.location],null,{polling:30});await paint(p);
    const scene=await p.evaluate(async()=>{const d=__roads,w=d.selected.world,c=d.sceneFloor(w.location),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',c.getContext('2d').getImageData(0,0,c.width,c.height).data))).join(',');return {id:w.id,hash,source:d.MEDIA.floors[w.location],pool:d.selected.products,full:d.imageSources.size,previews:d.previewImages.size,pending:d.pendingPreviews.size,queue:d.previewQueue.length,icons:d.cargoSprites.entries.size,floors:d.previewFloors.entries.size};});
    assert.ok(scene.full<=4&&scene.previews<=8&&scene.pending<=4&&scene.queue<=8&&scene.icons<=144&&scene.floors<=7,JSON.stringify(scene));assert.equal(scene.pool.length,12);visited.push(scene.id);scenes.push(scene.hash);sources.push(scene.source);
    if(id===ids[0]){await p.locator('#mission-launch').tap();const run=await p.evaluate(()=>({ready:__roads.game.readyIn,pool:__roads.game.mission.products,parcels:__roads.game.parcels.map(p=>p.product)}));assert.equal(run.ready,3);assert.ok(run.parcels.every(id=>run.pool.includes(id)));await p.locator('#mission-home').tap();await p.locator('#missions').tap();}else await p.locator('#briefing-back').tap();
   }
   if(await p.locator('#missions-next').isDisabled())break;await p.locator('#missions-next').tap();await paint(p);
  }
  assert.equal(pages,20);assert.equal(visited.length,77);assert.equal(new Set(visited).size,77);assert.equal(new Set(scenes).size,77);assert.equal(new Set(sources).size,77);assert.deepEqual((await p.evaluate(()=>__roads.saveSnapshot())).missions,oldRecords);
  pass('native cards reach every new place across 20 pages with distinct scenes, free starts, correct cargo and bounded caches',{places:visited.length,pages});
  for(const [term,id]of [['Africa','accracoast'],['ice cream','seasideicecream'],['economic','civicexchange'],['1950s','union1954'],['stocks','marketfloor']]){
   await p.locator('#mission-search').fill(term);await paint(p);assert.ok((await p.locator('.mission-card:visible').evaluateAll(a=>a.map(b=>b.dataset.world))).includes(id),term);
  }await p.locator('#mission-search').fill('');await p.locator('#mission-chapter').selectOption('firststops');await p.locator('[data-world="asgard"]').tap();await p.locator('#briefing-story').tap();assert.equal(await p.locator('.locked-story').count(),7);assert.doesNotMatch(await p.locator('#story-content').textContent(),/The citadel opens to everyone/);await p.locator('#story-close').tap();
  pass('the requested subjects are searchable and future story endings stay locked until their preceding missions are completed');
  for(const size of [{width:320,height:568},{width:390,height:664},{width:414,height:896},{width:844,height:390},{width:1100,height:800}]){
   await p.setViewportSize(size);await p.evaluate(()=>window.dispatchEvent(new Event('resize')));await paint(p);await layout(p,'#briefing-menu');await p.locator('#briefing-back').tap();await layout(p,'#missions-menu');await p.locator('[data-world="asgard"]').tap();await p.locator('#briefing-story').tap();assert.ok(await p.locator('#story-close').isVisible());await p.locator('#story-close').tap();
  }await p.setViewportSize({width:390,height:664});await p.evaluate(()=>window.dispatchEvent(new Event('resize')));
  pass('new map cards, eight level buttons and story dialogs fit five phone, landscape and desktop layouts');
  await paint(p);await p.screenshot({path:path.join(out,'asgard-briefing.png')});
  const saves=await p.evaluate(old=>{
   const d=__roads,s=d.saveSnapshot(),item=d.ER.item('venue:asgard');s.wallet=d.ER.purchase(s.wallet,item.id).wallet;s.settings.location=103;s.cargo.push(1500,2423);s.missions['asgard-8']={stars:3,bestScore:9999,bestTime:70};d.backups.restore(localStorage,s,d.saveSnapshot());d.installSnapshot(s);
   const text=d.backups.export(d.saveSnapshot()),read=d.backups.read(text);
   return {data:read.data,summary:read.summary,old,price:item.price,textLength:text.length};
  },oldRecords).catch(e=>{throw e;});
  assert.equal(saves.data.wallet.coins,6000-saves.price);assert.equal(saves.data.settings.location,103);assert.deepEqual(saves.data.cargo,[3,14,456,1499,1500,2423]);for(const [id,r]of Object.entries(oldRecords))assert.deepEqual(saves.data.missions[id],r);assert.equal(saves.summary.routes,1);assert.equal(saves.summary.lanterns,100);assert.ok(saves.textLength<1024*1024);
  pass('new location purchases, cargo and stars coexist with the full old save and export in the compatible backup format');
  await p.reload();await p.waitForFunction(()=>window.__roads&&__roads.art[103],null,{polling:30});assert.deepEqual(await p.evaluate(()=>__roads.saveSnapshot()),saves.data);
  pass('the combined save reloads with the new owned place and all previous progress exactly intact');
  await p.locator('#missions').tap();await p.locator('#mission-chapter').selectOption('openroads');await p.locator('#mission-journal').tap();assert.match(await p.locator('#story-content').textContent(),/1 \/ 77 new routes complete/);assert.doesNotMatch(await p.locator('#story-content').textContent(),/quiet storm/);assert.equal(await p.locator('[data-journal-world]').count(),77);assert.equal(await p.locator('.journal-world.lit').count(),1);await p.locator('#story-close').tap();
  await p.evaluate(()=>{const d=__roads;d.setRecords({...d.records,...Object.fromEntries(d.MR.routeWorlds.map(w=>[w.id+'-8',{stars:3,bestScore:1000,bestTime:50}]))});});await p.locator('#mission-journal').tap();assert.match(await p.locator('#story-content').textContent(),/All 77 Open Roads routes are complete/);assert.equal(await p.locator('.journal-world.lit').count(),77);await p.screenshot({path:path.join(out,'open-roads-complete.png')});await p.locator('#story-close').tap();
  pass('new completion stamps and the Open Roads ending are independent of the original 100-lantern ending');
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);pass('no browser runtime errors or failed asset requests');fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,errors,failed,visited},null,2));
 }finally{await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
