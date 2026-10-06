const test=require('node:test'),assert=require('node:assert/strict');
const LoopPlayer=require('../audio/loop-player.js');
function setup({limit=1}={}){
 class Native extends EventTarget {
  constructor(){super();this.paused=true;this.currentTime=0;this.readyState=4;this.error=null;this.calls=0;this.attributes={};}
  get src(){return this.attributes.src;}
  set src(v){this.attributes.src=v;}
  getAttribute(k){return this.attributes[k];}
  removeAttribute(k){delete this.attributes[k];}
  pause(){if(!this.paused){this.paused=true;this.dispatchEvent(new Event('pause'));}}
  play(){this.calls++;this.paused=false;this.dispatchEvent(new Event('playing'));return Promise.resolve();}
 }
 class Context extends EventTarget {
  constructor(){super();this.state='running';this.currentTime=0;this.sampleRate=1000;this.destination={};this.starts=0;this.stops=0;this.mixes=0;this.decoding=0;this.maxDecoding=0;this.decodeCalls=0;this.defer=null;}
  resume(){this.state='running';this.dispatchEvent(new Event('statechange'));return Promise.resolve();}
  createGain(){return {context:this,connect(){},disconnect(){},gain:{value:1,setTargetAtTime:(value)=>{this.mixes++;}}};}
  createBufferSource(){return {context:this,connect(){},disconnect(){},start:()=>this.starts++,stop:()=>this.stops++};}
  async decodeAudioData(){this.decodeCalls++;this.decoding++;this.maxDecoding=Math.max(this.maxDecoding,this.decoding);if(this.defer)await this.defer;this.decoding--;const samples=new Float32Array(3000).map((_,i)=>Math.sin(i*.02)*.2);return {sampleRate:1000,length:3000,numberOfChannels:1,duration:3,getChannelData:()=>samples};}
 }
 let context=new Context(),downloads=0;
 const pool=new LoopPlayer.Pool(()=>context,limit,async()=>{downloads++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};});
 const native=new Native(),player=new LoopPlayer(native,pool);player.src='warehouse.mp3';
 return {player,native,pool,get context(){return context;},get downloads(){return downloads;},replaceContext(){context=new Context();}};
}
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
test('priming downloads the selected song once without decoding or autoplay',async()=>{
 const e=setup();e.player.preload='auto';e.player.load();e.player.load();await flush();assert.equal(e.downloads,1);assert.equal(e.context.decodeCalls,0);assert.equal(e.context.starts,0);assert.equal(e.native.calls,0);
});
test('many repeat boundaries keep one source, one decode and the original duration',async()=>{
 const e=setup();await e.player.play();const source=e.player.source;e.context.currentTime=60.125;
 assert.equal(e.player.currentTime,.125);assert.equal(e.player.source,source);assert.equal(source.loop,true);assert.equal(source.loopEnd,3);assert.equal(e.context.starts,1);assert.equal(e.pool.decodes,1);assert.equal(e.native.calls,0);
});
test('the splice is continuous without trimming beats or fading the entire loop',async()=>{
 const e=setup();await e.player.play();const b=e.player.buffer,data=b.getChannelData(0);assert.equal(data.length,3000);assert.equal(data[0],data[2999]);assert.equal(data[0],data[2998]);assert.ok(Math.abs(data[2000]-Math.sin(2000*.02)*.2)<1e-6);assert.ok(data.some(v=>Math.abs(v)>.19));
});
test('pause and resume preserve the audio position and reuse decoded music',async()=>{
 const e=setup();await e.player.play();e.context.currentTime=7.25;e.player.pause();assert.equal(e.player.paused,true);assert.equal(e.player.currentTime,1.25);e.context.currentTime=10;await e.player.play();assert.equal(e.player.currentTime,1.25);assert.equal(e.pool.decodes,1);assert.equal(e.downloads,1);assert.equal(e.context.stops,1);
});
test('rapid pause and resume during decoding start one song, without native fallback',async()=>{
 const e=setup();let release;e.context.defer=new Promise(r=>release=r);const first=e.player.play();await flush();e.player.pause();const second=e.player.play();await flush();release();await Promise.all([first,second]);assert.equal(e.context.starts,1);assert.equal(e.context.decodeCalls,1);assert.equal(e.player.paused,false);assert.equal(e.native.calls,0);
});
test('a late decode cannot start music after mute or background pause',async()=>{
 const e=setup();let release;e.context.defer=new Promise(r=>release=r);const playing=e.player.play();await flush();e.player.muted=true;e.player.pause();release();await playing;assert.equal(e.context.starts,0);assert.equal(e.native.calls,0);assert.equal(e.player.paused,true);
});
test('rapid theme changes serialize decoding and never start the obsolete theme',async()=>{
 const e=setup();let release;e.context.defer=new Promise(r=>release=r);const first=e.player.play();await flush();e.player.src='harbour.mp3';const second=e.player.play();await flush();release();await Promise.all([first,second]);assert.equal(e.context.starts,1);assert.equal(e.context.maxDecoding,1);assert.equal(e.player.src,'harbour.mp3');assert.equal(e.pool.entries.size,1);assert.equal(e.native.calls,0);
});
test('steady touches and volume sync add no gain automation or source starts',async()=>{
 const e=setup();e.player.volume=.52;await e.player.play();const starts=e.context.starts,mixes=e.context.mixes;
 for(let i=0;i<1000;i++){e.player.volume=.52;e.player.muted=false;e.player.playbackRate=1.1;await e.player.play();}
 assert.equal(e.context.mixes,mixes);assert.equal(e.context.starts,starts);assert.equal(e.player.playbackRate,1);
});
test('an audio interruption resumes the same source without resetting the loop',async()=>{
 const e=setup();await e.player.play();e.context.currentTime=1.5;const source=e.player.source;e.context.state='interrupted';e.context.dispatchEvent(new Event('statechange'));assert.equal(e.player.paused,true);await e.player.play();assert.equal(e.player.paused,false);assert.equal(e.player.source,source);assert.equal(e.player.currentTime,1.5);assert.equal(e.context.starts,1);
});
test('recreating a closed context reuses the buffer and releases the old source',async()=>{
 const e=setup();await e.player.play();e.context.currentTime=1.5;e.context.state='closed';e.replaceContext();await e.player.play();assert.equal(e.player.currentTime,1.5);assert.equal(e.pool.decodes,1);assert.equal(e.downloads,1);assert.equal(e.context.starts,1);
});
test('an asynchronous context resume keeps the existing source until audio is running',async()=>{
 const e=setup();await e.player.play();const source=e.player.source;e.context.state='suspended';let release;e.context.resume=()=>new Promise(r=>release=()=>{e.context.state='running';r();});const resumed=e.player.play();await flush();assert.equal(e.player.source,source);assert.equal(e.context.starts,1);release();await resumed;assert.equal(e.player.source,source);assert.equal(e.player.paused,false);
});
test('a rejected context resume reports failure without starting a second decoder',async()=>{
 const e=setup();e.context.state='suspended';e.context.resume=()=>Promise.reject(new Error('NotAllowedError'));await assert.rejects(e.player.play(),/NotAllowedError/);assert.equal(e.context.starts,0);assert.equal(e.native.calls,0);
});
test('a failed decoder falls back to a single native looping player',async()=>{
 const e=setup();e.context.decodeAudioData=async()=>{throw new Error('unsupported');};await e.player.play();assert.equal(e.player.fallback,true);assert.equal(e.native.calls,1);assert.equal(e.native.loop,true);assert.equal(e.player.paused,false);e.player.pause();assert.equal(e.player.paused,true);
});
