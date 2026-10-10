const test=require('node:test'),assert=require('node:assert/strict'),M=require('../missions/mission-rules'),E=require('../economy/coin-rules');
const ids=['diner','bakery','metro','canal','skyguard','arena','build','robot','prism'];
test('nine appended worlds retain every old cargo and location ID and offer free first missions',()=>{
  assert.deepEqual(M.worlds.slice(14,23).map(w=>w.id),ids);
  for(const [index,w] of M.worlds.entries()){
    assert.equal(w.location,index+3);assert.equal(M.getMission(w.id,0).products[0],300+index*12);
    assert.equal(M.isUnlocked(M.getMission(w.id,0),{}),true);
    if(index>=14){assert.equal(new Set(w.stories).size,8);assert.equal(new Set(w.stages).size,8);assert.equal(new Set(w.cargo.split(';')).size,12);}
    assert.equal(E.venues.find(v=>v.world===w.id).location,w.location);
  }
  assert.deepEqual(M.worldPages.slice(4,7).flat().map(w=>w.id),ids);
  assert.equal(M.pageLabel(4),'CITY LIFE');assert.equal(M.pageLabel(5),'HEROES & MAKERS');assert.equal(M.pageLabel(6),'PRISM FORGE');
});
test('all 112 previous records survive and cannot unlock the new second levels',()=>{
  const saved=Object.fromEntries(M.missions.slice(0,112).map(m=>[m.id,{stars:3,bestScore:1200,bestTime:35}]));
  const restored=M.readRecords(JSON.stringify(saved));assert.deepEqual(restored,saved);assert.equal(M.totalStars(restored),336);
  for(const id of ids)assert.equal(M.isUnlocked(M.getMission(id,1),restored),false);
});
test('196 new purchases retain existing ownership, spend exactly their prices and never charge an owned item',()=>{
  assert.equal(E.newItems.length,196);assert.equal(E.newItems.filter(i=>i.type==='truck').length,17);assert.equal(E.newItems.filter(i=>i.type==='venue').length,169);assert.equal(E.newItems.filter(i=>i.type==='style').length,10);
  let wallet=E.readWallet({version:1,coins:200000,earned:201000,spent:1000,owned:['beacon','wrap:crest','venue:rome']});
  const cost=E.newItems.reduce((sum,i)=>sum+i.price,0);
  for(const item of E.newItems){const previous=wallet,tx=E.purchase(wallet,item.id);assert.equal(tx.reason,'bought');wallet=tx.wallet;assert.equal(wallet.coins,previous.coins-item.price);assert.equal(E.purchase(wallet,item.id).wallet,wallet);}
  assert.equal(wallet.coins,200000-cost);assert.equal(wallet.spent,1000+cost);assert.ok(['beacon','wrap:crest','venue:rome'].every(id=>wallet.owned.includes(id)));assert.deepEqual(E.readWallet(JSON.stringify(wallet)),wallet);
  assert.deepEqual(E.trucks.slice(20,29).map(t=>t.world),ids);assert.equal(new Set(E.trucks.slice(20,29).map(t=>t.body)).size,9);
});
