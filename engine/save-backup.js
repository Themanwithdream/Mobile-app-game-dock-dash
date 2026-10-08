/* Portable saves with validation, a restore journal and one-step undo. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.DockDashBackups=api;
})(typeof globalThis==='undefined'?this:globalThis,function(){
  'use strict';
  const MAX_BYTES=1024*1024,MAX=1e9,JOURNAL='dockDashRestoreV1';
  const keys={best:'dockDashBest',muted:'dockDashMuted',profile:'dockDashProfileV2',wallet:'dockDashWalletV1',settings:'dockDashSettingsV3',cargo:'dockDashCargoCollectionV1',missions:'dockDashMissionsV1'};
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  const integer=(x,min=0,max=MAX)=>Number.isInteger(x)&&x>=min&&x<=max;
  function requireValid(ok,message){if(!ok)throw Error(message);}
  function checksum(text){let n=2166136261;for(let i=0;i<text.length;i++)n=Math.imul(n^text.charCodeAt(i),16777619);return (n>>>0).toString(16).padStart(8,'0');}
  function encode(data){return Object.fromEntries(Object.entries(keys).map(([field,key])=>[key,JSON.stringify(data[field])]));}
  function journal(storage){
    const raw=storage.getItem(JOURNAL);if(!raw)return null;
    const saved=JSON.parse(raw);
    requireValid(object(saved)&&['pending','undo'].includes(saved.status)&&object(saved.previous),'The previous restore copy is unreadable.');
    for(const key of Object.values(keys))requireValid(saved.previous[key]===null||(typeof saved.previous[key]==='string'&&saved.previous[key].length<=MAX_BYTES),'The previous restore copy is incomplete.');
    return saved;
  }
  function writeRaw(storage,values){for(const key of Object.values(keys)){if(values[key]===null)storage.removeItem(key);else storage.setItem(key,values[key]);}}
  class Backups {
    constructor({missions,economy,productCount}){this.MR=missions;this.ER=economy;this.productCount=productCount;}
    validate(data){
      requireValid(object(data)&&Object.keys(keys).every(k=>Object.hasOwn(data,k)),'This backup is incomplete.');
      requireValid(integer(data.best)&&typeof data.muted==='boolean','The score or sound setting is invalid.');
      const p=data.profile;
      requireValid(object(p),'The player profile is missing.');
      for(const k of ['totalDelivered','totalPerfect','totalTrucks','totalGoals'])requireValid(integer(p[k]),'The delivery totals are invalid.');
      requireValid(integer(p.highestShift,1)&&integer(p.selectedSkin,0,this.ER.trucks.length-1)&&typeof p.tutorialDone==='boolean','The truck selection or shift record is invalid.');
      requireValid(typeof p.selectedWrap==='string'&&typeof p.selectedZone==='string','The equipped styles are invalid.');
      const w=data.wallet;
      requireValid(object(w)&&w.version===1&&['coins','earned','spent'].every(k=>integer(w[k]))&&w.earned>=w.coins&&Array.isArray(w.owned),'The coin wallet is invalid.');
      requireValid(w.owned.every(id=>typeof id==='string'&&this.ER.item(id)?.price)&&new Set(w.owned).size===w.owned.length,'The purchased items are invalid.');
      requireValid(this.ER.isOwned(w,this.ER.trucks[p.selectedSkin],p),'The selected truck is not unlocked in this backup.');
      for(const [field,kind]of [['selectedWrap','wrap'],['selectedZone','zone']])requireValid(this.ER.equippedStyle(w,p[field],kind)===p[field],'An equipped style is not owned in this backup.');
      const s=data.settings;
      requireValid(object(s)&&integer(s.location,0,this.ER.venues.length-1)&&this.ER.ownedLocations(w,p).includes(s.location),'The arcade place is not owned in this backup.');
      requireValid(['rotate','music','sfx'].every(k=>typeof s[k]==='boolean')&&typeof s.musicVolume==='number'&&Number.isFinite(s.musicVolume)&&s.musicVolume>=0&&s.musicVolume<=1&&['auto','full','reduced'].includes(s.effects),'The game settings are invalid.');
      requireValid(Array.isArray(data.cargo)&&data.cargo.every(id=>integer(id,0,this.productCount-1))&&new Set(data.cargo).size===data.cargo.length,'The cargo collection is invalid.');
      requireValid(object(data.missions),'The mission records are invalid.');
      const known=new Map(this.MR.missions.map(m=>[m.id,m]));
      for(const [id,r]of Object.entries(data.missions)){
        const m=known.get(id);
        requireValid(m&&object(r)&&integer(r.stars,1,3)&&integer(r.bestScore)&&typeof r.bestTime==='number'&&Number.isFinite(r.bestTime)&&r.bestTime>=0&&r.bestTime<=m.seconds,'A mission record is invalid or needs a newer game version.');
      }
      // Copy only game fields. A file can never write other browser-storage keys.
      return {best:data.best,muted:data.muted,
        profile:{totalDelivered:p.totalDelivered,totalPerfect:p.totalPerfect,totalTrucks:p.totalTrucks,totalGoals:p.totalGoals,highestShift:p.highestShift,selectedSkin:p.selectedSkin,selectedWrap:p.selectedWrap,selectedZone:p.selectedZone,tutorialDone:p.tutorialDone},
        wallet:{version:1,coins:w.coins,earned:w.earned,spent:w.spent,owned:w.owned.slice()},
        settings:{location:s.location,rotate:s.rotate,music:s.music,sfx:s.sfx,musicVolume:s.musicVolume,effects:s.effects},
        cargo:data.cargo.slice(),missions:this.MR.readRecords(data.missions)};
    }
    export(data,createdAt=new Date().toISOString()){
      const payload={game:'Dock Boss',version:1,createdAt,data:this.validate(data)};
      return JSON.stringify({...payload,checksum:checksum(JSON.stringify(payload))},null,2);
    }
    read(text){
      requireValid(typeof text==='string'&&text.length<=MAX_BYTES,'Choose a game backup smaller than 1 MB.');
      let saved;try{saved=JSON.parse(text);}catch(_){throw Error('This file is not a readable game backup.');}
      requireValid(object(saved)&&['Dock Boss','Parcel Odyssey','Dock Dash'].includes(saved.game)&&saved.version===1,'Choose a Dock Boss or previous game backup.');
      requireValid(typeof saved.createdAt==='string'&&Number.isFinite(Date.parse(saved.createdAt)),'The backup date is invalid.');
      const payload={game:saved.game,version:saved.version,createdAt:saved.createdAt,data:saved.data};
      requireValid(saved.checksum===checksum(JSON.stringify(payload)),'This backup is incomplete or has been changed.');
      const data=this.validate(saved.data);return {data,createdAt:saved.createdAt,summary:this.summary(data)};
    }
    summary(data){return {coins:data.wallet.coins,stars:this.MR.totalStars(data.missions),lanterns:this.MR.lanternCount(data.missions),purchases:data.wallet.owned.length,cargo:data.cargo.length,best:data.best};}
    restore(storage,data,current,keepUndo=true){
      const incoming=encode(this.validate(data)),previous=encode(this.validate(current)),oldJournal=storage.getItem(JOURNAL);
      // The checkpoint must fit before any progress is replaced.
      storage.setItem(JOURNAL,JSON.stringify({status:'pending',previous}));
      try{writeRaw(storage,incoming);if(keepUndo)storage.setItem(JOURNAL,JSON.stringify({status:'undo',previous}));else storage.removeItem(JOURNAL);}
      catch(error){
        try{writeRaw(storage,previous);if(oldJournal===null)storage.removeItem(JOURNAL);else storage.setItem(JOURNAL,oldJournal);}catch(_){/* Pending journal is recovered before game startup. */}
        throw error;
      }
    }
    undo(storage,current){
      const saved=journal(storage);requireValid(saved?.status==='undo','There is no restore to undo.');
      const decoded=Object.fromEntries(Object.entries(keys).map(([field,key])=>[field,JSON.parse(saved.previous[key])]));
      const previous=this.validate(decoded);this.restore(storage,previous,current,false);return previous;
    }
    static recover(storage){const saved=journal(storage);if(saved?.status!=='pending')return false;writeRaw(storage,saved.previous);storage.removeItem(JOURNAL);return true;}
    static hasUndo(storage){try{return journal(storage)?.status==='undo';}catch(_){return false;}}
  }
  Backups.keys=keys;Backups.journalKey=JOURNAL;Backups.maxBytes=MAX_BYTES;
  return Backups;
});
