const test=require('node:test'),assert=require('node:assert/strict'),rules=require('../economy/coin-rules.js');
test('first wallet grants a welcome gift once and recognises previous deliveries',()=>{
  const wallet=rules.readWallet(null,{totalDelivered:80,totalPerfect:30,totalTrucks:10,totalGoals:3});
  assert.equal(wallet.coins,415);
  assert.deepEqual(rules.readWallet(JSON.stringify(wallet),{totalDelivered:5000}),wallet);
  assert.equal(rules.readWallet(null).coins,100);assert.equal(rules.readWallet(null,{totalDelivered:1e9}).coins,3100);
});
test('corrupt or forged storage is bounded without granting a second welcome gift',()=>{
  for(const raw of ['broken','null','[]','7','{}'])assert.equal(rules.readWallet(raw).coins,0);
  const wallet=rules.readWallet({coins:Infinity,earned:-1,spent:'100',owned:['batcave','batcave','unknown','classic',null]});
  assert.deepEqual(wallet,{version:1,coins:0,earned:0,spent:0,owned:['batcave']});
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
  const wallet=rules.award(rules.readWallet(null),220),result=rules.purchase(wallet,'batcave');
  assert.equal(result.reason,'bought');assert.equal(result.wallet.coins,0);assert.equal(result.wallet.spent,320);
  assert.deepEqual(result.wallet.owned,['batcave']);assert.equal(wallet.coins,320);assert.deepEqual(wallet.owned,[]);
  assert.equal(rules.isOwned(result.wallet,rules.trucks.find(t=>t.id==='batcave')),true);
});
test('repeated taps and re-equipping an owned truck cannot charge twice',()=>{
  let result=rules.purchase(rules.award(rules.readWallet(null),900),'school');const wallet=result.wallet;
  for(let i=0;i<20;i++){result=rules.purchase(result.wallet,'school');assert.equal(result.wallet,wallet);assert.equal(result.reason,'owned');}
  assert.equal(wallet.coins,850);assert.equal(wallet.spent,150);assert.deepEqual(wallet.owned,['school']);
});
test('insufficient balance, unknown IDs and unearned old trucks never consume coins',()=>{
  const wallet=rules.readWallet(null);
  for(const [id,reason] of [['batcave','coins'],['not-a-truck','unknown'],['gold','deliveries']]){
    const result=rules.purchase(wallet,id);assert.equal(result.ok,false);assert.equal(result.reason,reason);assert.equal(result.wallet,wallet);
  }
  assert.equal(rules.purchase(wallet,'batcave').missing,220);
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
  for(const [stage,stars] of [[-1,3],[3,3],[0,0],[0,4],[NaN,3],[1,NaN]])assert.equal(rules.missionReward(stage,stars),0);
});
test('invalid awards and capped balances cannot create negative or nonfinite coins',()=>{
  const wallet=rules.readWallet({coins:1e9-2,earned:1e9-2});const next=rules.award(wallet,8);
  assert.equal(next.coins,1e9);assert.equal(next.earned,1e9);
  for(const amount of [0,-5,NaN,Infinity,1.5,'10'])assert.equal(rules.award(wallet,amount),wallet);
});
