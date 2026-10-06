/* Native expansion navigation, purchases, colour-sensitive cargo and original fleet art. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.DOCK_TEST_OUTPUT||path.join(os.tmpdir(),'dock-dash-expansion-checks'),url='http://127.0.0.1:8850/';
fs.mkdirSync(out,{recursive:true});const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const html=source.replace('  buildBelt(); parcelCache',`  window.__dockTest={MR,ER,COLORS,GOLD,PRODUCTS,profile,settings,openBriefing,launchMission,openMissionMap,backToTitle,changeMissionPage,changeShopCategory,changeShopPage,selectShopItem,parcelSprite,parcelSprites,trucksForSkin,productArt,render,update,
 get state(){return state;},get game(){return game;},get selected(){return selectedMission;},get art(){return pixelArt;},get records(){return missionRecords;},get wallet(){return wallet;},get scene(){return activeLocation;},get cache(){return productCache;}};
  buildBelt(); parcelCache`);assert.notEqual(html,source);
const checks=[],errors=[],requested=[];
const pass=(name,detail)=>{checks.push({name,detail});console.log('PASS '+name+(detail?' · '+JSON.stringify(detail):''));};
const overlap=(a,b)=>a.x<b.x+b.width-.5 && a.x+a.width>b.x+.5 && a.y<b.y+b.height-.5 && a.y+a.height>b.y+.5;
async function paint(page){await page.evaluate(()=>__dockTest.render());}
async function layout(page,selector){const boxes=await page.locator(selector+' button:visible').evaluateAll(a=>a.map(b=>{const r=b.getBoundingClientRect();return {id:b.id||b.dataset.shop||b.dataset.item||b.dataset.world,x:r.x,y:r.y,width:r.width,height:r.height};})),stage=await page.locator('#stage').boundingBox();for(let i=0;i<boxes.length;i++){const a=boxes[i];assert.ok(a.x>=stage.x-.5 && a.x+a.width<=stage.x+stage.width+.5 && a.y>=stage.y-.5 && a.y+a.height<=stage.y+stage.height+.5,JSON.stringify(a));for(let j=i+1;j<boxes.length;j++)assert.equal(overlap(a,boxes[j]),false,JSON.stringify({a,b:boxes[j]}));}}
(async()=>{
 const server=spawn('python',['-m','http.server','8850','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;
 try{
  for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:process.env.DOCK_CHROME||'/root/.cache/ms-playwright/dock-dash-chrome/chrome-headless-shell',args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/assets\/missions\/(diner|bakery|metro|canal|skyguard|arena|build|robot|prism)\.png/.test(r.url()))requested.push(r.url());});
  await page.route(url,r=>r.fulfill({contentType:'text/html',body:html}));
  await page.addInitScript(()=>{
    window.requestAnimationFrame=()=>0;
    if(!localStorage.getItem('dockDashProfileV2')){
      localStorage.setItem('dockDashProfileV2',JSON.stringify({totalDelivered:200,totalPerfect:90,totalTrucks:40,totalGoals:15,highestShift:10,selectedSkin:7,tutorialDone:true}));
      localStorage.setItem('dockDashWalletV1',JSON.stringify({version:1,coins:30000,earned:31000,spent:1000,owned:['batcave','wrap:hero','venue:rome']}));
    }
    localStorage.setItem('dockDashMuted','true');
  });
  await page.goto(url);await page.waitForFunction(()=>window.__dockTest && __dockTest.art[0],null,{polling:50});
  assert.equal(requested.length,0);assert.equal(await page.evaluate(()=>__dockTest.PRODUCTS.length),576);pass('nine added scenes stay lazy while the full 576-item catalog is available');
  await page.locator('#missions').tap();for(let i=0;i<4;i++)await page.locator('#missions-next').tap();await paint(page);
  assert.deepEqual(await page.locator('.mission-card:visible').evaluateAll(a=>a.map(b=>b.dataset.world)),['diner','bakery','metro','canal']);
  await page.waitForFunction(()=>[17,18,19,20].every(i=>__dockTest.art[i]),null,{polling:50});await paint(page);await page.screenshot({path:path.join(out,'city-life-map.png')});
  const worlds=[];
  for(const group of [['diner','bakery','metro','canal'],['skyguard','arena','build','robot'],['prism']]){
    for(const id of group){
      const before=await page.evaluate(()=>__dockTest.wallet.coins);await page.locator(`[data-world="${id}"]`).tap();
      assert.equal(await page.evaluate(()=>__dockTest.selected.stage),0);assert.equal(await page.locator('[data-mission-stage="1"]').isDisabled(),true);
      await paint(page);await page.waitForFunction(()=>__dockTest.art[__dockTest.selected.world.location],null,{polling:50});await paint(page);
      if(['diner','skyguard','prism'].includes(id))await page.screenshot({path:path.join(out,id+'-briefing.png')});
      await page.locator('#mission-launch').tap();await paint(page);
      const run=await page.evaluate(()=>({id:__dockTest.game.mission.id,scene:__dockTest.scene,ready:__dockTest.game.readyIn,cargo:__dockTest.game.parcels.map(p=>p.product),pool:__dockTest.game.mission.products}));
      assert.equal(run.ready,3);assert.ok(run.cargo.every(p=>run.pool.includes(p)));assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),before);worlds.push(run);
      await page.locator('#mission-home').tap();await page.locator('#missions').tap();
    }
    if(group[0]!=='prism')await page.locator('#missions-next').tap();
  }
  pass('all nine worlds are reachable through native cards, start free with a countdown and keep their own cargo',worlds);
  assert.equal(await page.locator('#missions-next').isDisabled(),true);await layout(page,'#missions-menu');await paint(page);await page.screenshot({path:path.join(out,'prism-map.png')});
  await page.locator('#mission-home').tap();await page.locator('.fleet-button:visible').tap();await page.locator('[data-shop="new"]').tap();await paint(page);
  assert.equal(await page.locator('[data-shop="new"]').textContent(),'New · 23');assert.deepEqual(await page.locator('.skin-choice:visible').evaluateAll(a=>a.map(b=>b.dataset.item)),['food-truck','bread-van','city-tram','canal-wagon']);await page.screenshot({path:path.join(out,'new-arrivals-shop.png')});
  pass('a dedicated New shop tab exposes the expansion without moving existing vehicles or purchases');
  const items=await page.evaluate(()=>__dockTest.ER.newItems.map(i=>({id:i.id,price:i.price}))),start=await page.evaluate(()=>__dockTest.wallet.coins);let spent=0;
  for(let i=0;i<items.length;i++){
    if(i>0 && i%4===0)await page.locator('#shop-next').tap();
    const item=items[i],button=page.locator(`[data-item="${item.id}"]`);await button.tap();spent+=item.price;
    assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),start-spent);await button.tap();assert.equal(await page.evaluate(()=>__dockTest.wallet.coins),start-spent);
    assert.equal(await button.getAttribute('aria-pressed'),'true');
  }
  assert.equal(await page.locator('#shop-next').isDisabled(),true);pass('all 23 native purchases deduct their exact cost, equip and reject repeat charges',{purchases:items.length,spent});
  for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1280,height:800}]){
    await page.setViewportSize(size);await page.evaluate(()=>window.dispatchEvent(new Event('resize')));
    for(const category of ['trucks','venues','styles','new']){await page.evaluate(c=>{__dockTest.changeShopCategory(c);__dockTest.render();},category);await layout(page,'#garage-menu');}
  }
  pass('four shop tabs and their controls fit small phones, landscape and desktop without overlap');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.dispatchEvent(new Event('resize')));
  const rings=await page.evaluate(()=>{
    const d=__dockTest,id=d.MR.getMission('prism',0).products[0],calls=[],original=DockDashExpansionArt.draw;
    DockDashExpansionArt.draw=function(c,kind,col){if(kind==='prismring')calls.push(col);return original(c,kind,col);};d.parcelSprites.clear();
    const sprites=[];for(let type=0;type<5;type++){const a=d.parcelSprite(type,'normal',id,'wrap:classic'),b=d.parcelSprite(type,'normal',id,'wrap:classic');if(a!==b)throw new Error('Ring cache miss');sprites.push(a);}
    DockDashExpansionArt.draw=original;
    const c=document.createElement('canvas');c.width=500;c.height=112;const ctx=c.getContext('2d');ctx.fillStyle='#142b39';ctx.fillRect(0,0,500,112);sprites.forEach((s,i)=>{ctx.drawImage(s,i*100+10,4,80,80);ctx.fillStyle='#fff0d1';ctx.font='12px sans-serif';ctx.fillText(i===4?'Golden star':d.COLORS[i].name,i*100+12,103);});
    return {calls,expected:[...d.COLORS,d.GOLD].map(c=>c.bright),image:c.toDataURL('image/png')};
  });assert.deepEqual(rings.calls,rings.expected);fs.writeFileSync(path.join(out,'colour-matched-rings.png'),Buffer.from(rings.image.split(',')[1],'base64'));
  pass('prism rings use the exact matching truck colour, retain sorting stickers and reuse cached artwork',rings.calls);
  const fleet=await page.evaluate(()=>{
    const d=__dockTest,c=document.createElement('canvas');c.width=480;c.height=9*155;const ctx=c.getContext('2d');ctx.fillStyle='#142b39';ctx.fillRect(0,0,c.width,c.height);const samples=[];
    d.ER.trucks.slice(20).forEach((truck,row)=>{
      const art=d.trucksForSkin(d.ER.trucks.indexOf(truck));art.slice(0,4).forEach((image,type)=>{
        const x=45*image.width/90,y=43*image.height/141,rgba=Array.from(image.getContext('2d').getImageData(Math.floor(x),Math.floor(y),1,1).data);
        samples.push({truck:truck.id,type,rgba,ink:d.COLORS[type].ink});ctx.drawImage(image,type*120+18,row*155,90,141);
      });ctx.fillStyle='#fff0d1';ctx.font='11px sans-serif';ctx.fillText(truck.name,5,row*155+153);
    });return {samples,image:c.toDataURL('image/png')};
  });
  for(const s of fleet.samples){const rgb=s.ink.match(/[0-9a-f]{2}/gi).map(x=>parseInt(x,16));assert.ok(rgb.every((v,i)=>Math.abs(v-s.rgba[i])<=3),JSON.stringify(s));}
  fs.writeFileSync(path.join(out,'new-fleet.png'),Buffer.from(fleet.image.split(',')[1],'base64'));pass('all nine original vehicle bodies keep the four correct sorting plates',fleet.samples.length);
  const atlas=await page.evaluate(()=>{
    const d=__dockTest,c=document.createElement('canvas');c.width=820;c.height=9*80;const ctx=c.getContext('2d');ctx.fillStyle='#142b39';ctx.fillRect(0,0,c.width,c.height);
    d.MR.worlds.slice(14).forEach((w,row)=>{ctx.fillStyle=w.accent;ctx.font='12px sans-serif';ctx.fillText(w.badge,4,row*80+40);d.MR.getMission(w.id,0).products.forEach((id,i)=>{ctx.drawImage(d.cache[id],92+i*60,row*80+4,48,48);ctx.fillStyle='#e7e9d4';ctx.font='8px sans-serif';ctx.fillText(d.PRODUCTS[id].kind.slice(0,12),87+i*60,row*80+64);});});return c.toDataURL('image/png');
  });fs.writeFileSync(path.join(out,'new-cargo.png'),Buffer.from(atlas.split(',')[1],'base64'));pass('all 108 new cargo illustrations render into the collection cache');
  await page.reload();await page.waitForFunction(()=>window.__dockTest && __dockTest.art[0],null,{polling:50});
  const saved=await page.evaluate(()=>({coins:__dockTest.wallet.coins,spent:__dockTest.wallet.spent,owned:__dockTest.wallet.owned,skin:__dockTest.ER.trucks[__dockTest.profile.selectedSkin].id,wrap:__dockTest.profile.selectedWrap,zone:__dockTest.profile.selectedZone,location:__dockTest.settings.location}));
  assert.equal(saved.coins,start-spent);assert.equal(saved.spent,1000+spent);assert.ok(items.every(i=>saved.owned.includes(i.id)));assert.ok(['batcave','wrap:hero','venue:rome'].every(id=>saved.owned.includes(id)));assert.equal(saved.skin,'prism-hauler');assert.equal(saved.wrap,'wrap:prism');assert.equal(saved.zone,'zone:circuit');assert.equal(saved.location,25);
  pass('new purchases and equipment persist together with the previous wallet and ownership after reload',saved);
  assert.deepEqual(errors,[]);pass('no browser runtime errors');fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,errors},null,2));
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
