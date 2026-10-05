const test = require('node:test');
const assert = require('node:assert/strict');
const DockDashEngine = require('../engine/game-loop.js');

function run(hz,seconds=3) {
  let simulated=0,updates=0,draws=0;
  const engine=new DockDashEngine({update:dt=>{simulated+=dt;updates++;},render:()=>draws++});
  for(let i=0;i<=hz*seconds;i++)engine.advance(i*1000/hz);
  return {simulated,updates,draws,engine};
}
test('30, 60 and 120 Hz displays advance the same gameplay time',()=>{
  for(const hz of [30,60,120]) {
    const r=run(hz);assert.equal(r.updates,360);
    assert.ok(Math.abs(r.simulated-3)<1e-10);
  }
});
test('the default graphics budget remains 60 frames per second',()=>{
  assert.equal(run(120).draws,181);
  assert.equal(run(60).draws,181);
  assert.equal(run(30).draws,91);
});
test('120 Hz gameplay draws every refresh while preserving 120 Hz simulation',()=>{
  let draws=0,steps=0;
  const engine=new DockDashEngine({update:()=>steps++,render:()=>draws++});
  for(let i=0;i<=360;i++)engine.advance(i*1000/120,{fps:120});
  assert.equal(draws,361);assert.equal(steps,360);
});
test('fractional render time smooths irregular refreshes without advancing gameplay',()=>{
  let time=0;const ahead=[];
  const engine=new DockDashEngine({update:dt=>time+=dt,render:f=>ahead.push(f)});
  engine.advance(0,{fps:120});engine.advance(7,{fps:120});engine.invalidate();engine.advance(12,{fps:120});
  assert.ok(Math.abs(time-1/120)<1e-10);assert.ok(Math.abs(ahead.at(-1)-(.012-1/120))<1e-10);
  assert.ok(ahead.every(f=>f>=0 && f<=1/120));
  engine.invalidate();engine.advance(15,{fps:120,frozen:true});assert.equal(ahead.at(-1),0);
  engine.advance(1000,{fps:120});assert.equal(ahead.at(-1),0);
});
test('irregular frames and a short 180 ms hitch preserve elapsed gameplay time',()=>{
  let time=0,steps=0;
  const engine=new DockDashEngine({update:dt=>{time+=dt;steps++;},render:()=>{}});
  for(const now of [0,7,24,41,83,263,287,318,400])engine.advance(now);
  assert.equal(steps,48);assert.ok(Math.abs(time-.4)<1e-10);
});
test('a long stall pauses through the callback without simulating lost time',()=>{
  let time=0,stalls=0;
  const engine=new DockDashEngine({update:dt=>time+=dt,render:()=>{},onStall:()=>stalls++});
  engine.advance(0);engine.advance(100);
  const before=time,result=engine.advance(1100);
  assert.equal(stalls,1);assert.equal(result.stalled,true);
  assert.equal(result.steps,0);assert.equal(time,before);
  engine.advance(1110);assert.ok(time-before<=1/120+1e-9);
});
test('frozen canvases redraw only when their controls or content change',()=>{
  let draws=0;
  const engine=new DockDashEngine({update:()=>{},render:()=>draws++});
  for(let i=0;i<120;i++)engine.advance(i*1000/120,{frozen:true});
  assert.equal(draws,1);
  engine.invalidate();engine.advance(1000,{frozen:true});
  assert.equal(draws,2);
  engine.advance(1010,{frozen:true});assert.equal(draws,2);
});
test('menu animations use 30 draws per second and updates remain consistent',()=>{
  let draws=0,time=0;
  const engine=new DockDashEngine({update:dt=>time+=dt,render:()=>draws++});
  for(let i=0;i<=120;i++)engine.advance(i*1000/120,{fps:30});
  assert.equal(draws,31);assert.ok(Math.abs(time-1)<1e-10);
});
test('reset on resume discards background time and pending fractions',()=>{
  let steps=0,stalls=0;
  const engine=new DockDashEngine({update:()=>steps++,render:()=>{},onStall:()=>stalls++});
  engine.advance(0);engine.advance(5);engine.reset();engine.advance(10000);
  assert.equal(steps,0);assert.equal(stalls,0);
  engine.advance(10009);assert.equal(steps,1);
});
test('a reset during an update starts a new run without consuming old catch-up time',()=>{
  let steps=0;
  const engine=new DockDashEngine({update:()=>{steps++;if(steps===1)engine.reset();},render:()=>{}});
  engine.advance(0);engine.advance(100);
  assert.equal(steps,1);assert.equal(engine.accumulator,0);
  engine.advance(200);assert.equal(steps,1);
  engine.advance(209);assert.equal(steps,2);
});
test('invalid or backwards timestamps cannot poison the next frame',()=>{
  let time=0;
  const engine=new DockDashEngine({update:dt=>time+=dt,render:()=>{}});
  engine.advance(100);engine.advance(NaN);engine.advance(50);engine.advance(150);
  assert.ok(Math.abs(time-.1)<1e-10);
});
