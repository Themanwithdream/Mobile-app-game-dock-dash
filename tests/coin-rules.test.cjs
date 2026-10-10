const test=require('node:test'),assert=require('node:assert/strict'),rules=require('../economy/coin-rules.js');
test('first wallet grants a welcome gift once and recognises previous deliveries',()=>{
  const wallet=rules.readWallet(null,{totalDelivered:80,totalPerfect:30,totalTrucks:10,totalGoals:3});
  assert.equal(wallet.coins,415);
  assert.deepEqual(rules.readWallet(JSON.stringify(wallet),{totalDelivered:5000}),wallet);
  assert.equal(rules.readWallet(null).coins,100);assert.equal(rules.readWallet(null,{totalDelivered:1e9}).coins,3100);
});
test('corrupt or forged storage is bounded without granting a second welcome gift',()=>{
  for(const raw of ['broken','null','[]','7','{}'])assert.equal(rules.readWallet(raw).coins,0);
  const wallet=rules.readWallet({coins:Infinity,earned:-1,spent:'100',owned:['beacon','beacon','unknown','classic',null]});
  assert.deepEqual(wallet,{version:1,coins:0,earned:0,spent:0,owned:['beacon']});
  assert.equal(rules.readWallet({coins:1e12}).coins,1e9);assert.equal(rules.readWallet({coins:25.9}).coins,25);
});
test('all four old truck rewards keep their IDs, order and delivery thresholds',()=>{
  assert.deepEqual(rules.trucks.slice(0,4).map(t=>[t.id,t.need]),[['classic',0],['rally',25],['nightline',75],['gold',150]]);
  const wallet=rules.readWallet(null);
  assert.equal(rules.isOwned(wallet,rules.trucks[0],{}),true);
  assert.equal(rules.isOwned(wallet,rules.trucks[3],{totalDelivered:149}),false);
  assert.equal(rules.isOwned(wallet,rules.trucks[3],{totalDelivered:150}),true);
});
test('a purchase deducts the exact cost, records ownership and never mutates the prior wallet',()=>{
  const wallet=rules.award(rules.readWallet(null),220),result=rules.purchase(wallet,'beacon');
  assert.equal(result.reason,'bought');assert.equal(result.wallet.coins,0);assert.equal(result.wallet.spent,320);
  assert.deepEqual(result.wallet.owned,['beacon']);assert.equal(wallet.coins,320);assert.deepEqual(wallet.owned,[]);
  assert.equal(rules.isOwned(result.wallet,rules.trucks.find(t=>t.id==='beacon')),true);
});
test('repeated taps and re-equipping an owned truck cannot charge twice',()=>{
  let result=rules.purchase(rules.award(rules.readWallet(null),900),'school');const wallet=result.wallet;
  for(let i=0;i<20;i++){result=rules.purchase(result.wallet,'school');assert.equal(result.wallet,wallet);assert.equal(result.reason,'owned');}
  assert.equal(wallet.coins,850);assert.equal(wallet.spent,150);assert.deepEqual(wallet.owned,['school']);
});
test('insufficient balance, unknown IDs and unearned old trucks never consume coins',()=>{
  const wallet=rules.readWallet(null);
  for(const [id,reason] of [['beacon','coins'],['not-a-truck','unknown'],['gold','deliveries']]){
    const result=rules.purchase(wallet,id);assert.equal(result.ok,false);assert.equal(result.reason,reason);assert.equal(result.wallet,wallet);
  }
  assert.equal(rules.purchase(wallet,'beacon').missing,220);
  assert.equal(rules.purchase(wallet,'gold',{totalDelivered:150}).reason,'owned');
});
test('purchased ownership and spend totals survive storage and future progress',()=>{
  const wallet=rules.purchase(rules.award(rules.readWallet(null),1000),'space').wallet;
  const loaded=rules.readWallet(JSON.stringify(wallet),{totalDelivered:500});assert.deepEqual(loaded,wallet);
  assert.equal(loaded.coins,300);assert.equal(loaded.earned,1100);assert.equal(loaded.spent,800);
});
test('deliveries reward skill, special cargo and dispatched trucks, while practice earns zero',()=>{
  assert.equal(rules.deliveryReward(),2);assert.equal(rules.deliveryReward({perfect:true}),3);
  assert.equal(rules.deliveryReward({perfect:true,special:true}),4);
  assert.equal(rules.deliveryReward({perfect:true,special:true,practice:true}),0);
  assert.deepEqual(rules.rewards,{truck:8,goal:15,shift:10});
});
test('completion rewards separate first clears, better stars and repeat runs',()=>{
  assert.equal(rules.missionReward(0,1),85);assert.equal(rules.missionReward(0,3),115);
  assert.equal(rules.missionReward(0,3,3),20);assert.equal(rules.missionReward(0,3,1),50);
  assert.equal(rules.missionReward(2,3),185);assert.equal(rules.missionReward(2,1,3),40);
  for(const [stage,stars] of [[-1,3],[8,3],[0,0],[0,4],[NaN,3],[1,NaN]])assert.equal(rules.missionReward(stage,stars),0);
  for(let stage=3;stage<8;stage++)assert.ok(rules.missionReward(stage,3)>rules.missionReward(stage-1,3));
});
test('invalid awards and capped balances cannot create negative or nonfinite coins',()=>{
  const wallet=rules.readWallet({coins:1e9-2,earned:1e9-2});const next=rules.award(wallet,8);
  assert.equal(next.coins,1e9);assert.equal(next.earned,1e9);
  for(const amount of [0,-5,NaN,Infinity,1.5,'10'])assert.equal(rules.award(wallet,amount),wallet);
});
test('the expanded catalog has unique permanent IDs and retains all fourteen original vehicles',()=>{
  assert.equal(rules.trucks.length,37);assert.equal(rules.venues.length,186);assert.equal(rules.styles.length,19);
  assert.equal(new Set(rules.catalog.map(i=>i.id)).size,242);
  assert.equal(rules.trucks[7].id,'beacon');assert.equal(rules.trucks[13].id,'space');
  assert.deepEqual(rules.trucks.slice(14,20).map(t=>t.body),['beaconrunner','tidecrawler','fire','icecream','monster','rover']);
  for(const item of rules.catalog)assert.equal(rules.item(item.id),item);
});
test('old truck ownership and new place and style ownership migrate together without another gift',()=>{
  const raw={version:1,coins:731,earned:1451,spent:720,owned:['beacon','school','venue:beacon','wrap:crest','zone:neon','venue:beacon','unknown']};
  const saved=rules.readWallet(raw,{totalDelivered:500});
  assert.deepEqual(saved,{...raw,owned:['beacon','school','venue:beacon','wrap:crest','zone:neon']});
  assert.equal(rules.isOwned(saved,rules.item('beacon')),true);assert.equal(rules.isOwned(saved,rules.item('venue:school')),false);
});
test('each paid category uses the same exact atomic transaction and duplicate-tap protection',()=>{
  let wallet=rules.award(rules.readWallet(null),5000);
  for(const id of ['beacon-runner','venue:beacon','wrap:crest','zone:neon']){
    const before=wallet,result=rules.purchase(wallet,id);assert.equal(result.reason,'bought');
    assert.equal(result.wallet.coins,before.coins-rules.item(id).price);assert.equal(result.wallet.spent,before.spent+rules.item(id).price);
    assert.equal(before.owned.includes(id),false);wallet=result.wallet;
    assert.equal(rules.purchase(wallet,id).wallet,wallet);assert.equal(rules.purchase(wallet,id).reason,'owned');
  }
  const loaded=rules.readWallet(JSON.stringify(wallet));assert.deepEqual(loaded,wallet);
});
test('arcade tours rotate only through included or purchased places, starting at the selected place',()=>{
  let wallet=rules.readWallet(null);assert.deepEqual(rules.ownedLocations(wallet),[0,1,2]);
  assert.equal(rules.arcadeLocation(wallet,7),0);
  wallet=rules.purchase(rules.award(wallet,500),'venue:beacon').wallet;
  assert.deepEqual(rules.ownedLocations(wallet),[0,1,2,7]);
  assert.deepEqual([1,2,3,5,7,9].map(shift=>rules.arcadeLocation(wallet,7,shift,true)),[7,7,0,1,2,7]);
  for(const shift of [1,3,8,99])assert.equal(rules.arcadeLocation(wallet,7,shift,false),7);
  for(let shift=1;shift<=40;shift++)assert.ok([0,1,2,7].includes(rules.arcadeLocation(wallet,12,shift,true)));
});
test('style equipment requires ownership and the correct type, with safe included defaults',()=>{
  let wallet=rules.readWallet(null);
  assert.equal(rules.equippedStyle(wallet,'wrap:crest','wrap'),'wrap:classic');
  wallet=rules.purchase(rules.award(wallet,500),'wrap:crest').wallet;
  assert.equal(rules.equippedStyle(wallet,'wrap:crest','wrap'),'wrap:crest');
  for(const id of ['wrap:crest','beacon','zone:neon','broken',null])assert.equal(rules.equippedStyle(wallet,id,'zone'),'zone:classic');
  for(const item of rules.catalog.filter(i=>!i.price && i.need===0))assert.equal(rules.isOwned(wallet,item),true);
});
