/* Themed arrival patterns and smooth pace changes. Sorting never changes. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.DockDashChallenges=api;
})(typeof globalThis==='undefined'?this:globalThis,function(){
  'use strict';
  const profiles={
    rally:{name:'Match rush',short:'MATCH RUSH',copy:'Alternating team deliveries. A short, signalled rush follows each steady spell.',steady:'STEADY PLAY',active:'MATCH RUSH',warning:'RUSH IN'},
    convoy:{name:'Merchant convoy',short:'CONVOY',copy:'Three parcels with matching stickers travel together, then the next merchant arrives.',steady:'MERCHANT CONVOY',active:'MERCHANT CONVOY',warning:'NEXT CONVOY IN'},
    crane:{name:'Crane relay',short:'CRANE RELAY',copy:'Paired loads build each shipment. Brief crane lifts pause both the belt and your timer.',steady:'BUILD THE SHIPMENT',active:'CRANE LIFT',warning:'CRANE LIFT IN'},
    tide:{name:'Tide crossing',short:'TIDE CROSSING',copy:'The belt gently changes pace between calm water and a rising tide. Watch the advance notice.',steady:'CALM CROSSING',active:'RISING TIDE',warning:'TIDE RISE IN'},
    workshop:{name:'Supply sets',short:'SUPPLY SETS',copy:'Each set begins with the three priority supplies, followed by the rest of the workshop order.',steady:'SUPPLY SET',active:'SUPPLY SET',warning:'NEXT SET IN'},
    trail:{name:'Trail markers',short:'TRAIL MARKERS',copy:'Repeating colour-and-shape trails guide the deliveries. Gold still fits any open truck.',steady:'FOLLOW THE TRAIL',active:'FOLLOW THE TRAIL',warning:'NEXT TRAIL IN'}
  };
  const fixed={matchday:'rally',arena:'rally',festival:'rally',rome:'convoy',egypt:'convoy',viking:'convoy',silkroad:'convoy',build:'crane',robot:'workshop',prism:'workshop',school:'workshop',candy:'workshop',diner:'rally',bakery:'workshop',rescue:'tide',beacon:'tide',arctic:'tide',canal:'tide',space:'tide',metro:'convoy',skyguard:'rally',dino:'trail',forest:'trail'};
  function family(world){
    if(fixed[world.id])return fixed[world.id];
    if(world.chapter==='echoes')return 'convoy';
    if(world.chapter==='clockwork')return /repair|quarry|iron|workshop|clock|gear/.test(world.id)?'crane':'workshop';
    if(world.chapter==='greenwood'||world.chapter==='wildheart')return 'trail';
    if(world.chapter==='tidebound'||world.chapter==='skyroads')return 'tide';
    if(world.chapter==='hearthside')return /festival|music|stage|fair/.test(world.id)?'rally':'workshop';
    return /library|archive|memory/.test(world.id)?'convoy':/choir|dawn|bazaar/.test(world.id)?'rally':'tide';
  }
  function hash(id){let n=0;for(const c of id)n=(n*31+c.charCodeAt(0))>>>0;return n;}
  function describe(world,stage){
    const kind=family(world),p=profiles[kind];
    return {kind,...p,seed:hash(world.id),stage,
      copy:stage===0&&(kind==='rally'||kind==='tide')?'Learn the route at a steady pace. Its changing pace begins at level 2.':p.copy};
  }
  function create(description){return {description,spawned:0,pace:1,target:1,block:0,phase:'steady',pause:0,craneLoads:0,label:description.steady};}
  function nextType(run,shift){
    const n=run.spawned++,d=run.description,lanes=shift===1?3:4,offset=d.seed%lanes;
    if(d.kind==='convoy')return (Math.floor(n/3)+offset)%lanes;
    if(d.kind==='crane')return (Math.floor(n/2)+offset)%lanes;
    if(d.kind==='trail')return (n+offset)%lanes;
    if(d.kind==='rally')return (n%2+(Math.floor(n/6)+offset)*2)%lanes;
    return null;
  }
  function arrangeDeck(run,deck,priority){
    if(run.description.kind!=='workshop')return deck;
    const ordered=priority.slice().reverse();
    return [...deck.filter(id=>!priority.includes(id)),...ordered];
  }
  function delivered(run,count){
    const d=run.description;
    if(d.kind==='crane'&&count>0&&count%6===0&&run.craneLoads!==count){
      run.craneLoads=count;run.pause=.6+Math.min(d.stage,7)*.06;run.phase='lift';run.label=d.active;return true;
    }
    const span=d.kind==='rally'?6:8,block=Math.floor(count/span);
    if((d.kind==='rally'||d.kind==='tide')&&d.stage>0&&block!==run.block){
      run.block=block;run.phase=block%2?'active':'steady';
      const amplitude=.05+d.stage*.008;
      run.target=block%2?1+amplitude:1-amplitude;
      run.label=block%2?d.active:d.steady;return true;
    }
    return false;
  }
  function update(run,dt){
    if(!Number.isFinite(dt)||dt<=0)return;
    run.pace+=(run.target-run.pace)*Math.min(1,dt*2.5);
    if(run.pause>0){run.pause=Math.max(0,run.pause-dt);if(run.pause<1e-7)run.pause=0;if(!run.pause){run.phase='steady';run.label=run.description.steady;}}
  }
  function notice(run,count){
    const d=run.description;
    if(run.pause>0)return 'CRANE LIFT · BELT + TIMER REST';
    const span=d.kind==='rally'?6:d.kind==='tide'?8:d.kind==='crane'?6:0;
    if(!span||((d.kind==='rally'||d.kind==='tide')&&d.stage===0))return run.label;
    const left=span-count%span;
    if(left<=2&&(d.kind==='crane'||run.block%2===0))return `${d.warning} ${left} LOAD${left===1?'':'S'}`;
    return run.label;
  }
  return {profiles,family,describe,create,nextType,arrangeDeck,delivered,update,notice};
});
