const test=require('node:test'),assert=require('node:assert/strict');
const Backups=require('../engine/save-backup.js'),MR=require('../missions/mission-rules.js'),ER=require('../economy/coin-rules.js');
const api=new Backups({missions:MR,economy:ER,productCount:1500});
const copy=x=>JSON.parse(JSON.stringify(x));
function snapshot(){return {best:12345,muted:false,profile:{totalDelivered:240,totalPerfect:80,totalTrucks:40,totalGoals:20,highestShift:12,selectedSkin:4,selectedWrap:'wrap:stars',selectedZone:'zone:gold',tutorialDone:true},wallet:{version:1,coins:3200,earned:5000,spent:1800,owned:['school','venue:rome','wrap:stars','zone:gold']},settings:{location:13,rotate:true,music:true,sfx:false,musicVolume:.42,effects:'auto'},cargo:[3,14,456,1499],missions:{'rome-1':{stars:3,bestScore:1600,bestTime:23.12}}};}
function storage(data=snapshot()){
  const values=new Map([['unrelated-site-data','keep']]);for(const [field,key]of Object.entries(Backups.keys))values.set(key,JSON.stringify(data[field]));
  return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
}
test('a portable backup round-trips coins, ownership, equipment, settings, all stars and discovered cargo',()=>{
  const original=snapshot();for(const m of MR.missions)original.missions[m.id]={stars:3,bestScore:12345,bestTime:m.seconds/2};original.cargo=Array.from({length:1500},(_,i)=>i);
  const text=api.export(original,'2026-10-07T14:00:00Z'),read=api.read(text);assert.deepEqual(read.data,original);assert.equal(read.summary.stars,2400);assert.equal(read.summary.lanterns,100);assert.ok(text.length<Backups.maxBytes);
});
test('damaged, incomplete, unrelated, oversized and future-format files fail without touching any storage',()=>{
  const text=api.export(snapshot()),s=storage(),before=[...s.values];
  for(const bad of ['{broken','null','[]','{}',text.replace('3200','0'),'x'.repeat(Backups.maxBytes+1),text.replace('"version": 1','"version": 2')])assert.throws(()=>api.read(bad));
  assert.deepEqual([...s.values],before);
});
test('invalid currency, purchases, equipment and place selections cannot silently replace a save',()=>{
  const changes=[d=>d.wallet.coins=-1,d=>d.wallet.earned=NaN,d=>d.wallet.owned.push('unknown'),d=>d.profile.selectedSkin=36,d=>d.profile.selectedWrap='wrap:tide',d=>d.settings.location=6,d=>d.profile.totalDelivered='240',d=>delete d.wallet,d=>d.settings.effects='turbo'];
  for(const change of changes){const d=snapshot();change(d);assert.throws(()=>api.validate(d));}
});
test('only valid known missions and unique cargo IDs can enter a portable save',()=>{
  const changes=[d=>d.missions['unknown-1']={stars:3,bestScore:1,bestTime:1},d=>d.missions['rome-1'].stars=4,d=>d.missions['rome-1'].bestTime=46,d=>d.cargo.push(1500),d=>d.cargo.push(3)];
  for(const change of changes){const d=snapshot();change(d);assert.throws(()=>api.validate(d));}
});
test('restoring writes only the seven game keys and keeps a usable previous-save copy',()=>{
  const old=snapshot(),incoming=copy(old);incoming.wallet.coins=1000;incoming.best=88888;incoming.settings.effects='reduced';const s=storage(old);
  api.restore(s,incoming,old);assert.equal(s.getItem(Backups.keys.best),'88888');assert.equal(JSON.parse(s.getItem(Backups.keys.wallet)).coins,1000);assert.equal(s.getItem('unrelated-site-data'),'keep');assert.equal(Backups.hasUndo(s),true);
  assert.equal(Backups.recover(s),false);assert.equal(Backups.hasUndo(s),true);
});
test('undo restores exactly the progress that was in use, then removes the undo action',()=>{
  const old=snapshot(),incoming=copy(old);incoming.wallet.coins=0;incoming.cargo=[];incoming.missions={};const s=storage(old);api.restore(s,incoming,old);
  assert.deepEqual(api.undo(s,incoming),old);for(const [field,key]of Object.entries(Backups.keys))assert.deepEqual(JSON.parse(s.getItem(key)),old[field]);assert.equal(Backups.hasUndo(s),false);assert.throws(()=>api.undo(s,old));
});
test('a failed checkpoint leaves every current key untouched',()=>{
  const old=snapshot(),incoming=copy(old);incoming.wallet.coins=0;const s=storage(old),before=[...s.values],set=s.setItem;
  s.setItem=(k,v)=>{if(k===Backups.journalKey)throw Error('quota');return set(k,v);};assert.throws(()=>api.restore(s,incoming,old));assert.deepEqual([...s.values],before);
});
test('a failure midway through restore rolls back all keys and retains a previous undo copy',()=>{
  const old=snapshot(),incoming=copy(old);incoming.wallet.coins=0;incoming.best=99999;const s=storage(old);api.restore(s,old,old);const before=[...s.values],set=s.setItem;let once=true;
  s.setItem=(k,v)=>{if(k===Backups.keys.settings&&once){once=false;throw Error('quota');}return set(k,v);};assert.throws(()=>api.restore(s,incoming,old));assert.deepEqual([...s.values],before);
});
test('an interrupted restore is recovered before the app reads its wallet or stars',()=>{
  const old=snapshot(),s=storage(old),before=[...s.values],previous=Object.fromEntries(Object.values(Backups.keys).map(k=>[k,s.getItem(k)]));
  s.setItem(Backups.journalKey,JSON.stringify({status:'pending',previous}));s.setItem(Backups.keys.wallet,'{"coins":0}');s.removeItem(Backups.keys.missions);
  assert.equal(Backups.recover(s),true);assert.deepEqual([...s.values].sort(),before.sort());assert.equal(Backups.recover(s),false);
});
test('a failed undo rolls back to the imported save without losing the undo checkpoint',()=>{
  const old=snapshot(),incoming=copy(old);incoming.wallet.coins=12;const s=storage(old);api.restore(s,incoming,old);const before=[...s.values],remove=s.removeItem;let once=true;
  s.removeItem=k=>{if(k===Backups.journalKey&&once){once=false;throw Error('storage unavailable');}return remove(k);};assert.throws(()=>api.undo(s,incoming));assert.deepEqual([...s.values],before);assert.equal(Backups.hasUndo(s),true);
});
test('a malformed restore journal never writes unrelated data or guessed progress',()=>{
  const s=storage(),before=[...s.values];s.setItem(Backups.journalKey,'{"status":"pending","previous":{"unrelated-site-data":"erase"}}');assert.throws(()=>Backups.recover(s));assert.deepEqual([...s.values].filter(([k])=>k!==Backups.journalKey),before);
});
test('export reads the live snapshot and excludes arbitrary extra fields',()=>{
  const d=snapshot();d.secret='not game data';d.profile.secret='private';const result=api.read(api.export(d));assert.equal(result.data.secret,undefined);assert.equal(result.data.profile.secret,undefined);assert.equal(result.data.wallet.coins,3200);
});
