/* Menu navigation and collection regressions using native phone controls. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.DOCK_TEST_OUTPUT||path.join(os.tmpdir(),'dock-dash-design-checks'),url='http://127.0.0.1:8847/';
fs.mkdirSync(output,{recursive:true});
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const html=source.replace('  buildBelt(); parcelCache',`  window.__dockTest={ER,MR,profile,settings,openGarage,openMissionMap,openBriefing,launchMission,finishMission,backToTitle,changeShopCategory,changeShopPage,changeMissionPage,render,soundtrack,
 get state(){return state;},get game(){return game;},get wallet(){return wallet;},get scene(){return activeLocation;},get tutorial(){return tutorial;},get selected(){return selectedMission;},get art(){return pixelArt;},
 setRecords(records){missionRecords=MR.readRecords(records);syncControls();}};
  buildBelt(); parcelCache`);
assert.notEqual(html,source);
const checks=[],errors=[];
function pass(name){checks.push({name});console.log('PASS '+name);}
async function setup(page,{newPlayer=false}={}){
 await page.route(url,r=>r.fulfill({contentType:'text/html',body:html}));
 await page.addInitScript(newPlayer=>{
  window.requestAnimationFrame=()=>0;
  if(!localStorage.getItem('dockDashProfileV2')){
   localStorage.setItem('dockDashProfileV2',JSON.stringify({totalDelivered:newPlayer?0:180,totalPerfect:60,totalTrucks:20,totalGoals:10,highestShift:8,tutorialDone:!newPlayer,selectedSkin:0}));
   localStorage.setItem('dockDashWalletV1',JSON.stringify({version:1,coins:newPlayer?100:2000,earned:4000,spent:2000,owned:newPlayer?[]:['school','batcave','batmobile','venue:batcave','wrap:hero','zone:gold']}));
  }
  localStorage.setItem('dockDashMuted','true');
 },newPlayer);
 page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForFunction(()=>window.__dockTest && __dockTest.art[0],null,{polling:50});
}
async function paint(page){await page.evaluate(()=>__dockTest.render());}
async function visibleItems(page){return page.locator('.skin-choice:visible').evaluateAll(a=>a.map(b=>b.dataset.item));}
async function readyMusic(page,track){await page.waitForFunction(track=>__dockTest.soundtrack.active?.track===track && !__dockTest.soundtrack.pending && !__dockTest.soundtrack.active.player.paused && __dockTest.soundtrack.active.player.readyState>=3,track,{polling:50});}
const overlap=(a,b)=>a.x<b.x+b.width && a.x+a.width>b.x && a.y<b.y+b.height && a.y+a.height>b.y;
(async()=>{
 const server=spawn('python',['-m','http.server','8847','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;
 try{
  for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:process.env.DOCK_CHROME||'/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell',args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2}),page=await context.newPage();await setup(page);
  await page.locator('.fleet-button:visible').tap();await paint(page);await page.screenshot({path:path.join(output,'shop-redesign.png')});
  assert.equal(await page.locator('#garage-back').getAttribute('aria-label'),'Back to home');
  assert.equal(await page.locator('#shop-play').isVisible(),true);assert.equal(await page.locator('#mission-home').isVisible(),false);
  pass('the shop has one header Home control and a useful Play Arcade action');
  await page.locator('#shop-owned').tap();assert.deepEqual(await visibleItems(page),['classic','rally','nightline','gold']);
  await page.locator('#shop-next').tap();assert.deepEqual(await visibleItems(page),['school','batcave','batmobile']);
  await page.locator('[data-item="batmobile"]').tap();assert.equal(await page.evaluate(()=>__dockTest.profile.selectedSkin),14);assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),2000);
  await page.locator('#shop-owned').tap();assert.deepEqual(await visibleItems(page),['school','matchday','festival','batcave']);
  await page.locator('#shop-next').tap();await page.locator('#shop-next').tap();assert.ok((await visibleItems(page)).includes('batmobile'));
  await page.locator('#shop-owned').tap();assert.deepEqual(await visibleItems(page),['school','batcave','batmobile']);
  pass('Owned shows earned and purchased vehicles, equips the correct truck for free and remembers both page positions');
  await page.locator('[data-shop="venues"]').tap();assert.deepEqual(await visibleItems(page),['venue:warehouse','venue:harbour','venue:airport','venue:batcave']);
  await page.locator('[data-item="venue:batcave"]').tap();await page.locator('[data-shop="styles"]').tap();
  assert.deepEqual(await visibleItems(page),['wrap:classic','wrap:hero','zone:classic','zone:gold']);
  await page.locator('[data-item="wrap:hero"]').tap();await page.locator('[data-item="zone:gold"]').tap();await paint(page);
  assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),2000);await page.screenshot({path:path.join(output,'owned-collection.png')});
  await page.locator('#shop-owned').tap();await page.locator('#shop-next').tap();await page.locator('#shop-next').tap();
  assert.deepEqual(await visibleItems(page),['zone:gold']);await page.locator('#shop-owned').tap();assert.equal(await page.locator('#shop-next').isDisabled(),true);
  await page.locator('#shop-owned').tap();assert.deepEqual(await visibleItems(page),['zone:gold']);
  pass('owned places and independent styles stay easy to find, with safe short pages and no repeat spending');
  await page.locator('#shop-play').tap();
  assert.deepEqual(await page.evaluate(()=>({mission:__dockTest.game.mission,ready:__dockTest.game.readyIn,scene:__dockTest.scene,lives:__dockTest.game.lives,types:__dockTest.game.trucks.map(t=>t.type),skin:__dockTest.profile.selectedSkin,wrap:__dockTest.profile.selectedWrap,zone:__dockTest.profile.selectedZone})),{mission:null,ready:3,scene:7,lives:3,types:[0,1,2,3],skin:14,wrap:'wrap:hero',zone:'zone:gold'});
  await page.evaluate(()=>__dockTest.backToTitle());await page.reload();await page.waitForFunction(()=>window.__dockTest,null,{polling:50});
  assert.deepEqual(await page.evaluate(()=>[__dockTest.wallet.coins,__dockTest.profile.selectedSkin,__dockTest.settings.location,__dockTest.profile.selectedWrap,__dockTest.profile.selectedZone]),[2000,14,7,'wrap:hero','zone:gold']);
  pass('quick play preserves the three-second countdown, sorting rules, selected theme and saved equipment');
  await page.locator('#missions').tap();await paint(page);await page.screenshot({path:path.join(output,'mission-map-redesign.png')});
  assert.equal(await page.locator('#missions-back').count(),0);assert.equal(await page.locator('#mission-home').textContent(),'← Home');
  assert.equal(await page.locator('#missions-continue').textContent(),'Start mission→');await page.locator('#missions-continue').tap();
  assert.equal(await page.evaluate(()=>__dockTest.selected.id),'matchday-1');assert.equal(await page.evaluate(()=>__dockTest.state),'briefing');assert.equal(await page.evaluate(()=>__dockTest.game),null);
  assert.equal(await page.locator('#mission-launch').evaluate(b=>b===document.activeElement),true);
  pass('the mission map has one Home button and opens an unlocked mission briefing without starting gameplay');
  await page.evaluate(()=>__dockTest.setRecords({'matchday-1':{stars:2}}));await page.locator('#briefing-back').tap();await page.locator('#missions-continue').tap();
  assert.equal(await page.evaluate(()=>__dockTest.selected.id),'matchday-2');
  await page.locator('#briefing-back').tap();await page.locator('#missions-next').tap();await page.locator('#missions-continue').tap();assert.equal(await page.evaluate(()=>__dockTest.selected.id),'batcave-1');
  await page.locator('#briefing-back').tap();await page.locator('#missions-next').tap();await page.locator('#missions-continue').tap();assert.equal(await page.evaluate(()=>__dockTest.selected.id),'forest-1');
  pass('suggestions follow earned stage unlocks and the currently visible mission worlds');
  await page.evaluate(()=>__dockTest.setRecords(Object.fromEntries(__dockTest.MR.missions.map(m=>[m.id,{stars:m.id==='forest-2'?2:3}]))));
  await page.locator('#briefing-back').tap();assert.match(await page.locator('#missions-continue').textContent(),/Chase 3 stars/);await page.locator('#missions-continue').tap();assert.equal(await page.evaluate(()=>__dockTest.selected.id),'forest-2');
  await page.evaluate(()=>__dockTest.setRecords(Object.fromEntries(__dockTest.MR.missions.map(m=>[m.id,{stars:3}]))));await page.locator('#briefing-back').tap();
  assert.match(await page.locator('#missions-continue').textContent(),/Replay mission/);await page.locator('#missions-continue').tap();assert.equal(await page.evaluate(()=>__dockTest.selected.id),'forest-2');
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__dockTest.state),'missions');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__dockTest.state),'title');
  pass('cleared maps offer missing stars and replays, and Escape follows briefing, map and home navigation');
  await page.locator('.fleet-button:visible').tap();
  const textBounds=await page.evaluate(()=>{
   const d=__dockTest,draw=CanvasRenderingContext2D.prototype.fillText,rows=[];
   CanvasRenderingContext2D.prototype.fillText=function(str,x,y,...args){if(this.canvas.id==='game'){const width=this.measureText(str).width,left=this.textAlign==='center'?x-width/2:this.textAlign==='right'?x-width:x;rows.push({str,left,right:left+width,y});}return draw.call(this,str,x,y,...args);};
   try{for(const category of ['trucks','venues','styles']){d.changeShopCategory(category);d.changeShopPage(-20);do{d.render();if(document.getElementById('shop-next').disabled)break;d.changeShopPage(1);}while(true);}const coins=d.wallet.coins;d.wallet.coins=1e9;d.render();d.wallet.coins=coins;}finally{CanvasRenderingContext2D.prototype.fillText=draw;}
   return rows;
  });
  for(const row of textBounds)assert.ok(row.left>=15 && row.right<=345,JSON.stringify(row));
  pass('all catalog text and the maximum wallet balance fit within the canvas');
  for(const size of [{width:320,height:568},{width:390,height:844},{width:414,height:896},{width:844,height:390}]){
   await page.setViewportSize(size);await page.waitForFunction(()=>{const v=document.getElementById('viewport'),b=v.getBoundingClientRect(),c=getComputedStyle(v),s=Math.min((b.width-parseFloat(c.paddingLeft)-parseFloat(c.paddingRight))/360,(b.height-parseFloat(c.paddingTop)-parseFloat(c.paddingBottom))/640);return Math.abs(document.getElementById('stage').getBoundingClientRect().width-360*s)<1;},null,{polling:50});
   for(const menu of ['garage','missions']){
    await page.evaluate(menu=>{__dockTest.backToTitle();menu==='garage'?__dockTest.openGarage():__dockTest.openMissionMap();__dockTest.render();},menu);
    const boxes=await page.locator('#stage button:visible').evaluateAll(a=>a.map(b=>{const r=b.getBoundingClientRect();return {id:b.id||b.dataset.item||b.dataset.world,x:r.x,y:r.y,width:r.width,height:r.height,textFits:b.scrollWidth<=b.clientWidth+1};})),stage=await page.locator('#stage').boundingBox();
    for(let i=0;i<boxes.length;i++){const a=boxes[i];assert.ok(a.textFits,JSON.stringify({size,a}));assert.ok(a.x>=stage.x-.5 && a.x+a.width<=stage.x+stage.width+.5 && a.y>=stage.y && a.y+a.height<=stage.y+stage.height+.5);for(let j=i+1;j<boxes.length;j++)assert.equal(overlap(a,boxes[j]),false,JSON.stringify({size,a,b:boxes[j]}));}
    const homes=await page.locator('#stage button:visible').evaluateAll(a=>a.filter(b=>/Home|Main menu/.test(b.textContent)).length);assert.equal(homes,1);
   }
   if(size.width===320){await page.evaluate(()=>{__dockTest.backToTitle();__dockTest.openGarage();__dockTest.changeShopCategory('trucks');__dockTest.changeShopPage(-20);__dockTest.render();});await page.screenshot({path:path.join(output,'narrow-phone-shop.png')});}
  }
  pass('both menus have exactly one Home control, contained labels and separate touch targets in four phone layouts');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>__dockTest.backToTitle());await page.locator('.sound:visible').tap();await readyMusic(page,7);
  await page.locator('#missions').tap();await page.evaluate(()=>__dockTest.openBriefing('batcave',0));await page.locator('#mission-launch').tap();await readyMusic(page,7);await page.evaluate(()=>__dockTest.finishMission(false));
  await page.locator('#mission-shop').tap();assert.equal(await page.locator('#garage-back').getAttribute('aria-label'),'Back to results');await page.locator('#garage-back').tap();assert.equal(await page.evaluate(()=>__dockTest.state),'missionResult');
  await page.locator('#mission-shop').tap();await page.locator('[data-shop="venues"]').tap();await page.evaluate(()=>__dockTest.changeShopPage(-20));await page.locator('[data-item="venue:warehouse"]').tap();
  await page.evaluate(()=>{window.__playedScenes=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){__playedScenes.push(__dockTest.scene);return play.call(this);};const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...args){if(this.loop)__playedScenes.push(__dockTest.scene);return start.apply(this,args);};});
  await page.locator('#shop-play').tap();await readyMusic(page,0);assert.equal(await page.evaluate(()=>__dockTest.game.mission),null);assert.equal(await page.evaluate(()=>__dockTest.soundtrack.slots.filter(s=>!s.player.paused).length),1);
  const played=await page.evaluate(()=>__playedScenes);assert.ok(played.length>0);assert.ok(played.every(scene=>scene===0));
  pass('mission-result shopping returns to results or launches arcade with one player and only the destination theme');
  const fresh=await browser.newContext({viewport:{width:320,height:568},hasTouch:true,isMobile:true}),newbie=await fresh.newPage();await setup(newbie,{newPlayer:true});
  await newbie.locator('.fleet-button:visible').tap();await newbie.locator('#shop-owned').tap();assert.deepEqual(await visibleItems(newbie),['classic']);await newbie.locator('#shop-play').tap();
  assert.equal(await newbie.evaluate(()=>__dockTest.game.readyIn),3);assert.equal(await newbie.evaluate(()=>__dockTest.tutorial.step),0);assert.equal(await newbie.evaluate(()=>__dockTest.wallet.coins),100);
  pass('new players can find their included truck and quick play retains the original tutorial');
  assert.deepEqual(errors,[]);pass('no browser runtime errors');fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,errors},null,2));
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
