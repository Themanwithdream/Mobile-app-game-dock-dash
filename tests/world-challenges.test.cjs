const test=require('node:test'),assert=require('node:assert/strict');
const WC=require('../missions/world-challenges.js'),MR=require('../missions/mission-rules.js');
test('all 1,464 missions carry an explained theme and the existing goals, unlocks and IDs',()=>{
  assert.equal(MR.missions.length,1464);const kinds=new Set();
  for(const m of MR.missions){kinds.add(m.challenge.kind);assert.ok(m.challenge.copy.length>25);assert.ok(m.challenge.name.length>4);assert.equal(m.id,`${m.world.id}-${m.stage+1}`);assert.equal(m.loads,MR.tiers[m.stage].loads);assert.equal(m.seconds,MR.tiers[m.stage].seconds);}
  assert.deepEqual([...kinds].sort(),Object.keys(WC.profiles).sort());
});
test('soccer, history, worksite, water, supplies and woodland select their intended patterns',()=>{
  for(const [id,kind]of [['matchday','rally'],['rome','convoy'],['build','crane'],['canal','tide'],['school','workshop'],['greenwood','trail']])assert.equal(MR.getMission(id,0).challenge.kind,kind);
});
test('merchant convoys travel in groups of three and cranes in pairs, with all open lanes reachable',()=>{
  for(const [id,size]of [['rome',3],['build',2]])for(const shift of [1,4]){
    const run=WC.create(MR.getMission(id,0).challenge),types=Array.from({length:size*12},()=>WC.nextType(run,shift));
    for(let i=0;i<types.length;i+=size)assert.equal(new Set(types.slice(i,i+size)).size,1);
    assert.equal(new Set(types).size,shift===1?3:4);assert.ok(types.every(t=>t>=0&&t<(shift===1?3:4)));
  }
});
test('trail markers are predictable and rotate through the available sticker shapes',()=>{
  const run=WC.create(MR.getMission('greenwood',3).challenge),types=Array.from({length:16},()=>WC.nextType(run,4));
  assert.equal(new Set(types.slice(0,4)).size,4);assert.deepEqual(types.slice(0,4),types.slice(4,8));
});
test('supply sets guarantee the three essentials once each without losing other cargo',()=>{
  const m=MR.getMission('school',3),run=WC.create(m.challenge),deck=WC.arrangeDeck(run,m.products.slice(),m.priorityProducts);
  assert.deepEqual([deck.pop(),deck.pop(),deck.pop()],m.priorityProducts);assert.equal(new Set(deck).size,9);
  const convoy=WC.create(MR.getMission('rome',3).challenge),original=m.products.slice();assert.equal(WC.arrangeDeck(convoy,original,m.priorityProducts),original);
});
test('rushes and tides are announced ahead of time, stay gentle and do not affect the first mission pace',()=>{
  for(const [id,span]of [['matchday',6],['canal',8]]){
    const first=WC.create(MR.getMission(id,0).challenge);for(let n=1;n<=80;n++){WC.delivered(first,n);WC.update(first,.1);assert.equal(first.pace,1);}
    const run=WC.create(MR.getMission(id,7).challenge);assert.match(WC.notice(run,span-1),/1 LOAD$/);assert.equal(WC.delivered(run,span),true);assert.equal(run.pace,1);assert.ok(run.target>1&&run.target<1.15);
    WC.update(run,1/120);assert.ok(run.pace>1&&run.pace<1.003);for(let i=0;i<400;i++)WC.update(run,1/120);assert.ok(run.pace<=run.target);
    WC.delivered(run,span*2);assert.ok(run.target<1&&run.target>.85);
  }
});
test('crane lifts happen once per shipment and finish cleanly at every difficulty',()=>{
  for(let stage=0;stage<8;stage++){
    const run=WC.create(MR.getMission('build',stage).challenge);assert.equal(WC.delivered(run,5),false);assert.equal(WC.delivered(run,6),true);const duration=run.pause;assert.ok(duration>=.6&&duration<=1.02);assert.match(WC.notice(run,6),/TIMER REST/);
    assert.equal(WC.delivered(run,6),false);for(let i=0;i<150;i++)WC.update(run,1/120);assert.equal(run.pause,0);assert.equal(run.phase,'steady');assert.equal(WC.delivered(run,12),true);
  }
});
test('a complete arrival cycle preserves every mission’s cargo and a bounded four-shape vocabulary',()=>{
  for(const m of MR.missions){const run=WC.create(m.challenge);for(let i=0;i<200;i++){const type=WC.nextType(run,m.shift);assert.ok(type===null||Number.isInteger(type)&&type>=0&&type<(m.shift===1?3:4));WC.delivered(run,i);WC.update(run,.1);assert.ok(run.pace>.85&&run.pace<1.15);}}
});
