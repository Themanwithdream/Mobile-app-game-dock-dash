const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const M=require('../missions/mission-rules'),R=require('../missions/open-roads'),E=require('../economy/coin-rules'),B=require('../engine/save-backup');
const root=path.resolve(__dirname,'..'),original=require('./fixtures/hundred-places.json');

test('183 places append the requested twenty and 63 more without changing any original mission, cargo or story',()=>{
  assert.equal(M.worlds.length,183);assert.equal(M.missions.length,1464);assert.equal(R.worlds.length,83);
  assert.deepEqual(M.worlds.slice(0,100).map(w=>({id:w.id,name:w.name,location:w.location,cargo:w.cargo,stages:w.stages,stories:w.stories,products:M.getMission(w.id,0).products})),original);
  assert.deepEqual(M.worlds.slice(100,120).map(w=>w.id),['asgard','worldtree','frostfortress','dwarvenforge','atlantis','cornerburger','seasideicecream','marketbasket','civicexchange','union1954','palacecinema','fieldcamp','threadavenue','marketfloor','accracoast','riversidecollege','fourfieldfarm','motorcourt','pitstopauto','harbourhospital']);
  assert.deepEqual(M.worlds.slice(100).map(w=>w.location),Array.from({length:83},(_,i)=>103+i));
  assert.deepEqual(M.worlds.slice(100).flatMap(w=>M.getMission(w.id,0).products),Array.from({length:996},(_,i)=>1500+i));
});
test('every new place has eight distinct authored chapters, a practical resolution and twelve named supplies',()=>{
  const prose=new Set(),plans=new Set(),names=new Set();
  for(const w of R.worlds){
    assert.equal(w.campaign,'openroads');assert.equal(w.stages.length,8);assert.equal(new Set(w.stages).size,8,w.id);
    assert.equal(w.stories.length,8);assert.equal(w.cargo.split(';').length,12);assert.equal(new Set(w.cargo.split(';').map(e=>e.split('|')[0])).size,12,w.id);
    for(const s of w.stories){assert.ok(s.length>45&&s.length<225,w.id);assert.ok(!prose.has(s),w.id);prose.add(s);}
    assert.deepEqual(w.lore,{opening:w.stories[0],turn:w.stories[2],ending:w.stories[7]});
    assert.doesNotMatch(w.stories.join(' ')+w.cargo,/\b(?:magic|magical|enchanted|wizard|witch|spell|potion|teleport|dragon|fairy|superhero|levitating)\b/i,w.id);
    assert.ok(!plans.has(w.artPlan));plans.add(w.artPlan);assert.ok(!names.has(w.name));names.add(w.name);
    assert.ok(R.chapters[w.chapter]);assert.ok(require('../missions/world-challenges').profiles[w.pattern]);
  }
  assert.equal(prose.size,664);assert.equal(plans.size,83);
});
test('new places browse as 22 bounded pages, preserving all thirty original pages and exposing every new chapter',()=>{
  assert.deepEqual(M.worldPages.slice(0,30).flat().map(w=>w.id),original.map(w=>w.id));
  assert.deepEqual(M.chapterPages('openroads'),Array.from({length:22},(_,i)=>30+i));
  assert.deepEqual(M.chapterPages('openroads').flatMap(p=>M.worldPages[p]).map(w=>w.id),R.worlds.map(w=>w.id));
  for(const [k]of Object.entries(R.chapters)){assert.ok(M.chapterPages(k).every(p=>p>=30));assert.ok(M.chapterPages(k).flatMap(p=>M.worldPages[p]).every(w=>w.chapter===k));}
});
test('the original ending stays earned while the new completion log starts independently',()=>{
  const old=M.readRecords(Object.fromEntries(M.missions.slice(0,800).map(m=>[m.id,{stars:3,bestScore:1000,bestTime:20}])));
  assert.equal(M.lanternCount(old),100);assert.equal(M.routeCount(old),0);assert.equal(M.completedPlaces(old),100);
  for(const w of R.worlds){assert.equal(M.isUnlocked(M.getMission(w.id,0),old),true);assert.equal(M.isUnlocked(M.getMission(w.id,1),old),false);}
  const next=M.recordResult(old,M.getMission('asgard',0),{won:true,elapsed:30,delivered:20,priorityLoaded:5,lives:3,perfects:8,score:1500});
  assert.deepEqual(M.readRecords(old),old);assert.equal(M.isUnlocked(M.getMission('asgard',1),next),true);assert.equal(M.routeCount(next),0);
  const finished={...old,...Object.fromEntries(R.worlds.map(w=>[w.id+'-8',{stars:1,bestScore:1000,bestTime:40}]))};
  assert.equal(M.lanternCount(finished),100);assert.equal(M.routeCount(finished),83);assert.equal(M.completedPlaces(finished),183);
});
test('each new arcade place is optional, charges only its price and survives wallet reload',()=>{
  let wallet=E.readWallet({version:1,coins:100000,earned:104321,spent:4321,owned:['venue:rome','beacon','wrap:crest']});
  for(const w of R.worlds){const item=E.item('venue:'+w.id);assert.equal(item.location,w.location);const before=wallet.coins;wallet=E.purchase(wallet,item.id).wallet;assert.equal(wallet.coins,before-item.price);assert.equal(E.purchase(wallet,item.id).wallet,wallet);assert.ok(E.ownedLocations(wallet).includes(w.location));}
  assert.deepEqual(E.readWallet(JSON.stringify(wallet)),wallet);assert.ok(['venue:rome','beacon','wrap:crest'].every(id=>wallet.owned.includes(id)));
});
test('older portable saves and new expansion progress round-trip without changing the save schema',()=>{
  const api=new B({missions:M,economy:E,productCount:2496}),legacy=api.read(fs.readFileSync(path.join(root,'tests/fixtures/parcel-odyssey-v1-backup.json'),'utf8'));
  assert.deepEqual(legacy.data.cargo,[3,14,456,1499]);
  const expanded=structuredClone(legacy.data);expanded.wallet=E.purchase(expanded.wallet,'venue:asgard').wallet;expanded.settings.location=103;expanded.cargo.push(1500,2423,2447,2495);expanded.missions['asgard-8']={stars:2,bestScore:3456,bestTime:70};
  const read=api.read(api.export(expanded));assert.deepEqual(read.data,expanded);assert.equal(read.summary.routes,1);assert.equal(read.summary.lanterns,0);assert.equal(read.summary.coins,expanded.wallet.coins);
  assert.equal(JSON.parse(api.export(expanded)).version,1);
});
test('all new scenery and previews are distinct phone-sized assets and music uses complete existing recordings',()=>{
  const manifest=require('../assets/worlds/open-roads/manifest.json'),previews=require('../assets/previews/manifest.json'),crypto=require('node:crypto'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
  assert.equal(manifest.images.length,83);assert.equal(new Set(manifest.images.map(r=>r.sha256)).size,83);
  let artBytes=0,previewBytes=0;
  for(const w of R.worlds){const row=manifest.images.find(r=>r.id===w.id),bytes=fs.readFileSync(path.join(root,w.backdrop)),preview=previews.images.find(p=>p.location===w.location);
    // Detailed paintings use the same download budget as the original worlds;
    // decoded dimensions and the lazy image/cache limits remain unchanged.
    assert.equal(hash(bytes),row.sha256);assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[360,640]);assert.ok(bytes.length<240000,w.id);
    assert.equal(row.method,'imagegen');assert.ok(row.sourceSHA256);
    assert.equal(preview.source,w.backdrop);assert.ok(preview.previewBytes<64*1024,w.id);artBytes+=bytes.length;previewBytes+=preview.previewBytes;
    assert.ok(fs.statSync(path.join(root,'audio',w.music.file)).size>100000);assert.equal(w.music.reused,true);
  }
  assert.ok(artBytes<18*1024*1024);assert.ok(previewBytes<4*1024*1024);assert.ok(previewBytes<artBytes*.25);
});
