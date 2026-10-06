/* Touch shop, wallet persistence, extra worlds and performance invariants. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.DOCK_TEST_OUTPUT || path.join(os.tmpdir(),'dock-dash-economy-checks'),url='http://127.0.0.1:8845/';
fs.mkdirSync(output,{recursive:true});const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const html=source.replace('  buildBelt(); parcelCache',`  window.__dockTest={ER,MR,SKINS,progress,profile,settings,discovered,openGarage,closeGarage,selectSkin,changeShopPage,changeMissionPage,openMissionMap,openBriefing,launchMission,startGame,loadLane,finishMission,finishTutorial,render,update,pauseGame,backToTitle,parcelSprites,previewFloors,trucksForSkin,
 get wallet(){return wallet;},get game(){return game;},get state(){return state;},get records(){return missionRecords;},get art(){return pixelArt;},get trucks(){return skinTruckCache;},get floors(){return locationFloors;}};
  buildBelt(); parcelCache`);
assert.notEqual(html,source);const checks=[],errors=[];
function pass(name,detail){checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));}
async function paint(page){await page.evaluate(()=>__dockTest.render());}
async function setup(page,profile){await page.route(url,route=>route.fulfill({contentType:'text/html',body:html}));await page.addInitScript(profile=>{
 window.requestAnimationFrame=()=>0;localStorage.setItem('dockDashMuted','true');
 if(!localStorage.getItem('dockDashProfileV2'))localStorage.setItem('dockDashProfileV2',JSON.stringify(profile));
 window.__newAssets=[];const src=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{...src,set(value){if(/beacon|school|dino|candy|forest|arctic/.test(value))__newAssets.push(value);return src.set.call(this,value);}});
 window.__counts={canvases:0,attributes:0,storage:0};const create=document.createElement.bind(document);document.createElement=(tag,...args)=>{if(tag==='canvas')__counts.canvases++;return create(tag,...args);};
 const set=Storage.prototype.setItem;window.__setItem=set;Storage.prototype.setItem=function(...a){__counts.storage++;return set.apply(this,a);};const attr=Element.prototype.setAttribute;Element.prototype.setAttribute=function(...a){__counts.attributes++;return attr.apply(this,a);};
 },profile);page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForFunction(()=>window.__dockTest && __dockTest.art[0] && __dockTest.art[2],null,{polling:50});}
async function clearMission(page,id,stage){return page.evaluate(({id,stage})=>{
 const d=__dockTest;d.openBriefing(id,stage);d.launchMission();d.game.readyIn=0;
 const before=d.wallet.coins,mission=d.game.mission;
 for(let i=0;d.state==='play' && i<mission.loads;i++){
   const type=i%3,lane=d.game.trucks.findIndex(t=>t.type===type);d.game.hold=0;d.game.parcels=[{type,product:mission.priorityProducts[i%3],kind:'normal',y:372,phase:0}];d.render();d.loadLane(lane);
 }
 d.render();return {earned:d.game.coinsEarned,before,after:d.wallet.coins,state:d.state,stars:d.records[mission.id]?.stars,delivered:d.game.delivered,trucks:d.game.dispatched};
 },{id,stage});}
function overlap(a,b){return a.x<b.x+b.width && a.x+a.width>b.x && a.y<b.y+b.height && a.y+a.height>b.y;}
(async()=>{
 const server=spawn('python',['-m','http.server','8845','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;
 try{for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.DOCK_CHROME || '/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell',args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2}),page=await context.newPage();
 await setup(page,{totalDelivered:180,totalPerfect:64,totalTrucks:24,totalGoals:12,highestShift:9,selectedSkin:3,tutorialDone:true});
 assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),896);assert.equal(await page.evaluate(()=>__dockTest.profile.selectedSkin),3);
 assert.equal(await page.evaluate(()=>__newAssets.length),0);assert.equal(await page.evaluate(()=>__dockTest.trucks.filter(Boolean).length),1);
 pass('returning-player coins preserve the old fleet and load no extra worlds or unneeded trucks at launch');
 await page.locator('.fleet-button:visible').tap();await paint(page);await page.screenshot({path:path.join(output,'truck-shop.png')});
 await page.locator('[data-skin="7"]').tap();await paint(page);
 assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),576);assert.equal(await page.evaluate(()=>__dockTest.profile.selectedSkin),7);
 assert.match(await page.locator('#shop-message').textContent(),/purchased and equipped/);
 for(let i=0;i<3;i++)await page.locator('[data-skin="7"]').tap();
 assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),576);assert.equal(await page.evaluate(()=>__dockTest.wallet.spent),320);
 pass('native touch buys and equips Bat Courier once, with no double charge on repeated taps');
 await page.locator('#shop-prev').tap();await page.locator('[data-skin="3"]').tap();assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),576);
 await page.locator('#shop-next').tap();await page.locator('[data-skin="4"]').tap();await paint(page);await page.screenshot({path:path.join(output,'school-truck-purchased.png')});
 await page.reload();await page.waitForFunction(()=>!!window.__dockTest,null,{polling:50});
 assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),426);assert.deepEqual(await page.evaluate(()=>__dockTest.wallet.owned),['beacon','school']);assert.equal(await page.evaluate(()=>__dockTest.profile.selectedSkin),4);
 pass('paid trucks, equipped choice, balance and free legacy rewards persist without a second welcome gift');
 await page.locator('.fleet-button:visible').tap();await page.locator('#shop-next').tap();await page.locator('#shop-next').tap();await paint(page);
 assert.equal(await page.locator('.skin-choice:visible').count(),4);assert.equal(await page.locator('#shop-next').isDisabled(),false);
 await page.locator('[data-skin="13"]').tap();assert.match(await page.locator('#shop-message').textContent(),/Need 374 more/);assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),426);assert.equal(await page.evaluate(()=>__dockTest.profile.selectedSkin),4);
 pass('insufficient coins never buy, equip or deduct on a page shared with new special editions');
 await page.locator('#shop-prev').tap();await page.locator('#shop-prev').tap();
 await page.evaluate(()=>{Storage.prototype.setItem=function(key,...a){if(key==='dockDashWalletV1')throw new Error('storage full');return __setItem.call(this,key,...a);};});
 await page.locator('[data-skin="5"]').tap();assert.match(await page.locator('#shop-message').textContent(),/Coins kept/);assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),426);assert.equal(await page.evaluate(()=>__dockTest.wallet.owned.includes('matchday')),false);
 await page.evaluate(()=>{Storage.prototype.setItem=__setItem;});
 pass('a failed purchase save keeps every coin and does not grant an unrecorded truck');
 await page.locator('#garage-back').tap();await page.locator('#missions').tap();await page.locator('#missions-next').tap();await paint(page);
 await page.waitForFunction(()=>[7,8,9,10].every(i=>__dockTest.art[i]),null,{polling:50});await paint(page);await page.screenshot({path:path.join(output,'new-mission-worlds.png')});
 assert.deepEqual(await page.locator('.mission-card:visible').evaluateAll(a=>a.map(b=>b.dataset.world)),['beacon','school','dino','candy']);
 for(const id of ['beacon','school','dino','candy']){await page.locator(`[data-world="${id}"]`).tap();assert.equal(await page.evaluate(()=>__dockTest.game),null);await page.locator('#briefing-back').tap();}
 await page.locator('#missions-next').tap();await paint(page);assert.equal(await page.locator('.mission-card:visible').count(),2);assert.equal(await page.locator('#missions-next').isDisabled(),false);
 assert.deepEqual(await page.locator('.mission-card:visible').evaluateAll(a=>a.map(b=>b.dataset.world)),['forest','arctic']);
 await page.locator('#missions-next').tap();await paint(page);assert.equal(await page.locator('.mission-card:visible').count(),4);assert.equal(await page.locator('#missions-next').isDisabled(),false);
 assert.deepEqual(await page.locator('.mission-card:visible').evaluateAll(a=>a.map(b=>b.dataset.world)),['rome','egypt','viking','silkroad']);
 pass('all six new worlds are reachable through native paged mission cards and return to the same page');
 const first=await clearMission(page,'beacon',0);assert.equal(first.state,'missionResult');assert.equal(first.stars,3);assert.equal(first.earned,36+115);assert.equal(first.after-first.before,first.earned);
 const savedCoins=await page.evaluate(()=>JSON.parse(localStorage.getItem('dockDashWalletV1')).coins);assert.equal(savedCoins,first.after);
 await page.evaluate(()=>{__dockTest.finishMission(true);});assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),first.after);
 await page.screenshot({path:path.join(output,'beacon-result-coins.png')});
 pass('a new three-star mission grants delivery and first-clear coins exactly once and saves before results',first);
 await page.locator('#mission-shop').tap();assert.equal(await page.evaluate(()=>__dockTest.state),'garage');await page.locator('#garage-back').tap();assert.equal(await page.evaluate(()=>__dockTest.state),'missionResult');
 const repeat=await clearMission(page,'beacon',0);assert.equal(repeat.earned,36+20);assert.equal(repeat.after-repeat.before,56);
 pass('mission results open the shop and return safely; replays earn completion coins without another first-clear bonus');
 const arcade=await page.evaluate(()=>{
 const d=__dockTest;d.backToTitle();d.startGame({skipTutorial:true});d.game.readyIn=0;const before=d.wallet.coins;
 for(let i=0;i<12;i++){d.game.parcels=[{type:0,product:i,kind:'normal',y:372,phase:0}];d.render();d.loadLane(0);}
 const result={coins:d.wallet.coins-before,earned:d.game.coinsEarned,goals:d.game.goalsCompleted,trucks:d.game.dispatched,shift:d.game.shift};
 d.backToTitle();return result;
 });assert.deepEqual(arcade,{coins:77,earned:77,goals:1,trucks:2,shift:2});
 pass('arcade skill, two full trucks, a completed goal and the next shift award the exact coin total',arcade);
 const invalid=await page.evaluate(()=>{
 const d=__dockTest;d.backToTitle();d.startGame({skipTutorial:true});d.game.readyIn=0;const before=d.wallet.coins;
 const load=(type,y,lane,kind='normal')=>{d.game.parcels=[{type,product:348,kind,y,phase:0}];d.render();d.loadLane(lane);};
 load(0,290,0);load(0,372,1);const noReward=d.wallet.coins===before;
 load(0,372,0,'fragile');d.game.trucks[0].fill=4;load(0,330,0);const gains=d.wallet.coins-before;
 d.pauseGame(true);const stored=JSON.parse(localStorage.getItem('dockDashWalletV1')).coins;
 d.backToTitle();d.startGame({tutorial:true});d.game.readyIn=0;const practiceBefore=d.wallet.coins;
 for(let i=0;i<3;i++){d.game.parcels[0].y=372;d.render();d.loadLane(d.game.trucks.findIndex(t=>t.type===d.game.parcels[0].type || d.game.parcels[0].type===4));}
 return {noReward,gains,stored,current:practiceBefore,practice:d.wallet.coins-practiceBefore};
 });assert.equal(invalid.noReward,true);assert.equal(invalid.gains,4+2+8);assert.equal(invalid.stored,invalid.current);assert.equal(invalid.practice,0);
 pass('early taps, wrong docks and tutorial earn no coins; fragile perfects, truck dispatch and pause saves work',invalid);
 await page.evaluate(()=>{const d=__dockTest;d.backToTitle();d.startGame({skipTutorial:true});d.game.readyIn=0;d.game.parcels=[{type:0,product:360,kind:'normal',y:372,phase:0}];d.render();__counts.attributes=__counts.storage=0;d.loadLane(0);});
 assert.deepEqual(await page.evaluate(()=>({attributes:__counts.attributes,storage:__counts.storage})),{attributes:1,storage:0});
 const idle=await page.evaluate(()=>{const d=__dockTest;d.game.hold=100;d.render();const before=__counts.canvases;for(let i=0;i<120;i++)d.render();return __counts.canvases-before;});assert.equal(idle,0);
 pass('coin awards retain one dock update, deferred persistence and zero canvas allocations across 120 unchanged frames');
 for(const size of [{width:320,height:568},{width:390,height:844},{width:414,height:896},{width:844,height:390}]){
 await page.setViewportSize(size);await page.waitForFunction(()=>{const v=document.getElementById('viewport'),b=v.getBoundingClientRect(),c=getComputedStyle(v),s=Math.min((b.width-parseFloat(c.paddingLeft)-parseFloat(c.paddingRight))/360,(b.height-parseFloat(c.paddingTop)-parseFloat(c.paddingBottom))/640);return Math.abs(document.getElementById('stage').getBoundingClientRect().width-360*s)<1;},null,{polling:50});
 await page.evaluate(()=>{__dockTest.backToTitle();__dockTest.openGarage();__dockTest.render();});
 for(const section of ['#garage-menu','#missions-menu']){if(section.includes('missions'))await page.evaluate(()=>{__dockTest.openMissionMap();__dockTest.render();});
 const boxes=await page.locator(section+' button:visible').evaluateAll(a=>a.map(b=>{const r=b.getBoundingClientRect();return {id:b.id || b.className,x:r.x,y:r.y,width:r.width,height:r.height};})),stage=await page.locator('#stage').boundingBox();
 for(let i=0;i<boxes.length;i++){const a=boxes[i];assert.ok(a.y+a.height<=stage.y+stage.height+.5);for(let j=i+1;j<boxes.length;j++)assert.equal(overlap(a,boxes[j]),false,JSON.stringify({size,section,a,b:boxes[j]}));}
 }}pass('shop and mission controls fit four phone layouts with no overlapping hit areas');
 assert.deepEqual(errors,[]);pass('no browser runtime errors');fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,errors},null,2));
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
