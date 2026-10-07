/* Original arcade cues, baked once and replayed on the audio clock. */
(function(root){
  'use strict';
  const RATE=32000,TAU=Math.PI*2,MAX_VOICES=4,MAX_RETIRING=2,BUDGET=1.2;
  const tone=(at,duration,freq,amp=.4,timbre='wood',end=freq)=>({at,duration,freq,end,amp,timbre});
  const air=(at,duration,amp=.12,cutoff=1800)=>({at,duration,amp,cutoff,timbre:'noise'});
  const phrase=(notes,step=.065,duration=.18,timbre='bell')=>notes.map((f,i)=>tone(i*step,duration,f,.4,timbre));
  const cues={};
  for(let tier=0;tier<4;tier++){
    const f=[523.25,587.33,659.26,783.99][tier];
    const landing=[tone(0,.12,165,.34,'bass',95),air(0,.045,.12,1400),tone(.012,.14,f,.34,'wood')];
    cues['load'+tier]={layers:landing,level:.64,priority:10,family:'delivery',gap:.032};
    cues['perfect'+tier]={layers:[...landing,tone(.025,.24,f*1.5,.23,'bell'),tone(.065,.22,f*2,.2,'bell')],level:.75,priority:15,family:'delivery',gap:.032};
  }
  Object.assign(cues,{
    gold:{layers:[tone(0,.12,160,.27,'bass',100),...phrase([659.26,987.77,1318.51],.045,.21)],level:.72,priority:20,family:'delivery',gap:.032},
    wrong:{layers:[tone(0,.21,235,.45,'wood',125),tone(.045,.17,155,.2,'bass',100)],level:.48,priority:35,family:'mistake',gap:.09},
    miss:{layers:[tone(0,.19,293.66,.35,'wood'),tone(.085,.23,196,.3,'wood')],level:.44,priority:35,family:'mistake',gap:.09},
    early:{layers:[tone(0,.075,330,.22,'wood')],level:.23,priority:5,family:'early',gap:.18},
    dispatch:{layers:[tone(0,.22,100,.32,'bass',185),air(.015,.28,.19,900),tone(.055,.18,392,.2,'wood'),tone(.12,.22,523.25,.23,'wood')],level:.64,priority:25,family:'dispatch',gap:.14},
    shift:{layers:[air(0,.17,.07,1600),...phrase([392,523.25,659.26,783.99],.075,.23,'wood')],level:.63,priority:45,family:'celebration',gap:.18},
    remix:{layers:[air(0,.18,.2,2400),tone(.02,.13,523.25,.25,'wood'),tone(.08,.17,659.26,.25,'wood')],level:.52,priority:40,family:'remix',gap:.18},
    goal:{layers:phrase([659.26,783.99,1046.5],.052,.25),level:.66,priority:40,family:'reward',gap:.14},
    unlock:{layers:phrase([523.25,659.26,1046.5],.07,.3),level:.63,priority:40,family:'reward',gap:.14},
    win:{layers:[...phrase([523.25,659.26,783.99,1046.5],.085,.28),tone(.29,.4,523.25,.23,'bell'),tone(.29,.4,659.26,.15,'bell'),tone(.29,.4,783.99,.13,'bell')],level:.68,priority:70,family:'result',gap:.2},
    over:{layers:phrase([392,329.63,261.63,196],.13,.29,'wood'),level:.46,priority:70,family:'result',gap:.2},
    purchase:{layers:[tone(0,.15,783.99,.35,'bell'),tone(.055,.23,1046.5,.3,'bell'),air(0,.025,.045,3300)],level:.58,priority:30,family:'ui',gap:.06},
    select:{layers:[tone(0,.065,587.33,.2,'wood'),air(0,.018,.04,2100)],level:.26,priority:5,family:'ui',gap:.045},
    count3:{layers:[tone(0,.1,392,.32,'wood')],level:.46,priority:60,family:'count',gap:.1},
    count2:{layers:[tone(0,.1,523.25,.32,'wood')],level:.47,priority:60,family:'count',gap:.1},
    count1:{layers:[tone(0,.1,659.26,.32,'wood')],level:.48,priority:60,family:'count',gap:.1},
    go:{layers:[tone(0,.19,783.99,.32,'wood'),tone(.025,.24,1046.5,.22,'bell'),air(0,.06,.065,1700)],level:.62,priority:60,family:'count',gap:.1}
  });
  const keys=Object.freeze(Object.keys(cues));
  function resolve(kind,streak=0){
    if(kind==='load'||kind==='perfect')return kind+Math.min(3,Math.floor(Math.max(0,Number.isFinite(streak)?streak:0)/8));
    return Object.prototype.hasOwnProperty.call(cues,kind)?kind:null;
  }
  function render(key){
    const cue=cues[key];if(!cue)throw new RangeError('Unknown sound cue');
    const length=Math.ceil((Math.max(...cue.layers.map(p=>p.at+p.duration))+.012)*RATE),data=new Float32Array(length);
    cue.layers.forEach((p,index)=>{
      let seed=(0x6d2b79f5+index*977+key.length*131)>>>0,low=0,slow=0;
      const start=Math.round(p.at*RATE),count=Math.ceil(p.duration*RATE),alpha=1-Math.exp(-TAU*(p.cutoff||1800)/RATE);
      for(let i=0;i<count;i++){
        const t=i/RATE,a=Math.min(1,t/.004),r=Math.min(1,(p.duration-t)/.022);
        const envelope=a*a*(3-2*a)*r*r*(3-2*r)*Math.exp(-t/(p.duration*.4));
        let sample;
        if(p.timbre==='noise'){
          seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
          const white=(seed>>>0)/2147483648-1;low+=alpha*(white-low);slow+=.025*(low-slow);sample=(low-slow)*1.6;
        }else{
          const phase=TAU*(p.freq*t+(p.end-p.freq)*t*t/(2*p.duration));
          sample=Math.sin(phase);
          if(p.timbre==='wood')sample+=.24*Math.sin(phase*2.76)*Math.exp(-t/.035)+.1*Math.sin(phase*5.2)*Math.exp(-t/.018);
          else if(p.timbre==='bell')sample+=.25*Math.sin(phase*2)+.12*Math.sin(phase*3)*Math.exp(-t/.11);
          else sample+=.12*Math.sin(phase*2);
        }
        data[start+i]+=sample*envelope*p.amp;
      }
    });
    let peak=0;for(const value of data)peak=Math.max(peak,Math.abs(value));
    const gain=peak?cue.level/peak:0;
    for(let i=0;i<data.length;i++)data[i]*=gain;
    data[0]=data[1]=data[data.length-2]=data[data.length-1]=0;
    return data;
  }
  class DockDashEffects{
    constructor({context,output,allowed=()=>true}={}){
      this.context=context;this.output=output;this.allowed=allowed;
      this.pcm=new Map();this.buffers=new Map();this.voices=new Set();this.retiring=new Set();this.last=new Map();this.boundContext=null;
    }
    samples(key){if(!this.pcm.has(key))this.pcm.set(key,render(key));return this.pcm.get(key);}
    warm(){
      if(this.warming)return;this.warming=true;let next=0;
      const schedule=typeof root.requestIdleCallback==='function'?fn=>root.requestIdleCallback(fn,{timeout:1000}):fn=>root.setTimeout(fn,0);
      const step=()=>{if(next<keys.length){this.samples(keys[next++]);schedule(step);}else this.warming=false;};schedule(step);
    }
    buffer(context,key){
      if(context!==this.boundContext){
        this.stopAll(true);
        this.buffers.clear();this.last.clear();this.boundContext=context;
      }
      if(!this.buffers.has(key)){
        const data=this.samples(key),buffer=context.createBuffer(1,data.length,RATE);
        buffer.getChannelData(0).set(data);this.buffers.set(key,buffer);
      }
      return this.buffers.get(key);
    }
    hold(param,at){
      if(typeof param.cancelAndHoldAtTime==='function')param.cancelAndHoldAtTime(at);
      else{const current=param.value;param.cancelScheduledValues(at);param.setValueAtTime(current,at);}
    }
    balance(context){
      const scale=Math.min(1,BUDGET/Math.max(1,this.voices.size)),at=context.currentTime;
      for(const voice of this.voices){this.hold(voice.gain.gain,at);voice.gain.gain.linearRampToValueAtTime(scale,at+.006);}
    }
    clean(voice){
      this.voices.delete(voice);this.retiring.delete(voice);
      try{voice.source.disconnect();voice.gain.disconnect();}catch(_){}
    }
    retire(voice){
      this.voices.delete(voice);this.retiring.add(voice);
      try{const at=voice.context.currentTime;this.hold(voice.gain.gain,at);voice.gain.gain.linearRampToValueAtTime(0,at+.006);voice.source.stop(at+.007);}catch(_){this.clean(voice);}
      while(this.retiring.size>MAX_RETIRING){const old=this.retiring.values().next().value;try{old.source.stop();}catch(_){}this.clean(old);}
    }
    stopAll(immediate=false){
      if(immediate){for(const voice of [...this.voices,...this.retiring]){try{voice.source.stop();}catch(_){}this.clean(voice);}}
      else for(const voice of [...this.voices])this.retire(voice);
      this.last.clear();
    }
    play(kind,{streak=0}={}){
      const key=resolve(kind,streak),context=this.context?.(),output=this.output?.();
      if(!key||!context||!output||context.state!=='running'||!this.allowed())return false;
      const cue=cues[key],at=context.currentTime;
      if(context===this.boundContext && at-(this.last.get(cue.family)??-Infinity)<cue.gap)return false;
      let source,gain,voice;
      try{
        const buffer=this.buffer(context,key);
        if(this.voices.size>=MAX_VOICES){
          let victim;for(const v of this.voices)if(!victim||v.priority<victim.priority)victim=v;
          if(victim.priority>cue.priority)return false;this.retire(victim);
        }
        source=context.createBufferSource();gain=context.createGain();source.buffer=buffer;gain.gain.value=0;
        source.connect(gain);gain.connect(output);voice={source,gain,context,priority:cue.priority};
        this.voices.add(voice);source.onended=()=>{this.clean(voice);if(this.boundContext===context)this.balance(context);};
        this.balance(context);source.start(at);this.last.set(cue.family,at);return true;
      }catch(_){if(voice)this.clean(voice);else{try{source?.disconnect();gain?.disconnect();}catch(_){}}try{this.balance(context);}catch(_){}return false;}
    }
  }
  DockDashEffects.keys=keys;DockDashEffects.render=render;DockDashEffects.resolve=resolve;DockDashEffects.sampleRate=RATE;
  root.DockDashEffects=DockDashEffects;if(typeof module!=='undefined'&&module.exports)module.exports=DockDashEffects;
})(typeof globalThis!=='undefined'?globalThis:this);
