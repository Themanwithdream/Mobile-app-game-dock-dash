/* Mission reading, scrolling, accessible level selection and fleet identity. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'..'),out=process.env.DOCK_TEST_OUTPUT||path.join(os.tmpdir(),'dock-dash-mission-design'),url='http://127.0.0.1:8861/';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'index.html'),'utf8'),html=source.replace('  buildBelt(); parcelCache',`  window.__missionDesign={MR,ER,COLORS,profile,settings,render,openBriefing,openMissionMap,backToTitle,trucksForSkin,imageSources,previewFloors,
 get state(){return state;},get game(){return game;},get wallet(){return wallet;},get selected(){return selectedMission;},get art(){return pixelArt;},get trucks(){return skinTruckCache;},
 setRecords(value){missionRecords=MR.readRecords(value);syncControls();}};
  buildBelt(); parcelCache`);assert.notEqual(html,source);
const checks=[],errors=[],pass=(name,detail)=>{checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));};
async function paint(p){await p.evaluate(()=>__missionDesign.render());}
async function fitText(p){return p.locator('.briefing-scroll h2,.briefing-scroll h3,.briefing-scroll p,.briefing-scroll summary,.briefing-cargo li,.briefing-star-goals dd').evaluateAll(a=>a.filter(e=>e.getBoundingClientRect().height).map(e=>({text:e.textContent,width:e.clientWidth,scroll:e.scrollWidth,font:parseFloat(getComputedStyle(e).fontSize)})));}
async function layout(p){
 const bounds=await p.evaluate(()=>{
  const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
  const scroll=box(document.getElementById('briefing-scroll')),actions=box(document.querySelector('.briefing-actions')),stage=box(document.getElementById('stage'));
  const visible=[];for(const b of document.querySelectorAll('#stage button')){if(!b.getClientRects().length)continue;const r=box(b),inScroll=b.closest('.briefing-scroll');if(inScroll&&(r.y+r.h<=scroll.y||r.y>=scroll.y+scroll.h))continue;visible.push({id:b.id||b.dataset.missionStage,...r});}return {scroll,actions,stage,visible};
 });
 assert.ok(bounds.scroll.y+bounds.scroll.h<=bounds.actions.y-1,JSON.stringify(bounds));
 for(const b of bounds.visible){assert.ok(b.x>=bounds.stage.x-.5&&b.x+b.w<=bounds.stage.x+bounds.stage.w+.5,JSON.stringify(b));}
 const start=await p.locator('#mission-launch').boundingBox(),back=await p.locator('#briefing-back').boundingBox();
 assert.ok(start.y+start.height<back.y);assert.ok(start.height>=44);assert.ok(back.height>=30);
 const titles=await fitText(p);for(const t of titles){assert.ok(t.scroll<=t.width+1,JSON.stringify(t));assert.ok(t.font>=11,JSON.stringify(t));}
 return bounds;
}
(async()=>{const server=spawn('python',['-m','http.server','8861','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;
try{
 for(let i=0;i<40;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.DOCK_CHROME||'/tmp/dock-ui-chrome/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:664},isMobile:true,hasTouch:true,deviceScaleFactor:2}),p=await context.newPage();
 await p.route(url,r=>r.fulfill({contentType:'text/html',body:html}));
 await p.addInitScript(()=>{requestAnimationFrame=()=>0;localStorage.setItem('dockDashMuted','true');localStorage.setItem('dockDashProfileV2',JSON.stringify({tutorialDone:true,totalDelivered:180,selectedSkin:4}));localStorage.setItem('dockDashWalletV1',JSON.stringify({version:1,coins:2000,earned:2500,spent:500,owned:['school']}));});
 p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.waitForFunction(()=>window.__missionDesign&&__missionDesign.art[0]);
 await p.locator('#missions').tap();await p.locator('#mission-search').fill('Roman Empire');await p.locator('[data-world="rome"]').tap();await paint(p);
 await p.waitForFunction(()=>{__missionDesign.render();return __missionDesign.art[13];});
 assert.equal(await p.locator('#mission-briefing-title').textContent(),'Roman Empire');assert.equal(await p.locator('#briefing-mission-title').textContent(),'Forum opening');
 assert.equal(await p.locator('#briefing-loads').textContent(),'12');assert.equal(await p.locator('#briefing-time').textContent(),'0:45');assert.match(await p.locator('#briefing-priority').textContent(),/3 priority packages/);assert.match(await p.locator('#briefing-reward-summary').textContent(),/115 completion coins/);
 assert.equal(await p.locator('.briefing-cargo li').count(),3);assert.equal(await p.evaluate(()=>__missionDesign.game),null);await layout(p);await p.screenshot({path:path.join(out,'rome-mission.png')});
 pass('the Roman mission shows readable native objectives and rewards without starting gameplay');
 const startBefore=await p.locator('#mission-launch').boundingBox();
 await p.locator('#briefing-level-jump').tap();assert.equal(await p.locator('[data-mission-stage="0"]').evaluate(e=>e===document.activeElement),true);
 const scrollBefore=await p.locator('#briefing-scroll').evaluate(e=>e.scrollTop),panelBounds=await p.locator('#briefing-scroll').boundingBox();
 const scrollBounds=await p.locator('[data-mission-stage="0"]').boundingBox(),touch=await context.newCDPSession(p),tx=scrollBounds.x+scrollBounds.width/2,ty=scrollBounds.y+scrollBounds.height/2,drag=Math.min(160,panelBounds.y+panelBounds.height-ty-16);
 assert.ok(drag>30);
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tx,y:ty}]});
 for(let i=1;i<=8;i++){await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:tx,y:ty+i*drag/8}]});await new Promise(r=>setTimeout(r,20));}
 await new Promise(r=>setTimeout(r,200));
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.detach();
 await p.waitForFunction(before=>document.getElementById('briefing-scroll').scrollTop<before-20,scrollBefore,{timeout:3000});
 assert.equal(await p.evaluate(()=>__missionDesign.selected.id),'rome-1');assert.equal(await p.evaluate(()=>__missionDesign.game),null);
 await p.locator('#briefing-scroll').focus();await p.keyboard.press('Home');assert.equal(await p.locator('#briefing-scroll').evaluate(e=>e.scrollTop),0);await p.keyboard.press('End');assert.ok(await p.locator('#briefing-scroll').evaluate(e=>e.scrollTop>0));
 await p.locator('#briefing-rewards summary').tap();assert.equal(await p.locator('#briefing-rewards').getAttribute('open'),'');assert.match(await p.locator('#briefing-perfect-goal').textContent(),/all three lives and 4 perfect loads/);
 await p.locator('#briefing-perfect-goal').scrollIntoViewIfNeeded();assert.deepEqual(await p.locator('#mission-launch').boundingBox(),startBefore);await layout(p);await p.screenshot({path:path.join(out,'rome-rewards.png')});
 pass('native scrolling and expanded star goals keep Start and Mission map fixed outside the content');
 await p.locator('#briefing-scroll').evaluate(e=>e.scrollTop=0);await p.locator('#briefing-story').tap();assert.equal(await p.locator('#story-dialog').isVisible(),true);await p.locator('#story-close').tap();assert.equal(await p.evaluate(()=>__missionDesign.state),'briefing');
 assert.equal(await p.locator('[data-mission-stage="1"]').isDisabled(),true);await p.locator('[data-mission-stage="1"]').evaluate(e=>e.click());assert.equal(await p.evaluate(()=>__missionDesign.selected.id),'rome-1');
 await p.evaluate(()=>__missionDesign.setRecords({'rome-1':{stars:2}}));await p.locator('[data-mission-stage="1"]').tap();assert.equal(await p.evaluate(()=>__missionDesign.selected.id),'rome-2');assert.equal(await p.locator('[data-mission-stage="1"]').getAttribute('aria-pressed'),'true');assert.equal(await p.evaluate(()=>__missionDesign.game),null);
 pass('story reading, locked levels and selecting the next unlocked level preserve the briefing workflow');
 await p.locator('[data-mission-stage="0"]').tap();assert.equal(await p.locator('#mission-launch span').first().textContent(),'Replay mission');assert.match(await p.locator('#briefing-best').textContent(),/BEST ★★☆/);assert.match(await p.locator('#briefing-reward-summary').textContent(),/35 completion coins/);
 const wallet=await p.evaluate(()=>[__missionDesign.wallet.coins,__missionDesign.profile.selectedSkin]);await p.locator('#mission-launch').tap();assert.equal(await p.evaluate(()=>__missionDesign.game.readyIn),3);assert.equal(await p.evaluate(()=>__missionDesign.game.mission.id),'rome-1');assert.deepEqual(await p.evaluate(()=>[__missionDesign.wallet.coins,__missionDesign.profile.selectedSkin]),wallet);
 pass('replay rewards reflect existing stars and starting keeps the countdown, coins and equipped truck');
 await p.evaluate(()=>{__missionDesign.backToTitle();__missionDesign.setRecords(Object.fromEntries(__missionDesign.MR.missions.map(m=>[m.id,{stars:3}])));});
 const reviewed=await p.evaluate(()=>{
  const d=__missionDesign;let count=0;const failures=[];
  for(const m of d.MR.missions){d.openBriefing(m.world.id,m.stage);d.render();for(const e of document.querySelectorAll('.briefing-world-heading,.briefing-mission-heading,.briefing-story-copy,.briefing-challenge,.briefing-rewards summary,.briefing-cargo li'))if(e.scrollWidth>e.clientWidth+1)failures.push({id:m.id,text:e.textContent,width:e.clientWidth,scroll:e.scrollWidth});count++;}
  return {count,failures};
 });assert.equal(reviewed.count,1416);assert.deepEqual(reviewed.failures,[]);pass('every title, story, supply label and reward wraps within its panel across all 1,416 missions',{missions:reviewed.count});
 for(const size of [{width:320,height:568},{width:390,height:664},{width:430,height:932},{width:844,height:390},{width:1280,height:800}]){
  await p.setViewportSize(size);await p.evaluate(()=>{window.dispatchEvent(new Event('resize'));__missionDesign.openBriefing('hundreddawn',7);__missionDesign.render();});
  await layout(p);await p.locator('#briefing-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);await layout(p);await p.locator('#briefing-scroll').evaluate(e=>e.scrollTop=0);if(size.width===320)await p.screenshot({path:path.join(out,'small-phone-mission.png')});
 }
 pass('long mission text and the fixed actions fit five phone, landscape and desktop layouts');
 await p.setViewportSize({width:390,height:664});
 const fleet=await p.evaluate(()=>{
  const d=__missionDesign,hashes=[],plates=[],examples=['classic','school','matchday','festival','rescue','fire-engine','monster','moon-rover','sky-glider','beacon-runner','cement-mixer','comet-courier'];
  const sheet=document.createElement('canvas');sheet.width=720;sheet.height=6*185;const c=sheet.getContext('2d');c.fillStyle='#112b38';c.fillRect(0,0,sheet.width,sheet.height);c.imageSmoothingEnabled=false;
  for(const [index,truck] of d.ER.trucks.entries()){
   const art=d.trucksForSkin(index);if(art!==d.trucksForSkin(index))throw new Error('Fleet is being repainted');
   const pixels=art[0].getContext('2d').getImageData(0,0,art[0].width,art[0].height).data;let hash=2166136261;for(const v of pixels)hash=Math.imul(hash^v,16777619)>>>0;hashes.push(hash);
   for(let type=0;type<4;type++){const image=art[type];plates.push({id:truck.id,type,width:image.width,height:image.height,pixel:Array.from(image.getContext('2d').getImageData(90,86,1,1).data),ink:d.COLORS[type].ink});}
   const sample=examples.indexOf(truck.id);if(sample>=0){const x=sample%2*360,y=Math.floor(sample/2)*185;c.fillStyle='#ffe2aa';c.font='bold 14px sans-serif';c.fillText(truck.name,x+12,y+19);for(let type=0;type<4;type++)c.drawImage(art[type],x+type*86+6,y+30,80,125);}
  }
  return {hashes,plates,loaded:d.trucks.filter(Boolean).length,sheet:sheet.toDataURL('image/png')};
 });
 assert.equal(fleet.loaded,37);assert.equal(new Set(fleet.hashes).size,37);
 for(const plate of fleet.plates){assert.equal(plate.width,180);assert.equal(plate.height,282);const rgb=plate.ink.match(/[0-9a-f]{2}/gi).map(v=>parseInt(v,16));assert.ok(rgb.every((v,i)=>Math.abs(v-plate.pixel[i])<=3),JSON.stringify(plate));assert.equal(plate.pixel[3],255);}
 fs.writeFileSync(path.join(out,'fleet-gallery.png'),Buffer.from(fleet.sheet.split(',')[1],'base64'));
 pass('all 37 fleets have distinct artwork, reuse cached sprites and retain all 148 correct sorting plates');
 await p.locator('#briefing-back').tap();assert.equal(await p.locator('#mission-search').inputValue(),'Roman Empire');await p.locator('#mission-home').tap();assert.equal(await p.locator('#start').isVisible(),true);
 assert.deepEqual(errors,[]);pass('returning to the filtered map and Home works with no browser runtime errors');
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,errors},null,2));
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
