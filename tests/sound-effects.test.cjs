const test=require('node:test'),assert=require('node:assert/strict');
const Effects=require('../audio/sound-effects.js');
function setup(){
 let allowed=true;
 class Param{constructor(){this.value=1;}setValueAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}cancelScheduledValues(){}cancelAndHoldAtTime(){}}
 class Context{
  constructor(){this.currentTime=0;this.state='running';this.created=0;this.sources=[];this.fail=false;}
  createBuffer(channels,length,rate){this.created++;const data=new Float32Array(length);return {length,duration:length/rate,getChannelData:()=>data};}
  createGain(){return {gain:new Param(),connect(){},disconnect(){this.disconnected=true;}};}
  createBufferSource(){
   const source={connect(){},disconnect(){this.disconnected=true;},start:at=>{if(this.fail)throw Error('Audio unavailable');source.started=at;source.end=at+source.buffer.duration;},stop:at=>{source.end=at??this.currentTime;},finish:()=>source.onended?.()};
   this.sources.push(source);return source;
  }
  advance(dt){this.currentTime+=dt;for(const s of this.sources)if(!s.ended&&s.end<=this.currentTime){s.ended=true;s.finish();}}
 }
 let context=new Context();const output={};const e=new Effects({context:()=>context,output:()=>output,allowed:()=>allowed});
 return {e,get context(){return context;},changeContext:()=>context=new Context(),allow:v=>allowed=v};
}
test('every cue is finite, audible, short and bounded, with silent opening and closing edges',()=>{
 assert.equal(Effects.keys.length,25);let total=0;
 for(const key of Effects.keys){const data=Effects.render(key);total+=data.byteLength;let peak=0,power=0;
  for(const value of data){assert.ok(Number.isFinite(value),key);peak=Math.max(peak,Math.abs(value));power+=value*value;}
  assert.ok(peak>.2&&peak<=.751,key);assert.ok(power/data.length>.0005,key);assert.ok(data.length/Effects.sampleRate<.8,key);
  assert.deepEqual([data[0],data[1],data.at(-2),data.at(-1)],[0,0,0,0]);
 }
 assert.ok(total<1024*1024,total);
});
test('streaks choose four musical tiers and malformed values cannot create unbounded cache keys',()=>{
 assert.equal(Effects.resolve('load',0),'load0');assert.equal(Effects.resolve('perfect',9),'perfect1');assert.equal(Effects.resolve('load',19),'load2');
 for(const streak of [32,999999])assert.equal(Effects.resolve('perfect',streak),'perfect3');
 for(const streak of [-4,NaN,Infinity])assert.equal(Effects.resolve('load',streak),'load0');
 assert.equal(Effects.resolve('unexpected'),null);
});
test('first play starts on the current audio clock and repeated cues reuse their sample and buffer',()=>{
 const s=setup();s.context.currentTime=14.25;assert.equal(s.e.play('load'),true);assert.equal(s.context.sources[0].started,14.25);
 const pcm=s.e.pcm.get('load0'),buffer=s.e.buffers.get('load0');s.context.advance(.2);assert.equal(s.e.play('load'),true);
 assert.equal(s.e.pcm.get('load0'),pcm);assert.equal(s.e.buffers.get('load0'),buffer);assert.equal(s.context.created,1);
});
test('muted, paused, unavailable and interrupted contexts do not allocate or queue a sound',()=>{
 const s=setup();s.allow(false);assert.equal(s.e.play('win'),false);s.allow(true);
 for(const state of ['suspended','interrupted','closed']){s.context.state=state;assert.equal(s.e.play('load'),false);}
 assert.equal(s.context.sources.length,0);assert.equal(s.context.created,0);s.context.state='running';assert.equal(s.e.play('select'),true);assert.equal(s.context.sources.length,1);
});
test('rapid duplicate delivery cues are suppressed across all streak and perfect variants',()=>{
 const s=setup();assert.equal(s.e.play('load'),true);for(let i=0;i<300;i++)assert.equal(s.e.play(i%2?'perfect':'load',{streak:i}),false);
 assert.equal(s.context.sources.length,1);s.context.advance(.033);assert.equal(s.e.play('perfect',{streak:16}),true);
});
test('long sessions keep buffers, voices and retiring sources bounded and clean completed nodes',()=>{
 const s=setup();let max=0;
 for(let i=0;i<2000;i++){
  s.context.advance(.041);s.e.play(Effects.keys[i%Effects.keys.length]);max=Math.max(max,s.e.voices.size+s.e.retiring.size);
  assert.ok(s.e.voices.size<=4);assert.ok(s.e.retiring.size<=2);assert.ok(s.e.buffers.size<=25);
 }
 s.context.advance(2);assert.equal(s.e.voices.size,0);assert.equal(s.e.retiring.size,0);assert.ok(s.context.sources.every(x=>x.disconnected));assert.ok(max<=6);
});
test('a countdown or result cannot be displaced by lower-priority tap sounds',()=>{
 const s=setup();for(const key of ['count3','win','shift','unlock'])assert.equal(s.e.play(key),true);
 const first=s.context.sources[0];assert.equal(s.e.play('early'),false);assert.equal(s.context.sources.length,4);assert.equal(first.end,first.buffer.duration);
});
test('priority replacement fades a quieter voice and all active gains share a limited mix budget',()=>{
 const s=setup();for(const key of ['load','early','select','dispatch'])assert.equal(s.e.play(key),true);
 assert.equal(s.e.play('win'),true);assert.equal(s.e.voices.size,4);assert.equal(s.e.retiring.size,1);
 assert.ok([...s.e.voices].reduce((sum,v)=>sum+v.gain.gain.value,0)<=1.200001);s.context.advance(.008);assert.equal(s.e.retiring.size,0);
});
test('stop clears active feedback and old families do not block a new game',()=>{
 const s=setup();s.e.play('load');s.e.play('goal');s.e.stopAll();assert.equal(s.e.voices.size,0);assert.equal(s.e.last.size,0);
 s.context.advance(.008);assert.equal(s.e.retiring.size,0);assert.equal(s.e.play('load'),true);
});
test('a replacement audio context gets new buffers while retaining baked PCM and isolating old callbacks',()=>{
 const s=setup();s.e.play('load');const pcm=s.e.pcm.get('load0'),buffer=s.e.buffers.get('load0'),old=s.context.sources[0];
 s.changeContext();assert.equal(s.e.play('load'),true);assert.notEqual(s.e.buffers.get('load0'),buffer);assert.equal(s.e.pcm.get('load0'),pcm);
 old.finish();assert.equal(s.e.voices.size,1);assert.equal(s.e.retiring.size,0);
});
test('a hidden or interrupted page immediately detaches active and retiring nodes',()=>{
 const s=setup();for(const key of ['load','early','select','dispatch','win'])s.e.play(key);
 s.e.stopAll(true);assert.equal(s.e.voices.size,0);assert.equal(s.e.retiring.size,0);assert.ok(s.context.sources.every(source=>source.disconnected));
});
test('failed playback disconnects its nodes and never consumes the retry cooldown',()=>{
 const s=setup();s.context.fail=true;assert.equal(s.e.play('load'),false);assert.equal(s.e.voices.size,0);assert.equal(s.e.last.size,0);assert.equal(s.context.sources[0].disconnected,true);
 s.context.fail=false;assert.equal(s.e.play('load'),true);
});
test('noise and harmonics are deterministic, while success, perfect and error sounds remain distinct',()=>{
 assert.deepEqual(Effects.render('dispatch'),Effects.render('dispatch'));
 assert.notDeepEqual(Effects.render('load0'),Effects.render('perfect0'));assert.notDeepEqual(Effects.render('wrong'),Effects.render('miss'));
});
