/* Real controls for backup/undo; fixed-step missions and bounded long sessions. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'..'),out=process.env.DOCK_TEST_OUTPUT||path.join(os.tmpdir(),'dock-journey-upgrade'),url='http://127.0.0.1:8862/';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'index.html'),'utf8'),html=source.replace('  buildBelt(); parcelCache',`  window.__journey={MR,ER,WC,backups,engine,frameBudget,profile,settings,render,update,frame,fit,startGame,openBriefing,backToTitle,pauseGame,openOverlay,loadLane,nextParcel,saveSnapshot,applyEffectSettings,imageSources,previewFloors,cargoSprites,parcelSprites,particles,flights,ghosts,
 get state(){return state;},get game(){return game;},get records(){return missionRecords;},get reduced(){return reducedMotion;},get autoEffects(){return autoEffects;},get art(){return pixelArt;},
 setRecords(r){missionRecords=MR.readRecords(r);syncControls();}};
  buildBelt(); parcelCache`);assert.notEqual(source,html);
const errors=[],checks=[],pass=(name,detail)=>{checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));};
async function setup(p){
 await p.route(url,r=>r.fulfill({contentType:'text/html',body:html}));
 await p.addInitScript(()=>{requestAnimationFrame=()=>0;if(!localStorage.getItem('dockDashProfileV2')){localStorage.setItem('dockDashMuted','true');localStorage.setItem('dockDashProfileV2',JSON.stringify({totalDelivered:240,totalPerfect:80,totalTrucks:40,totalGoals:20,highestShift:12,selectedSkin:4,tutorialDone:true}));localStorage.setItem('dockDashWalletV1',JSON.stringify({version:1,coins:5000,earned:5200,spent:200,owned:['school']}));localStorage.setItem('dockDashBest','12345');localStorage.setItem('dockDashCargoCollectionV1','[3,14,29]');localStorage.setItem('dockDashSettingsV3',JSON.stringify({location:0,rotate:false,music:true,sfx:true,musicVolume:.65}));}});
 p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.waitForFunction(()=>window.__journey&&__journey.art[0],null,{polling:50});
}
async function advance(p,seconds){await p.evaluate(seconds=>{for(let left=seconds;left>1e-8;left-=1/120)__journey.update(Math.min(left,1/120));__journey.render();},seconds);}
async function begin(p,world,stage=0){await p.evaluate(({world,stage})=>{const d=__journey;if(stage)d.setRecords({...d.records,[world+'-'+stage]:{stars:3,bestScore:0,bestTime:1}});d.openBriefing(world,stage);d.startGame({mission:d.MR.getMission(world,stage),skipTutorial:true});d.game.readyIn=0;d.render();},{world,stage});}
async function deliver(p,count){await p.evaluate(count=>{const d=__journey;for(let i=0;i<120*120&&d.state==='play'&&d.game.delivered<count;i++){d.update(1/120);const t=d.nextParcel();if(!d.game.hold&&!d.game.worldRun.pause&&t&&t.y>=363)d.loadLane(d.game.trucks.findIndex(x=>(t.type===4||x.type===t.type)&&!(d.game.shift===1&&x.type===3)));}d.render();if(d.game.delivered!==count)throw Error('Target was not reachable');},count);}
async function preferences(p){await p.evaluate(()=>__journey.backToTitle());await p.locator('.settings-button:visible').tap();await p.locator('#preferences-open').tap();}
async function snap(p){return p.evaluate(()=>__journey.saveSnapshot());}
async function importText(p,text){const chooser=p.waitForEvent('filechooser');await p.locator('#backup-import').tap();await (await chooser).setFiles({name:'dock-dash-backup.json',mimeType:'application/json',buffer:Buffer.from(text)});await p.waitForFunction(()=>document.getElementById('backup-status').textContent!=='Reading your backup…',null,{polling:50,timeout:5000});}
(async()=>{
 const server=spawn('python',['-m','http.server','8862','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;
 try{
  for(let i=0;i<40;i++){try{if((await fetch(url)).ok)break;}catch(_){}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:process.env.DOCK_CHROME,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:664},isMobile:true,hasTouch:true,deviceScaleFactor:2,acceptDownloads:true}),p=await context.newPage();await setup(p);
  const initial=await snap(p);assert.equal(initial.settings.effects,'auto');assert.equal(initial.wallet.coins,5000);assert.equal(initial.profile.selectedSkin,4);
  await p.locator('#missions').tap();await p.locator('#mission-search').fill('Roman Empire');await p.locator('[data-world="rome"]').tap();assert.equal(await p.locator('#world-challenge-title').textContent(),'Merchant convoy');assert.match(await p.locator('#world-challenge-copy').textContent(),/Three parcels/);await p.locator('#world-challenge-copy').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,'world-challenge-briefing.png')});
  pass('previous saves keep their coins, equipment and settings, and native briefings explain the new challenge');

  await begin(p,'rome');const types=await p.evaluate(()=>__journey.game.parcels.map(x=>x.type));assert.equal(new Set(types).size,1);await p.screenshot({path:path.join(out,'roman-convoy.png')});
  await begin(p,'greenwood');const trail=await p.evaluate(()=>__journey.game.parcels.map(x=>x.type));assert.equal(new Set(trail).size,3);
  await begin(p,'school',1);assert.deepEqual(await p.evaluate(()=>__journey.game.parcels.map(x=>x.product)),await p.evaluate(()=>__journey.game.mission.priorityProducts));
  pass('real mission starts use merchant groups, woodland sticker trails and complete school supply sets');

  await begin(p,'matchday',1);await deliver(p,6);let pace=await p.evaluate(()=>({pace:__journey.game.worldRun.pace,target:__journey.game.worldRun.target,phase:__journey.game.worldRun.phase}));assert.equal(pace.pace,1);assert.equal(pace.phase,'active');await advance(p,.2);pace=await p.evaluate(()=>({pace:__journey.game.worldRun.pace,target:__journey.game.worldRun.target}));assert.ok(pace.pace>1&&pace.pace<pace.target);
  await begin(p,'canal',1);await deliver(p,8);assert.equal(await p.evaluate(()=>__journey.game.worldRun.phase),'active');
  pass('sports rushes and tides start through successful deliveries and ease into the new pace');

  await begin(p,'build',2);await deliver(p,6);const before=await p.evaluate(()=>({time:__journey.game.missionElapsed,score:__journey.game.score,y:__journey.game.parcels.map(x=>x.y),pause:__journey.game.worldRun.pause}));assert.ok(before.pause>0);
  await advance(p,.3);await p.evaluate(()=>__journey.loadLane(0));assert.deepEqual(await p.evaluate(()=>({time:__journey.game.missionElapsed,score:__journey.game.score,y:__journey.game.parcels.map(x=>x.y)})),{time:before.time,score:before.score,y:before.y});await p.screenshot({path:path.join(out,'crane-rest.png')});
  const rest=await p.evaluate(()=>__journey.game.worldRun.pause);await p.evaluate(()=>__journey.pauseGame(true));await advance(p,10);assert.equal(await p.evaluate(()=>__journey.game.worldRun.pause),rest);await p.evaluate(()=>__journey.pauseGame(false));await advance(p,.6);assert.equal(await p.evaluate(()=>__journey.game.worldRun.pause),0);assert.ok(await p.evaluate(()=>__journey.game.missionElapsed)>before.time);
  pass('crane lifts freeze parcels, taps and the mission timer, and game pause also freezes the lift');

  await preferences(p);await p.locator('#effects-toggle').tap();assert.equal(await p.locator('#effects-toggle').textContent(),'Visual effects: Reduced');assert.equal(await p.evaluate(()=>__journey.reduced),true);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('dockDashSettingsV3')).effects),'reduced');await p.screenshot({path:path.join(out,'preferences-phone.png')});
  await p.keyboard.press('Escape');assert.equal(await p.locator('#preferences-dialog').isVisible(),false);assert.equal(await p.evaluate(()=>__journey.state),'settings');
  const timing=await p.evaluate(()=>{const d=__journey,results=[];for(const mode of ['full','reduced']){d.settings.effects=mode;d.applyEffectSettings();d.startGame({mission:d.MR.getMission('rome',0),skipTutorial:true});for(let i=0;i<=408;i++)d.frame(i*1000/120);results.push({time:d.game.missionElapsed,y:d.game.parcels.map(x=>x.y),lives:d.game.lives});}return results;});assert.deepEqual(timing[0],timing[1]);
  await p.evaluate(()=>{const d=__journey;d.settings.effects='reduced';d.applyEffectSettings();});await begin(p,'rome');await deliver(p,1);assert.deepEqual(await p.evaluate(()=>[__journey.particles.length,__journey.flights.length,__journey.ghosts.length]),[0,0,0]);
  pass('Reduced effects is a native saved control, removes decoration, and keeps identical 120-step game timing');

  await p.evaluate(()=>{const d=__journey;d.settings.effects='auto';d.applyEffectSettings();d.startGame({mission:d.MR.getMission('rome',0),skipTutorial:true});d.game.readyIn=0;for(let i=0;i<220;i++){d.frame(i*33);const t=d.nextParcel();if(t&&t.y>=363&&!d.game.hold)d.loadLane(d.game.trucks.findIndex(x=>t.type===4||x.type===t.type));}});assert.equal(await p.evaluate(()=>__journey.autoEffects),true);assert.equal(await p.evaluate(()=>__journey.reduced),true);assert.ok(await p.evaluate(()=>__journey.frameBudget.scale)<2);
  pass('sustained slow frames automatically simplify decoration without changing matching controls');

  await preferences(p);const previous=await snap(p),downloadEvent=p.waitForEvent('download');await p.locator('#backup-export').tap();const download=await downloadEvent,text=fs.readFileSync(await download.path(),'utf8');assert.match(download.suggestedFilename(),/^parcel-odyssey-backup-\d{4}-\d{2}-\d{2}\.json$/);assert.deepEqual(await p.evaluate(text=>__journey.backups.read(text).data,text),previous);
  const incoming=JSON.parse(JSON.stringify(previous));Object.assign(incoming.wallet,{coins:7000,earned:9200,spent:2200,owned:['school','beacon-runner','venue:rome','zone:gold','wrap:stars']});Object.assign(incoming.profile,{selectedSkin:14,selectedWrap:'wrap:stars',selectedZone:'zone:gold'});Object.assign(incoming.settings,{location:13,effects:'reduced'});incoming.best=54321;incoming.cargo=[1,3,15,678,1499];incoming.missions={'rome-1':{stars:3,bestScore:1500,bestTime:20}};
  const imported=await p.evaluate(data=>__journey.backups.export(data,'2026-10-07T14:00:00Z'),incoming);await importText(p,imported);assert.equal(await p.locator('#backup-preview').isVisible(),true);assert.match(await p.locator('#backup-comparison').textContent(),/7,000/);assert.deepEqual(await snap(p),previous);await p.screenshot({path:path.join(out,'backup-preview.png')});
  pass('export downloads a complete live save and import previews comparisons before changing anything');
  await p.locator('#preferences-content').evaluate(e=>e.scrollTop=0);const scrollBefore=await p.locator('#preferences-content').evaluate(e=>e.scrollTop),bounds=await p.locator('#preferences-content').boundingBox(),closeBefore=await p.locator('#preferences-close').boundingBox(),touch=await context.newCDPSession(p),tx=bounds.x+bounds.width*.8,ty=bounds.y+bounds.height*.8,drag=bounds.height*.55;
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tx,y:ty}]});for(let i=1;i<=8;i++){await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:tx,y:ty-i*drag/8}]});await new Promise(r=>setTimeout(r,20));}await new Promise(r=>setTimeout(r,200));await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.detach();
  await p.waitForFunction(before=>document.getElementById('preferences-content').scrollTop>before+20,scrollBefore,{polling:50,timeout:5000});assert.deepEqual(await p.locator('#preferences-close').boundingBox(),closeBefore);assert.deepEqual(await snap(p),previous);
  pass('trusted phone swipes scroll the backup panel while the close button stays fixed and progress is untouched');
  await p.locator('#backup-restore').tap();assert.equal(await p.evaluate(()=>__journey.state),'title');assert.deepEqual(await snap(p),incoming);assert.equal(await p.locator('#backup-undo').isVisible(),true);await p.locator('#backup-undo').tap();assert.deepEqual(await snap(p),previous);assert.equal(await p.locator('#backup-undo').isVisible(),false);
  pass('native Restore and Undo preserve exact coins, truck, style, place, stars and discovered cargo');

  await importText(p,imported);await p.locator('#backup-restore').tap();await p.reload();await p.waitForFunction(()=>window.__journey&&__journey.art[13],null,{polling:50});assert.deepEqual(await snap(p),incoming);await preferences(p);assert.equal(await p.locator('#backup-undo').isVisible(),true);await p.locator('#backup-undo').tap();assert.deepEqual(await snap(p),previous);
  pass('restored progress and its undo copy both survive closing and reloading the game');
  const invalidBefore=await snap(p);for(const bad of ['{broken',imported.replace('7000','0'),'{}']){await importText(p,bad);assert.equal(await p.locator('#backup-preview').isVisible(),false);assert.equal(await p.locator('#backup-status').getAttribute('data-error'),'true');assert.deepEqual(await snap(p),invalidBefore);}
  pass('damaged or unrelated files show an error and cannot apply an old preview or change the save');

  await importText(p,imported);const storedBefore=await p.evaluate(()=>Object.fromEntries(Object.values(DockDashBackups.keys).map(k=>[k,localStorage.getItem(k)])));
  await p.evaluate(()=>{const original=Storage.prototype.setItem;let once=true;window.__restoreStorage=()=>Storage.prototype.setItem=original;Storage.prototype.setItem=function(k,v){if(k==='dockDashMissionsV1'&&once){once=false;throw new DOMException('test quota','QuotaExceededError');}return original.call(this,k,v);};});
  await p.locator('#backup-restore').tap();await p.evaluate(()=>__restoreStorage());assert.deepEqual(await snap(p),invalidBefore);assert.deepEqual(await p.evaluate(()=>Object.fromEntries(Object.values(DockDashBackups.keys).map(k=>[k,localStorage.getItem(k)]))),storedBefore);assert.equal(await p.locator('#backup-status').getAttribute('data-error'),'true');
  await p.evaluate(()=>{const previous=Object.fromEntries(Object.values(DockDashBackups.keys).map(k=>[k,localStorage.getItem(k)]));localStorage.setItem(DockDashBackups.journalKey,JSON.stringify({status:'pending',previous}));localStorage.setItem('dockDashWalletV1','{"coins":0}');});await p.reload();await p.waitForFunction(()=>window.__journey,null,{polling:50});assert.deepEqual(await snap(p),invalidBefore);
  pass('storage failures roll back and an interrupted restore is recovered before the next app launch');

  await preferences(p);
  for(const size of [{width:320,height:568},{width:390,height:664},{width:430,height:932},{width:844,height:390},{width:1280,height:800}]){
    await p.setViewportSize(size);const box=await p.locator('#preferences-dialog').boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=size.width+.5&&box.y+box.height<=size.height+.5,JSON.stringify({size,box}));
    for(const id of ['effects-toggle','backup-export','backup-import','preferences-close']){await p.locator('#'+id).scrollIntoViewIfNeeded();assert.ok((await p.locator('#'+id).boundingBox()).height>=44);}
    assert.equal(await p.locator('#preferences-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
  }
  pass('the native settings and backup dialog stays readable and reachable in five phone and desktop sizes');
  await p.locator('#preferences-close').tap();

  const longSession=await p.evaluate(()=>{
    const d=__journey,worlds=['matchday','rome','build','canal','school','greenwood'];let completed=0,next=0;
    d.setRecords({...d.records,...Object.fromEntries(worlds.map(id=>[id+'-7',{stars:3,bestScore:0,bestTime:1}]))});d.settings.effects='reduced';d.applyEffectSettings();
    function start(){const id=worlds[next++%worlds.length];d.openBriefing(id,7);d.startGame({mission:d.MR.getMission(id,7),skipTutorial:true});}
    start();
    for(let frame=0;frame<1200*120;frame++){
      if(d.state!=='play'){if(!d.records[d.game.mission.id]?.stars)throw Error('Long-session mission failed');completed++;start();}
      d.update(1/120);const t=d.nextParcel();if(!d.game.readyIn&&!d.game.hold&&!d.game.worldRun.pause&&t&&t.y>=363)d.loadLane(d.game.trucks.findIndex(x=>t.type===4||x.type===t.type));if(frame%120===0)d.render();
    }
    d.render();return {simulatedSeconds:1200,completed,images:d.imageSources.size,previews:d.previewFloors.entries.size,cargo:d.cargoSprites.entries.size,parcels:d.parcelSprites.entries.size,particles:d.particles.length,flights:d.flights.length};
  });assert.ok(longSession.completed>10);assert.ok(longSession.images<=12&&longSession.previews<=7&&longSession.cargo<=144&&longSession.parcels<=96);assert.equal(longSession.particles,0);assert.equal(longSession.flights,0);
  pass('a twenty-minute simulated phone session plays all six patterns while preserving bounded graphics caches',longSession);
  assert.deepEqual(errors,[]);pass('no browser runtime errors');fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,errors,longSession},null,2));
 }finally{await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
