const test = require('node:test'), assert = require('node:assert/strict');
const {measure, visibleViewport} = require('../ui/phone-layout.js');
const {DockDashImageQueue} = require('../engine/gameplay-tools.js');

test('phone, tablet and landscape fields stay inside their available safe area', () => {
  for (const [w,h] of [[308,556],[378,832],[418,920],[832,378],[1012,756]]) {
    const layout = measure(w,h);
    assert.ok(layout.width <= w && layout.height <= h);
    assert.ok(layout.fieldLeft >= 0 && layout.fieldTop >= 0);
    assert.ok(layout.fieldWidth <= layout.width + 1e-8 && layout.fieldHeight <= layout.height + 1e-8);
    assert.ok(Math.abs(layout.fieldWidth / layout.fieldHeight - 360 / 640) < 1e-8);
    if (layout.wide) assert.ok(layout.fieldLeft - 24 >= 112, 'wide docks have room for thumbs');
  }
  assert.equal(measure(378,832).height,832);
  assert.equal(measure(832,378).wide,true);
});
test('a portrait phone keyboard reflows menus without becoming a landscape game', () => {
  const visible = visibleViewport(390,844,{width:390,height:360,offsetTop:28,offsetLeft:0,scale:1});
  assert.deepEqual(visible,{width:390,height:360,left:0,top:28});
  assert.equal(measure(visible.width-12,visible.height-12).wide,false);
  assert.equal(visibleViewport(390,844,{width:195,height:422,offsetTop:100,scale:2}).height,844);
});
test('missing viewport values cannot poison canvas geometry', () => {
  assert.deepEqual(visibleViewport(NaN,0,null),{width:360,height:640,left:0,top:0});
  for (const value of [NaN,Infinity,0,-1,undefined]) assert.ok(Number.isFinite(measure(value,value).scale));
});
test('rapid place browsing bounds full-art requests and prioritises the newest selection', () => {
  const queue = new DockDashImageQueue(2,4), starts = [];
  queue.enqueue('first',1,()=>starts.push('first')); queue.enqueue('second',1,()=>starts.push('second'));
  for(let i=0;i<177;i++) queue.enqueue('world'+i,1,()=>starts.push('world'+i));
  assert.equal(queue.active.size,2); assert.equal(queue.jobs.size,4);
  queue.enqueue('selected-old',3,()=>starts.push('selected-old'));
  queue.enqueue('selected-new',3,()=>starts.push('selected-new'));
  queue.finish('first'); assert.equal(starts.at(-1),'selected-new');
  queue.finish('second'); assert.equal(starts.at(-1),'selected-old');
  assert.equal(queue.active.size,2); assert.ok(queue.jobs.size<=4);
});
test('duplicate and failed image requests release slots without stranding the queue', () => {
  const queue = new DockDashImageQueue(1,4), starts = [];
  queue.enqueue('a',1,()=>starts.push('a')); queue.enqueue('a',3,()=>starts.push('duplicate'));
  queue.enqueue('broken',1,()=>{throw Error('bad source');}); queue.enqueue('b',1,()=>starts.push('b'));
  queue.finish('a'); assert.deepEqual(starts,['a','b']); assert.equal(queue.active.size,1);
  queue.finish('b'); queue.enqueue('a',3,()=>starts.push('retry'));
  assert.equal(starts.at(-1),'retry');
});
