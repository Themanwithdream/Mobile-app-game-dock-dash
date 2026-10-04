/* Gameplay timing and the two reported layouts, in touch-enabled Chromium. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.DOCK_TEST_OUTPUT || path.join(os.tmpdir(),'dock-dash-engine-checks');
fs.mkdirSync(output,{recursive:true});
const url='http://127.0.0.1:8842/';
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const html=source.replace('  buildBelt(); parcelCache',`  window.__dockTest={engine,frame,render,settings,profile,discovered,update,startGame,gameOver,pauseGame,backToTitle,openBriefing,launchMission,
    get state(){return state;},get game(){return game;},get paused(){return paused;},get records(){return missionRecords;},get scene(){return activeLocation;},get art(){return pixelArt;},get clock(){return clock;},get selectedCargo(){return selectedCargo;}};
  buildBelt(); parcelCache`);
assert.notEqual(html,source);
const checks=[],errors=[];
function pass(name,detail){checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));}
function overlap(a,b){return a.x<b.x+b.width && a.x+a.width>b.x && a.y<b.y+b.height && a.y+a.height>b.y;}
async function setup(page){
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(url,route=>route.fulfill({status:200,contentType:'text/html',body:html}));
  await page.addInitScript(()=>{
    window.requestAnimationFrame=()=>0;
    localStorage.setItem('dockDashMuted','true');localStorage.setItem('dockDashBest','12345');
    localStorage.setItem('dockDashProfileV2',JSON.stringify({totalDelivered:336,totalPerfect:80,totalTrucks:40,totalGoals:20,highestShift:12,selectedSkin:3,tutorialDone:true}));
    localStorage.setItem('dockDashCargoCollectionV1','[3,14,29]');
    localStorage.setItem('dockDashMissionsV1',JSON.stringify({'matchday-1':{stars:3,bestScore:1000,bestTime:20}}));
    window.__draws=0;window.__texts=[];
    const fill=CanvasRenderingContext2D.prototype.fillRect;
    CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){if(this.canvas.id==='game'&&x===-12&&y===-12)__draws++;return fill.call(this,x,y,w,h);};
    const text=CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText=function(str,x,y,...args){if(this.canvas.id==='game')__texts.push({str:String(str),x,y});return text.call(this,str,x,y,...args);};
  });
  await page.goto(url);await page.waitForFunction(()=>window.__dockTest && [0,2,3,4,5,6].every(i=>__dockTest.art[i]),null,{polling:50});
}
async function frame(page,now){await page.evaluate(now=>__dockTest.frame(now),now);}
(async()=>{
  const server=spawn('python',['-m','http.server','8842','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
  let browser;
  try{
    for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch(_){}await new Promise(r=>setTimeout(r,100));}
    browser=await chromium.launch({executablePath:process.env.DOCK_CHROME || '/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell',headless:true,args:['--no-sandbox','--autoplay-policy=document-user-activation-required']});
    const mobile=await browser.newContext({viewport:{width:414,height:896},hasTouch:true,isMobile:true,deviceScaleFactor:2});
    const page=await mobile.newPage();await setup(page);
    await page.evaluate(()=>{__dockTest.settings.location=2;__dockTest.startGame({skipTutorial:true});__dockTest.game.readyIn=0;__dockTest.pauseGame(true);__texts.length=0;__dockTest.render();});
    assert.equal(await page.locator('#pause-hint').isVisible(),false);
    assert.equal(await page.evaluate(()=>__texts.some(t=>t.str.includes('ESC TO RESUME'))),false);
    await page.screenshot({path:path.join(output,'phone-pause-fixed.png')});
    for(const size of [{width:320,height:568},{width:390,height:844},{width:414,height:896},{width:844,height:390}]){
      await page.setViewportSize(size);
      await page.waitForFunction(()=>{const v=document.getElementById('viewport'),b=v.getBoundingClientRect(),c=getComputedStyle(v),s=Math.min((b.width-parseFloat(c.paddingLeft)-parseFloat(c.paddingRight))/360,(b.height-parseFloat(c.paddingTop)-parseFloat(c.paddingBottom))/640);return Math.abs(document.getElementById('stage').getBoundingClientRect().width-360*s)<1;},null,{polling:50});
      const {exit,extras,stage}=await page.evaluate(()=>{const box=id=>{const b=document.querySelector(id).getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};};return {exit:box('#exit-run'),extras:box('.pause-menu .catalog-button'),stage:box('#stage')};});
      assert.equal(overlap(exit,extras),false,JSON.stringify({size,exit,extras,stage}));
      assert.ok(exit.y+exit.height<=stage.y+stage.height);
    }
    pass('phone pause controls have no overlapping keyboard text at four screen sizes');
    await page.setViewportSize({width:414,height:896});
    const frozen=await page.evaluate(()=>{
      const d=__dockTest;d.engine.reset();__draws=0;const before={clock:d.clock,y:d.game.parcels.map(p=>p.y)};
      for(let i=0;i<=120;i++)d.frame(i*1000/120);
      return {draws:__draws,before,after:{clock:d.clock,y:d.game.parcels.map(p=>p.y)}};
    });
    assert.equal(frozen.draws,1);assert.deepEqual(frozen.after,frozen.before);
    pass('paused gameplay stays visually frozen and paints once across 120 callbacks',frozen.draws);
    await page.locator('.pause-menu .catalog-button').tap();await frame(page,1020);
    const catalogDraws=await page.evaluate(()=>__draws);
    await page.locator('.cargo-choice').first().tap();await frame(page,1040);
    assert.ok(await page.evaluate(()=>__dockTest.selectedCargo)>=0);
    assert.equal(await page.evaluate(()=>__draws),catalogDraws+1);
    pass('static menus repaint immediately when cargo selection changes');
    await page.locator('#catalog-back').tap();
    await page.locator('#exit-run').tap();assert.equal(await page.evaluate(()=>__dockTest.state),'title');
    await page.locator('#start').tap();
    await page.evaluate(()=>{Object.assign(__dockTest.game,{score:18055,delivered:136,shift:12,perfects:59,dispatched:26,goalsCompleted:10});__dockTest.gameOver();__dockTest.frame(1050);__dockTest.render();});
    assert.equal(await page.locator('#arcade-home').isVisible(),true);
    assert.equal(await page.locator('#arcade-home').isDisabled(),true);
    await page.waitForTimeout(520);await frame(page,1070);
    assert.equal(await page.locator('#arcade-home').isDisabled(),false);
    const home=await page.locator('#arcade-home').boundingBox(),cargo=await page.locator('.end-menu .catalog-button').boundingBox(),stage=await page.locator('#stage').boundingBox();
    assert.equal(overlap(home,cargo),false);assert.ok(home.y+home.height<=stage.y+stage.height);
    await page.screenshot({path:path.join(output,'arcade-results-home.png')});
    const beforeHome=await page.evaluate(()=>({best:localStorage.getItem('dockDashBest'),records:__dockTest.records,profile:{...__dockTest.profile},cargo:[...__dockTest.discovered]}));
    await page.locator('#arcade-home').tap();
    assert.equal(await page.evaluate(()=>__dockTest.state),'title');assert.equal(await page.evaluate(()=>__dockTest.game),null);
    assert.equal(await page.evaluate(()=>__dockTest.scene),2);
    assert.deepEqual(await page.evaluate(()=>({best:localStorage.getItem('dockDashBest'),records:__dockTest.records,profile:{...__dockTest.profile},cargo:[...__dockTest.discovered]})),beforeHome);
    assert.equal(beforeHome.best,'18055');
    pass('arcade results return home after the tap guard and preserve best score, stars, cargo and fleet');
    await page.locator('#start').tap();assert.equal(await page.evaluate(()=>__dockTest.game.readyIn),3);
    await page.evaluate(()=>{__dockTest.gameOver();__dockTest.frame(1080);});await page.waitForTimeout(520);await frame(page,1100);
    await page.locator('#replay').tap();assert.equal(await page.evaluate(()=>__dockTest.game.readyIn),3);
    pass('home-to-arcade and results-to-replay both retain the three-second start');
    const timing=await page.evaluate(()=>{
      const d=__dockTest,results=[];
      for(const hz of [30,60,120]){
        d.openBriefing('matchday',0);d.launchMission();__draws=0;
        for(let i=0;i<=Math.round(hz*3.4);i++)d.frame(i*1000/hz);
        results.push({hz,ready:d.game.readyIn,elapsed:d.game.missionElapsed,y:d.game.parcels.map(p=>p.y),lives:d.game.lives,draws:__draws});
      }
      return results;
    });
    for(const r of timing){assert.equal(r.ready,0);assert.ok(Math.abs(r.elapsed-.4)<1e-9);assert.equal(r.lives,3);assert.deepEqual(r.y,timing[0].y);}
    assert.ok(timing[2].draws<=206);assert.equal(timing[2].draws,timing[1].draws);
    pass('actual missions have matching countdown, positions and deadlines at 30, 60 and 120 Hz',timing);
    const hitch=await page.evaluate(()=>{
      const d=__dockTest;d.launchMission();d.game.readyIn=0;d.engine.reset();d.frame(0);d.frame(100);d.frame(280);
      const before={elapsed:d.game.missionElapsed,y:d.game.parcels.map(p=>p.y),lives:d.game.lives};
      d.frame(1280);return {before,after:{elapsed:d.game.missionElapsed,y:d.game.parcels.map(p=>p.y),lives:d.game.lives},paused:d.paused};
    });
    assert.ok(Math.abs(hitch.before.elapsed-.275)<1e-9);assert.deepEqual(hitch.after,hitch.before);assert.equal(hitch.paused,true);
    await page.locator('#resume').tap();await frame(page,10000);
    assert.equal(await page.evaluate(()=>__dockTest.game.missionElapsed),hitch.before.elapsed);
    await frame(page,10010);assert.ok(await page.evaluate(()=>__dockTest.game.missionElapsed)>hitch.before.elapsed);
    pass('short hitches catch up; a one-second freeze pauses without lost lives or mission time');
    const visibleTime=await page.evaluate(()=>__dockTest.game.missionElapsed);
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    const drawsBeforeHidden=await page.evaluate(()=>__draws);await frame(page,20000);
    assert.equal(await page.evaluate(()=>__draws),drawsBeforeHidden);
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});
    await frame(page,30000);assert.equal(await page.evaluate(()=>__dockTest.game.missionElapsed),visibleTime);
    assert.equal(await page.evaluate(()=>__dockTest.paused),true);
    pass('hidden pages draw nothing and return paused with the mission deadline preserved');
    await mobile.close();
    const desktop=await browser.newContext({viewport:{width:1100,height:800}});
    const pc=await desktop.newPage();await setup(pc);
    await pc.evaluate(()=>{__dockTest.startGame({skipTutorial:true});__dockTest.pauseGame(true);__texts.length=0;__dockTest.render();});
    assert.equal(await pc.evaluate(()=>__texts.some(t=>t.str==='GET READY')),false);
    assert.equal(await pc.locator('#pause-hint').isVisible(),true);
    const hint=await pc.locator('#pause-hint').boundingBox(),exit=await pc.locator('#exit-run').boundingBox();
    assert.equal(overlap(hint,exit),false);
    await pc.screenshot({path:path.join(output,'desktop-pause-fixed.png')});
    pass('desktop keyboard hint occupies its own row below the back button');
    await desktop.close();assert.deepEqual(errors,[]);pass('no browser runtime errors');
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,timing,errors},null,2));
  }finally{if(browser)await browser.close();server.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
