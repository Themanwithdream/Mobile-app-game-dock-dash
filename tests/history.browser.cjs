/* Historical themes, eight-level navigation, save migration and cargo legibility. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.DOCK_TEST_OUTPUT||path.join(os.tmpdir(),'dock-dash-history-checks'),url='http://127.0.0.1:8849/';
fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const html=source.replace('  buildBelt(); parcelCache',`  window.__dockTest={MR,ER,PRODUCTS,settings,profile,soundtrack,openBriefing,openMissionMap,launchMission,finishMission,nextMission,backToTitle,changeMissionPage,render,update,spawnParcel,drawDocks,drawCargoInfo,productArt,
 get state(){return state;},get game(){return game;},get selected(){return selectedMission;},get art(){return pixelArt;},get records(){return missionRecords;},get wallet(){return wallet;},get scene(){return activeLocation;},get cache(){return productCache;},get floors(){return locationFloors;},
 setRecords(value){missionRecords=MR.readRecords(value);syncControls();},setWallet(value){wallet=ER.readWallet(value,profile);syncControls();}};
  buildBelt(); parcelCache`);
assert.notEqual(html,source);
const checks=[],errors=[],requests=[];
const pass=(name,detail)=>{checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));};
const overlap=(a,b)=>a.x<b.x+b.width-.5 && a.x+a.width>b.x+.5 && a.y<b.y+b.height-.5 && a.y+a.height>b.y+.5;
async function paint(page){await page.evaluate(()=>__dockTest.render());}
async function layout(page){
 const result=await page.locator('#briefing-menu button').evaluateAll(buttons=>buttons.filter(b=>b.getClientRects().length).map(b=>({id:b.id||b.dataset.missionStage,...Object.fromEntries(['x','y','width','height'].map(k=>[k,b.getBoundingClientRect()[k]]))})));
 for(let a=0;a<result.length;a++)for(let b=a+1;b<result.length;b++)assert.equal(overlap(result[a],result[b]),false,result[a].id+' / '+result[b].id);
 return result;
}
(async()=>{
 const server=spawn('python',['-m','http.server','8849','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;
 try{
  for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:process.env.DOCK_CHROME||'/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell',args:['--no-sandbox','--autoplay-policy=document-user-activation-required']});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>requests.push(r.url()));
  await page.route(url,r=>r.fulfill({contentType:'text/html',body:html}));
  await page.addInitScript(()=>{
   window.requestAnimationFrame=()=>0;
   if(!localStorage.getItem('dockDashProfileV2')){
    localStorage.setItem('dockDashProfileV2',JSON.stringify({totalDelivered:180,totalPerfect:64,totalTrucks:24,totalGoals:12,highestShift:9,selectedSkin:14,selectedWrap:'wrap:hero',tutorialDone:true}));
    localStorage.setItem('dockDashWalletV1',JSON.stringify({version:1,coins:6000,earned:7200,spent:1200,owned:['batmobile','wrap:hero']}));
    localStorage.setItem('dockDashMissionsV1',JSON.stringify(Object.fromEntries(['matchday','festival','rescue','space','batcave','school','dino','candy','forest','arctic'].flatMap(w=>[1,2,3].map(stage=>[w+'-'+stage,{stars:3,bestScore:900,bestTime:30}])))));
   }
   localStorage.setItem('dockDashMuted','true');
  });
  await page.goto(url);await page.waitForFunction(()=>window.__dockTest && __dockTest.art[0],null,{polling:50});
  assert.equal(await page.evaluate(()=>__dockTest.MR.totalStars(__dockTest.records)),90);
  await page.locator('#missions').tap();await page.locator('[data-world="matchday"]').tap();
  assert.equal(await page.evaluate(()=>__dockTest.selected.id),'matchday-4');
  assert.equal(await page.locator('.mission-stage').count(),8);assert.equal(await page.locator('[data-mission-stage="3"]').isDisabled(),false);assert.equal(await page.locator('[data-mission-stage="4"]').isDisabled(),true);
  await layout(page);await paint(page);await page.screenshot({path:path.join(out,'eight-levels.png')});
  pass('all thirty original records survive and returning players continue at level four');
  const sizes=[];
  for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1280,height:800}]){
   await page.setViewportSize(size);await page.evaluate(()=>window.dispatchEvent(new Event('resize')));await paint(page);const bounds=await layout(page);assert.equal(bounds.length,10);
   sizes.push({...size,levelWidth:bounds[0].width,levelHeight:bounds[0].height});
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.dispatchEvent(new Event('resize')));pass('eight level controls, launch and back stay separate on small phones, landscape and desktop',sizes);
  await page.locator('#briefing-back').tap();for(let i=0;i<3;i++)await page.locator('#missions-next').tap();
  assert.deepEqual(await page.locator('.mission-card:visible').evaluateAll(a=>a.map(b=>b.dataset.world)),['rome','egypt','viking','silkroad']);
  await paint(page);await page.waitForFunction(()=>[13,14,15,16].every(i=>__dockTest.art[i]),null,{polling:50});await paint(page);await page.screenshot({path:path.join(out,'historical-map.png')});
  pass('the four historical worlds share a dedicated map page and load their own pixel scenes');
  const label=await page.locator('#missions-continue').evaluate(button=>{const [copy,arrow]=button.children,a=copy.getBoundingClientRect(),b=arrow.getBoundingClientRect();return {copyEnd:a.right,arrowStart:b.left};});
  assert.ok(label.copyEnd+3<label.arrowStart);pass('the mission continuation label leaves clear space for its arrow');
  const themes=[];
  for(const id of ['rome','egypt','viking','silkroad']){
   await page.locator(`[data-world="${id}"]`).tap();assert.equal(await page.evaluate(()=>__dockTest.selected.stage),0);
   assert.equal(await page.locator('[data-mission-stage="1"]').isDisabled(),true);
   await paint(page);await page.screenshot({path:path.join(out,id+'-briefing.png')});
   await page.locator('#mission-launch').tap();assert.equal(await page.evaluate(()=>__dockTest.game.readyIn),3);
   const d=await page.evaluate(()=>({id:__dockTest.game.mission.id,scene:__dockTest.scene,cargo:__dockTest.game.parcels.map(p=>__dockTest.PRODUCTS[p.product].category),balance:__dockTest.wallet.coins}));themes.push(d);
   await page.evaluate(()=>{const d=__dockTest;for(let i=0;i<361;i++)d.update(1/120);d.render();});await page.screenshot({path:path.join(out,id+'-play.png')});
   await page.locator('#mission-home').tap();await page.locator('#missions').tap();
  }
  assert.equal(new Set(themes.map(t=>t.scene)).size,4);assert.ok(themes.every(t=>t.balance===6000));
  pass('historical first missions are free, keep the countdown and select only their own cargo',themes);
  await page.evaluate(()=>{const d=__dockTest;d.setRecords(Object.fromEntries(d.MR.missions.map(m=>[m.id,{stars:3}])));d.openBriefing('rome',2);d.launchMission();Object.assign(d.game,{readyIn:0,missionElapsed:30,delivered:28,priorityLoaded:7,perfects:10,lives:3});d.finishMission(true);});
  await page.locator('#mission-next').tap();assert.equal(await page.evaluate(()=>__dockTest.selected.id),'rome-4');assert.equal(await page.locator('[data-mission-stage="7"]').isDisabled(),false);
  await page.locator('[data-mission-stage="7"]').tap();assert.equal(await page.evaluate(()=>__dockTest.selected.id),'rome-8');
  await paint(page);await page.screenshot({path:path.join(out,'rome-legend.png')});
  await page.locator('#mission-launch').tap();await page.evaluate(()=>{const d=__dockTest;Object.assign(d.game,{readyIn:0,missionElapsed:40,delivered:68,priorityLoaded:17,perfects:36,lives:3});d.finishMission(true);});
  assert.match(await page.locator('#mission-next').textContent(),/Explore/);await page.locator('#mission-next').tap();assert.equal(await page.evaluate(()=>__dockTest.state),'missions');
  pass('Next continues past the old third level, any earned level can be replayed, and the eighth returns to the map');
  const warnings=await page.evaluate(()=>{
   const d=__dockTest,original=CanvasRenderingContext2D.prototype.fillText,rows=[];
   CanvasRenderingContext2D.prototype.fillText=function(value,...rest){if(String(value).includes('UNTIL DOCKS MOVE'))rows.push(value);return original.call(this,value,...rest);};
   try{d.openBriefing('rome',7);d.launchMission();d.game.readyIn=0;for(const at of d.game.mission.shuffleAt){d.game.delivered=at-3;d.game.trucks.push(d.game.trucks.shift());d.drawDocks();}}finally{CanvasRenderingContext2D.prototype.fillText=original;}
   return rows;
  });assert.equal(warnings.length,6);assert.ok(warnings.every(t=>t.startsWith('3 LOADS')));pass('every late-stage dock change warns the player three deliveries ahead');
  await page.evaluate(()=>__dockTest.backToTitle());await page.locator('.fleet-button:visible').tap();await page.locator('[data-shop="venues"]').tap();
  let purchased=0;while(await page.locator('#shop-next').isEnabled()){
   for(const id of ['rome','egypt','viking','silkroad']){
    const button=page.locator(`[data-item="venue:${id}"]:visible`);if(await button.count()){await button.tap();await button.tap();purchased++;}
   }
   await page.locator('#shop-next').tap();
  }
  for(const id of ['rome','egypt','viking','silkroad']){const button=page.locator(`[data-item="venue:${id}"]:visible`);if(await button.count()){await button.tap();await button.tap();purchased++;}}
  assert.equal(purchased,4);assert.equal(await page.evaluate(()=>__dockTest.wallet.owned.filter(id=>/^venue:(rome|egypt|viking|silkroad)$/.test(id)).length),4);
  // Mission rewards earned earlier are retained; each venue charges exactly once.
  const after=await page.evaluate(()=>({coins:__dockTest.wallet.coins,spent:__dockTest.wallet.spent,location:__dockTest.settings.location}));assert.equal(after.spent,3900);assert.equal(after.location,16);
  await page.locator('#shop-play').tap();assert.equal(await page.evaluate(()=>__dockTest.game.mission),null);assert.equal(await page.evaluate(()=>__dockTest.scene),16);
  const cargo=await page.evaluate(()=>__dockTest.game.parcels.map(p=>__dockTest.PRODUCTS[p.product].category));assert.ok(cargo.every(c=>c==='Caravan trade supplies'));
  await page.evaluate(()=>__dockTest.backToTitle());await page.reload();await page.waitForFunction(()=>window.__dockTest,null,{polling:50});
  assert.equal(await page.evaluate(()=>__dockTest.wallet.spent),3900);assert.equal(await page.evaluate(()=>__dockTest.settings.location),16);assert.equal(await page.evaluate(()=>__dockTest.profile.selectedSkin),14);
  pass('historical arcade places charge once, equip their cargo, and preserve wallet and equipment after reload');
  const art=await page.evaluate(()=>{
   const d=__dockTest,canvas=document.createElement('canvas');canvas.width=720;canvas.height=720;const c=canvas.getContext('2d');c.fillStyle='#20333e';c.fillRect(0,0,720,720);c.font='12px sans-serif';c.textAlign='center';
   const examples=[...['soccerball','cleats','keepergloves','kitbag','trophy','dinosaur'].map(kind=>d.PRODUCTS.find(p=>p.kind===kind)),...d.PRODUCTS.filter(p=>p.id>=420)];
   const hashes=[];for(let i=0;i<examples.length;i++){const p=examples[i],x=i%8*90+45,y=Math.floor(i/8)*100+34;c.drawImage(d.cache[p.id],x-27,y-27,54,54);c.fillStyle='#f8edd5';c.fillText(p.name.split(' ').slice(0,2).join(' '),x,y+40);const pixel=d.cache[p.id].getContext('2d').getImageData(0,0,72,72).data;let alpha=0;for(let j=3;j<pixel.length;j+=4)if(pixel[j])alpha++;if(alpha<80)throw Error('Empty art '+p.name);hashes.push({id:p.id,kind:p.kind,alpha});}
   return {png:canvas.toDataURL('image/png').split(',')[1],hashes};
  });fs.writeFileSync(path.join(out,'cargo-art.png'),Buffer.from(art.png,'base64'));assert.equal(art.hashes.length,54);pass('six improved item silhouettes and all 48 historical products render clearly',art.hashes.map(x=>x.kind));
  const headings=await page.evaluate(()=>{
   const d=__dockTest,old=CanvasRenderingContext2D.prototype.fillText,rows=[];
   CanvasRenderingContext2D.prototype.fillText=function(value,...rest){if(rest[0]===248 && rest[1]===146)rows.push({value,width:this.measureText(value).width});return old.call(this,value,...rest);};
   try{for(const p of d.PRODUCTS.filter(p=>p.id>=420))d.drawCargoInfo({product:p.id});}finally{CanvasRenderingContext2D.prototype.fillText=old;}
   return rows;
  });assert.equal(headings.length,48);assert.ok(headings.every(h=>h.width<80),JSON.stringify(headings));pass('historical cargo headings fit inside their information cards');
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);pass('historical scenes, sprites and controls have no runtime or asset-loading errors');
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,errors,requests,themes},null,2));await context.close();
 }finally{if(browser)await browser.close();server.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
