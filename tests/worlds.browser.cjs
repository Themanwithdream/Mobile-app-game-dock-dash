/* Hundred-world native navigation, story gating, migration and memory budgets. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'..'),out=process.env.DOCK_TEST_OUTPUT||path.join(os.tmpdir(),'dock-dash-worlds'),url='http://127.0.0.1:8851/';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'index.html'),'utf8'),html=source.replace('  buildBelt(); parcelCache',`  window.__dockTest={previewArt,MEDIA,MR,ER,PRODUCTS,profile,settings,render,update,openMissionMap,openBriefing,backToTitle,launchMission,finishMission,productCache,cargoSprites,imageSources,previewFloors,parcelSprites,zoneSprites,sceneFloor,trucksForSkin,COLORS,chooseChapter,
get state(){return state;},get wallet(){return wallet;},get game(){return game;},get selected(){return selectedMission;},get records(){return missionRecords;},get art(){return pixelArt;},get floors(){return locationFloors;},setRecords(r){missionRecords=MR.readRecords(r);syncControls();}};
  buildBelt(); parcelCache`);assert.notEqual(html,source);
const checks=[],errors=[];const pass=(name,detail)=>{checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));};
async function paint(page){await page.evaluate(()=>__dockTest.render());}
async function checkLayout(page,section){
 const boxes=await page.locator(section+' button:visible,'+section+' select:visible,#mission-home:visible').evaluateAll(a=>a.map(b=>{
  const r=b.getBoundingClientRect(),panel=b.closest('.briefing-scroll'),clip=panel?.getBoundingClientRect();
  const x=clip?Math.max(r.x,clip.x):r.x,y=clip?Math.max(r.y,clip.y):r.y,right=clip?Math.min(r.right,clip.right):r.right,bottom=clip?Math.min(r.bottom,clip.bottom):r.bottom;
  return {id:b.id||b.dataset.world||b.dataset.missionStage,x,y,w:Math.max(0,right-x),h:Math.max(0,bottom-y)};
 }).filter(r=>r.w>0&&r.h>0)),stage=await page.locator('#stage').boundingBox();
 for(let i=0;i<boxes.length;i++){const a=boxes[i];assert.ok(a.x>=stage.x-.5&&a.x+a.w<=stage.x+stage.width+.5&&a.y>=stage.y-.5&&a.y+a.h<=stage.y+stage.height+.5,JSON.stringify(a));for(let j=i+1;j<boxes.length;j++){const b=boxes[j];assert.equal(a.x<b.x+b.w-.5&&a.x+a.w>b.x+.5&&a.y<b.y+b.h-.5&&a.y+a.h>b.y+.5,false,JSON.stringify({a,b}));}}
}
(async()=>{
 const server=spawn('python',['-m','http.server','8851','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;
 try{
  for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:process.env.DOCK_CHROME||'/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell',args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.route(url,r=>r.fulfill({contentType:'text/html',body:html}));
  await page.addInitScript(()=>{
   window.requestAnimationFrame=()=>0;localStorage.setItem('dockDashMuted','true');
   if(!localStorage.getItem('dockDashWalletV1')){
    localStorage.setItem('dockDashProfileV2',JSON.stringify({tutorialDone:true,totalDelivered:180,selectedSkin:14,selectedWrap:'wrap:hero',selectedZone:'zone:gold'}));
    localStorage.setItem('dockDashWalletV1',JSON.stringify({version:1,coins:4321,earned:6789,spent:2468,owned:['batcave','batmobile','tumbler','venue:batcave','wrap:hero','zone:gold']}));
    localStorage.setItem('dockDashSettingsV3',JSON.stringify({location:7}));localStorage.setItem('dockDashCargoCollectionV1','[3,14,348,359]');
    localStorage.setItem('dockDashMissionsV1',JSON.stringify(Object.fromEntries(Array.from({length:8},(_,i)=>['batcave-'+(i+1),{stars:1+i%3,bestScore:1000+i,bestTime:20+i}]))));
   }
  });
  await page.goto(url);await page.waitForFunction(()=>window.__dockTest&&__dockTest.art[7],null,{polling:50});
  const restored=await page.evaluate(()=>{const d=__dockTest;return {worlds:d.MR.worlds.length,missions:d.MR.missions.length,cargo:d.PRODUCTS.length,coins:d.wallet.coins,spent:d.wallet.spent,owned:d.wallet.owned,skin:d.ER.trucks[d.profile.selectedSkin].id,wrap:d.profile.selectedWrap,place:d.settings.location,records:Object.keys(d.records),lanterns:d.MR.lanternCount(d.records),sprites:d.cargoSprites.entries.size};});
  assert.deepEqual([restored.worlds,restored.missions,restored.cargo,restored.coins,restored.spent,restored.skin,restored.wrap,restored.place,restored.lanterns],[100,800,1500,4321,2468,'beacon-runner','wrap:crest',7,1]);assert.ok(restored.records.every(id=>id.startsWith('beacon-')));assert.ok(restored.sprites<30);pass('a real legacy save keeps coins, spending, equipment and all eight stars while initial cargo art stays lazy',restored);
  await paint(page);await page.screenshot({path:path.join(out,'beacon-bay-home.png')});
  await page.locator('#missions').tap();await page.locator('#mission-journal').tap();assert.equal(await page.locator('#story-dialog').isVisible(),true);assert.equal(await page.locator('[data-journal-world]').count(),100);assert.match(await page.locator('#story-content').textContent(),/quiet storm/);
  await page.locator('[data-journal-world="greenwood"]').tap();assert.equal(await page.evaluate(()=>__dockTest.selected.id),'greenwood-1');await page.locator('#briefing-story').tap();
  assert.equal(await page.locator('#story-content details').count(),8);assert.equal(await page.locator('.locked-story').count(),7);assert.match(await page.locator('#story-content').textContent(),/apprentice archer/);assert.doesNotMatch(await page.locator('#story-content').textContent(),/Rowan sends a rope arrow/);
  await page.screenshot({path:path.join(out,'greenwood-story-journal.png')});await page.keyboard.press('Escape');assert.equal(await page.locator('#story-dialog').isVisible(),false);assert.equal(await page.evaluate(()=>__dockTest.state),'briefing');pass('the journal reaches all hundred worlds, tells the archer story and keeps future chapter endings gated');
  await page.locator('#briefing-back').tap();await page.locator('#mission-chapter').selectOption('greenwood');await paint(page);await page.waitForFunction(()=>[26,27,28,29].every(i=>__dockTest.previewArt[i] || __dockTest.art[i]),null,{polling:50});await paint(page);await page.screenshot({path:path.join(out,'greenwood-chapter.png')});
  const visited=[],fingerprints=[],backdrops=[],sources=[];
  for(const chapter of ['',...await page.evaluate(()=>Object.keys(__dockTest.MR.story.chapters))]){
   if(chapter==='')continue;
   await page.locator('#mission-chapter').selectOption(chapter);
   while(true){
    const ids=await page.locator('.mission-card:visible').evaluateAll(a=>a.map(b=>b.dataset.world));
    for(const id of ids){
     await page.locator(`[data-world="${id}"]`).tap();await paint(page);await page.waitForFunction(()=>__dockTest.art[__dockTest.selected.world.location],null,{polling:50});await paint(page);
     const data=await page.evaluate(async()=>{const d=__dockTest,w=d.selected.world,f=d.sceneFloor(w.location),pixels=f.getContext('2d').getImageData(0,0,f.width,f.height).data,hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',pixels))).map(x=>x.toString(16).padStart(2,'0')).join('');const a=document.createElement('canvas');a.width=360;a.height=640;a.getContext('2d').drawImage(d.art[w.location],0,0,360,640);const raw=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',a.getContext('2d').getImageData(0,0,360,640).data))).map(x=>x.toString(16).padStart(2,'0')).join('');return {id:w.id,hash,raw,src:d.MEDIA.floors[w.location],backdrop:w.backdrop,location:w.location,products:d.selected.products,images:d.imageSources.size,icons:d.cargoSprites.entries.size,previews:d.previewFloors.entries.size,floors:d.floors.filter(Boolean).length};});
     assert.ok(data.images<=12);assert.ok(data.icons<=144);assert.ok(data.previews<=7);assert.ok(data.floors<=2);assert.equal(data.products.length,12);visited.push(data.id);fingerprints.push(data.hash);backdrops.push(data.raw);sources.push(data.src);assert.equal(data.src,data.backdrop);
     if(ids[0]===id){await page.locator('#mission-launch').tap();const run=await page.evaluate(()=>({ready:__dockTest.game.readyIn,ids:__dockTest.game.parcels.map(p=>p.product),pool:__dockTest.game.mission.products}));assert.equal(run.ready,3);assert.ok(run.ids.every(i=>run.pool.includes(i)));await page.locator('#mission-home').tap();await page.locator('#missions').tap();}else await page.locator('#briefing-back').tap();
    }
    if(await page.locator('#missions-next').isDisabled())break;await page.locator('#missions-next').tap();
   }
  }
  assert.equal(new Set(visited).size,77);assert.equal(new Set(fingerprints).size,77);assert.equal(new Set(backdrops).size,77);assert.equal(new Set(sources).size,77);pass('all 77 appended worlds are reachable, have distinct rendered depots and retain bounded image, floor and cargo caches',{worlds:visited.length,uniqueScenes:new Set(fingerprints).size});
  await page.locator('#mission-chapter').selectOption('starlight');await paint(page);await page.screenshot({path:path.join(out,'starlight-chapter.png')});
  for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1280,height:800}]){
   await page.setViewportSize(size);await page.evaluate(()=>window.dispatchEvent(new Event('resize')));await page.locator('#mission-chapter').selectOption('greenwood');await paint(page);await checkLayout(page,'#missions-menu');await page.locator('[data-world="greenwood"]').tap();await paint(page);await checkLayout(page,'#briefing-menu');await page.locator('#briefing-back').tap();
  }pass('chapter controls, journal buttons, eight stage buttons and Home fit four viewport sizes without overlap');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.dispatchEvent(new Event('resize')));await page.locator('[data-world="greenwood"]').tap();await paint(page);await page.screenshot({path:path.join(out,'greenwood-briefing.png')});
  const scores=await page.evaluate(()=>{const d=__dockTest,c=document.createElement('canvas');c.width=480;c.height=11*155;const g=c.getContext('2d');g.fillStyle='#142b39';g.fillRect(0,0,c.width,c.height);let plates=0;const fleet=[d.ER.trucks[7],d.ER.trucks[14],d.ER.trucks[15],...d.ER.trucks.slice(29)];fleet.forEach((t,row)=>{d.trucksForSkin(d.ER.trucks.indexOf(t)).slice(0,4).forEach((im,type)=>{const p=im.getContext('2d').getImageData(90,86,1,1).data,rgb=d.COLORS[type].ink.match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16));if(rgb.every((n,i)=>Math.abs(p[i]-n)<=3))plates++;g.drawImage(im,type*120+18,row*155,90,141);});g.fillStyle='#fff0d1';g.font='11px sans-serif';g.fillText(t.name,5,row*155+152);});return {plates,image:c.toDataURL('image/png')};});
  assert.equal(scores.plates,44);fs.writeFileSync(path.join(out,'original-keeper-fleet.png'),Buffer.from(scores.image.split(',')[1],'base64'));pass('all eleven original replacement and chapter bodies preserve the four colour-and-shape sorting plates');
  await page.evaluate(()=>{const d=__dockTest;d.setRecords(Object.fromEntries(d.MR.missions.map(m=>[m.id,{stars:3,bestScore:1200,bestTime:30}])));d.openMissionMap();});await page.locator('#mission-chapter').selectOption('');await page.locator('#mission-journal').tap();assert.match(await page.locator('#story-content').textContent(),/A hundred lanterns shine/);assert.equal(await page.locator('.journal-world.lit').count(),100);await page.screenshot({path:path.join(out,'hundred-lanterns-complete.png')});await page.locator('#story-close').tap();pass('a complete journey lights exactly one hundred persistent world markers and reveals its ending');
  assert.deepEqual(errors,[]);pass('no browser runtime errors');fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,errors,visited},null,2));
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
