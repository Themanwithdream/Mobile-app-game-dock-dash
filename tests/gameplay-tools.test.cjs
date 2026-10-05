const test=require('node:test'),assert=require('node:assert/strict');
const {DockDashCache,DockDashProgress,DockDashFrameBudget}=require('../engine/gameplay-tools.js');

test('bounded sprite cache reuses images and releases old entries during long runs',()=>{
  const cache=new DockDashCache(96),first={pixels:'first'};
  assert.equal(cache.get('first',()=>first),first);
  assert.equal(cache.get('first',()=>{throw Error('unnecessary raster');}),first);
  for(let i=0;i<5000;i++)cache.get(i,()=>({pixels:i}));
  assert.equal(cache.entries.size,96);assert.equal(cache.entries.has('first'),false);
  assert.equal(cache.get(4999,()=>null).pixels,4999);
  cache.clear();assert.equal(cache.entries.size,0);
});
test('failed sprite construction leaves valid cached art available',()=>{
  const cache=new DockDashCache(2);cache.get('a',()=>1);cache.get('b',()=>2);
  assert.throws(()=>cache.get('c',()=>{throw Error('bad art');}));
  assert.equal(cache.get('a',()=>0),1);assert.equal(cache.entries.size,2);
});
function fixture(){
  const tasks=new Map(),writes=[];let next=0,delivered=0,cargo=[];
  const storage={setItem:(key,value)=>writes.push({key,value})};
  const progress=new DockDashProgress({storage,snapshots:{profile:()=>({delivered}),cargo:()=>cargo},schedule:fn=>{tasks.set(++next,fn);return next;},cancel:id=>tasks.delete(id)});
  return{progress,tasks,writes,storage,deliver(id){delivered++;cargo.push(id);progress.mark('profile');progress.mark('cargo');},run(){const [id,fn]=tasks.entries().next().value;tasks.delete(id);fn();}};
}
test('rapid deliveries schedule one save and persist the latest progress without writing during input',()=>{
  const f=fixture();for(let i=0;i<40;i++)f.deliver(i);
  assert.equal(f.writes.length,0);assert.equal(f.tasks.size,1);
  f.run();assert.equal(f.writes.length,2);assert.equal(f.tasks.size,0);
  assert.deepEqual(JSON.parse(f.writes[0].value),{delivered:40});assert.equal(JSON.parse(f.writes[1].value).length,40);
  assert.equal(f.progress.dirty.size,0);
});
test('pause, home and page-exit flushes cancel pending work and do not duplicate saves',()=>{
  const f=fixture();f.deliver(7);f.progress.flush();f.progress.flush();
  assert.equal(f.tasks.size,0);assert.equal(f.writes.length,2);
  f.deliver(8);f.run();assert.equal(JSON.parse(f.writes[2].value).delivered,2);
});
test('storage failure retains current progress for retry without blocking gameplay',()=>{
  const f=fixture(),set=f.storage.setItem;f.storage.setItem=()=>{throw Error('storage full');};f.deliver(1);
  assert.doesNotThrow(()=>f.run());assert.equal(f.progress.dirty.size,2);assert.equal(f.tasks.size,0);
  f.storage.setItem=set;f.deliver(2);f.run();
  assert.equal(f.writes.length,2);assert.deepEqual(JSON.parse(f.writes[1].value),[1,2]);assert.equal(f.progress.dirty.size,0);
});
test('healthy 60 and 120 Hz screens retain full resolution and isolated hitches do not lower it',()=>{
  for(const hz of [60,120]){const budget=new DockDashFrameBudget(2);let now=0;for(let i=0;i<hz*10;i++){now+=i===hz?180:1000/hz;assert.equal(budget.observe(now,true),false);}assert.equal(budget.scale,2);}
});
test('sustained slow frames reduce raster work with a cooldown and a fixed minimum',()=>{
  const budget=new DockDashFrameBudget(2),changes=[];
  for(let now=0;now<=15000;now+=30)if(budget.observe(now,true))changes.push({now,scale:budget.scale});
  assert.deepEqual(changes.map(c=>c.scale),[1.5,1.25]);assert.ok(changes[1].now-changes[0].now>=5000);
  const low=new DockDashFrameBudget(1);for(let now=0;now<10000;now+=30)assert.equal(low.observe(now,true),false);assert.equal(low.scale,1);
});
test('pause, countdown and background gaps cannot accumulate pressure against the next run',()=>{
  const budget=new DockDashFrameBudget(2);for(let t=0;t<1800;t+=30)budget.observe(t,true);
  budget.observe(10000,false);budget.observe(20000,true);budget.observe(20030,true);assert.equal(budget.scale,2);
  budget.observe(30000,true);assert.equal(budget.scale,2);assert.equal(budget.frames,0);
});
