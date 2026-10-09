const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const M=require('../missions/mission-rules'),E=require('../economy/coin-rules'),P=require('../missions/world-pack');
test('the hundred-world journey has complete authored arcs and no unreachable pages',()=>{
  assert.equal(M.worlds.length,179);assert.equal(M.missions.length,1432);
  assert.equal(new Set(M.worldPages.flat().map(w=>w.id)).size,179);
  assert.deepEqual(M.worldPages.flat(),M.worlds);
  for(const w of P.worlds){assert.equal(new Set(w.stages).size,8);assert.equal(new Set(w.stories).size,8);assert.equal(w.stories[0],w.lore.opening);assert.equal(w.stories[2],w.lore.turn);assert.equal(w.stories[7],w.lore.ending);assert.ok(w.lore.opening!==w.lore.ending);assert.equal(w.cargo.split(';').length,12);assert.ok(P.chapters[w.chapter]);}
  assert.equal(P.worlds.filter(w=>w.chapter==='greenwood').length,8);assert.equal(M.getMission('greenwood',0).world.keeper,'Rowan');
});
test('retired world stars translate to Beacon Bay without losing independent bests or other worlds',()=>{
  const saved={'matchday-2':{stars:2,bestScore:930,bestTime:22}};
  for(let i=1;i<=8;i++)saved['batcave-'+i]={stars:1+i%3,bestScore:i*1000,bestTime:20+i};
  const records=M.readRecords(saved);
  assert.deepEqual(records['matchday-2'],saved['matchday-2']);
  for(let i=1;i<=8;i++){assert.deepEqual(records['beacon-'+i],saved['batcave-'+i]);assert.equal(records['batcave-'+i],undefined);}
  assert.equal(M.getMission('batcave',0),null);assert.equal(M.worlds[4].id,'beacon');assert.equal(M.worlds[4].location,7);assert.equal(M.getMission('beacon',0).products[0],348);
});
test('all retired purchases translate once while balances, spending and equipped slots survive',()=>{
  const old={version:1,coins:4321,earned:6789,spent:2468,owned:['batcave','batmobile','tumbler','venue:batcave','wrap:hero','school','zone:gold','batmobile','unknown']};
  const w=E.readWallet(old);
  assert.deepEqual([w.coins,w.earned,w.spent],[4321,6789,2468]);
  assert.deepEqual(w.owned,['beacon','beacon-runner','tide-crawler','venue:beacon','wrap:crest','school','zone:gold']);
  assert.equal(E.equippedStyle(w,'wrap:hero','wrap'),'wrap:crest');
  assert.deepEqual([E.trucks[7].id,E.trucks[14].id,E.trucks[15].id],['beacon','beacon-runner','tide-crawler']);
  assert.deepEqual(E.readWallet(JSON.stringify(w)),w);
  for(const id of w.owned)assert.equal(E.purchase(w,id).wallet,w);
});
test('the playable roster, prose, artwork and music contain no retired character branding',()=>{
  const text=JSON.stringify({worlds:M.worlds,catalog:E.catalog});assert.doesNotMatch(text,/Batman|Gotham|Arkham|Batarang|Batmobile|Bat-Signal|Batcave|Tumbler/i);
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');assert.doesNotMatch(html,/batcave|batmobile|gotham|batsignal|kind:'bat'/i);
  assert.equal(fs.existsSync(path.join(__dirname,'../assets/missions/batcave.png')),false);assert.equal(fs.existsSync(path.join(__dirname,'../audio/gotham-after-dark.mp3')),false);
});
test('chapter filters cover every world, keep stable old pages and have bounded previous/next ranges',()=>{
  const all=M.chapterPages('');assert.equal(all.length,51);
  assert.deepEqual(M.chapterPages('history'),[3]);assert.deepEqual(M.chapterPages('prism'),[6]);
  const coverage=[];for(const chapter of Object.keys(M.chapters)){const pages=M.chapterPages(chapter);assert.ok(pages.length);for(const page of pages){assert.equal(M.pageLabel(page),M.chapters[chapter]);coverage.push(...M.worldPages[page].map(w=>w.id));}}
  assert.equal(coverage.length,179);assert.equal(new Set(coverage).size,179);
});
test('only a completed final story restores one lantern, independently of star improvement or replay',()=>{
  assert.equal(M.lanternCount({}),0);assert.equal(M.lanternCount({'greenwood-1':{stars:3}}),0);
  let r=M.readRecords({'greenwood-8':{stars:1}});assert.equal(M.lanternCount(r),1);
  r=M.readRecords({...r,'greenwood-8':{stars:3},'beacon-8':{stars:2}});assert.equal(M.lanternCount(r),2);
  assert.equal(M.lanternCount(M.readRecords(Object.fromEntries(M.missions.map(m=>[m.id,{stars:3}])))),100);
});
test('every world has a distinct original arrangement rather than a renamed duplicate score',()=>{
  const scores=require('../audio/world-scorebook.json');assert.equal(scores.length,100);
  const signatures=scores.map(s=>JSON.stringify([s.roots,s.melody,s.voice,s.gentle||false,s.pulse||false]));assert.equal(new Set(signatures).size,100);
  assert.equal(scores[4].slug,'beacon-homecoming');for(const w of P.worlds)assert.ok(scores.some(s=>s.slug+'.mp3'===w.music.file));
});
