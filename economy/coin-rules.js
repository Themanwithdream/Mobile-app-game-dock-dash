/* Earned currency, vehicles, arcade places and styles. IDs never change. */
(function (root, factory) {
  const rules = factory();
  if (typeof module === 'object' && module.exports) module.exports = rules;
  else root.DockDashEconomy = rules;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MAX = 1e9;
  const trucks = [
    { id:'classic', name:'Classic', need:0, accent:'#e8c58a', emblem:'box', copy:'Your trusty first fleet.' },
    { id:'rally', name:'Rally', need:25, accent:'#fff2cc', emblem:'flag', copy:'Stripes for the fast lane.' },
    { id:'nightline', name:'Nightline', need:75, accent:'#a7ffe5', emblem:'bolt', copy:'A little neon after dark.' },
    { id:'gold', name:'Gold trim', need:150, accent:'#ffe6a1', emblem:'star', copy:'A classic delivery reward.' },
    { id:'school', name:'School Bus', price:150, accent:'#ffd66f', emblem:'pencils', world:'school', copy:'Make every school day bright.' },
    { id:'matchday', name:'Goal Getter', price:220, accent:'#c8ec9a', emblem:'soccerball', world:'matchday', copy:'Deliver a little kickoff magic.' },
    { id:'festival', name:'Tour Bus', price:280, accent:'#ffc2dd', emblem:'guitar', world:'festival', copy:'Take the show on the road.' },
    { id:'batcave', name:'Bat Courier', price:320, accent:'#ffdf72', emblem:'bat', world:'batcave', copy:'Gotham needs its gadgets.' },
    { id:'rescue', name:'Rescue Runner', price:360, accent:'#a2e8f1', emblem:'firstaid', world:'rescue', copy:'Ready when the crew needs you.' },
    { id:'candy', name:'Sweet Wheels', price:420, accent:'#ffbadc', emblem:'lollipop', world:'candy', copy:'A tiny truck. A huge sugar rush.' },
    { id:'dino', name:'Ranger Rover', price:500, accent:'#c0e9a0', emblem:'dinoegg', world:'dino', copy:'Precious cargo from the past.' },
    { id:'arctic', name:'Polar Express', price:560, accent:'#bdeaff', emblem:'snowflake', world:'arctic', copy:'Warm deliveries, cool adventures.' },
    { id:'forest', name:'Moonleaf', price:650, accent:'#d2bdff', emblem:'potion', world:'forest', copy:'A little wonder in every load.' },
    { id:'space', name:'Star Hauler', price:800, accent:'#c9bfff', emblem:'rocket', world:'space', copy:'The final frontier has four docks.' },
    { id:'batmobile', name:'Batmobile', price:900, accent:'#ffe17e', emblem:'bat', body:'batmobile', copy:'Swept wings, a jet engine and Gotham style.' },
    { id:'tumbler', name:'Tumbler', price:1200, accent:'#d9b77b', emblem:'bat', body:'tumbler', copy:'Heavy armour and six enormous patrol tyres.' },
    { id:'fire-engine', name:'Fire Engine', price:600, accent:'#ffb6a1', emblem:'firstaid', body:'fire', copy:'A roof ladder and bright emergency lights.' },
    { id:'ice-cream', name:'Ice Cream Van', price:700, accent:'#ffc7ea', emblem:'lollipop', body:'icecream', copy:'A striped counter and a giant rooftop cone.' },
    { id:'monster', name:'Monster Truck', price:950, accent:'#c6f49a', emblem:'bolt', body:'monster', copy:'Oversized wheels and a little off-road attitude.' },
    { id:'moon-rover', name:'Moon Rover', price:1400, accent:'#c8d9ff', emblem:'satellite', body:'rover', copy:'Six lunar wheels, solar panels and a dish.' },
    { id:'food-truck', name:'Food Truck', price:450, accent:'#ffa99c', emblem:'burger', body:'foodtruck', world:'diner', new:true, copy:'A roof grill, serving hatch and striped awning.' },
    { id:'bread-van', name:'Bread Van', price:380, accent:'#ffe1a4', emblem:'croissant', body:'breadvan', world:'bakery', new:true, copy:'A rounded bakery van with bread racks and a warm roof.' },
    { id:'city-tram', name:'City Tram', price:650, accent:'#99deff', emblem:'transitticket', body:'citytram', world:'metro', new:true, copy:'A little tram with passenger windows and a rooftop collector.' },
    { id:'canal-wagon', name:'Canal Wagon', price:520, accent:'#a4e4cf', emblem:'bouquet', body:'canalwagon', world:'canal', new:true, copy:'An open market wagon with flower crates and canvas trim.' },
    { id:'sky-glider', name:'Sky Glider', price:1000, accent:'#ffc9a1', emblem:'heroshield', body:'skyglider', world:'skyguard', new:true, copy:'An original rescue craft with swept wings and twin turbines.' },
    { id:'arena-sprinter', name:'Arena Sprinter', price:720, accent:'#b9e8a0', emblem:'basketball', body:'arenasprinter', world:'arena', new:true, copy:'A low sports transporter with racing stripes and a rear spoiler.' },
    { id:'cement-mixer', name:'Cement Mixer', price:850, accent:'#ffd276', emblem:'hardhat', body:'cementmixer', world:'build', new:true, copy:'A six-wheel work truck with a striped mixing drum.' },
    { id:'robot-carrier', name:'Robot Carrier', price:1100, accent:'#a9eee7', emblem:'robotkit', body:'robotcarrier', world:'robot', new:true, copy:'A tracked lab transporter with circuits and a tiny robot assistant.' },
    { id:'prism-hauler', name:'Prism Hauler', price:950, accent:'#c7bfff', emblem:'prismring', body:'prismhauler', world:'prism', new:true, copy:'Faceted cargo pods and a ring that matches each truck colour.' }
  ].map(item=>({...item,type:'truck'}));
  const venues = [
    { id:'venue:warehouse', name:'Warehouse', location:0, need:0, accent:'#e8bd70', copy:'Your original arcade home. All cargo varieties.' },
    { id:'venue:harbour', name:'Harbour Depot', location:1, need:0, accent:'#76d8d6', copy:'Ocean swells, container cranes and harbour music.' },
    { id:'venue:airport', name:'Air Cargo Hub', location:2, need:0, accent:'#b5caff', copy:'Runway lights, freighters and airport music.' },
    { id:'venue:matchday', name:'Soccer Field', world:'matchday', location:3, price:250, accent:'#b8e89b', copy:'Endless matchday deliveries: balls, jerseys and team kits.' },
    { id:'venue:festival', name:'Festival Stage', world:'festival', location:4, price:350, accent:'#ffbf89', copy:'Endless festival deliveries: music, tickets and lights.' },
    { id:'venue:rescue', name:'Rescue Harbour', world:'rescue', location:5, price:400, accent:'#92dfeb', copy:'Endless rescue deliveries: safety gear and crew supplies.' },
    { id:'venue:space', name:'Moonbase', world:'space', location:6, price:750, accent:'#c4baff', copy:'Endless lunar deliveries: oxygen, robots and rockets.' },
    { id:'venue:batcave', name:'Batcave', world:'batcave', location:7, price:500, accent:'#ffdf72', copy:'Endless Gotham deliveries: Batarangs, grapples and gadgets.' },
    { id:'venue:school', name:'School Campus', world:'school', location:8, price:250, accent:'#ffd783', copy:'Endless school deliveries: books, pencils and science supplies.' },
    { id:'venue:dino', name:'Dino Park', world:'dino', location:9, price:450, accent:'#c3e89e', copy:'Endless ranger deliveries: eggs, fossils and dinosaur feed.' },
    { id:'venue:candy', name:'Candy Factory', world:'candy', location:10, price:350, accent:'#ffc1df', copy:'Endless sweet deliveries: chocolate, sugar and sprinkles.' },
    { id:'venue:forest', name:'Magic Forest', world:'forest', location:11, price:650, accent:'#d2bdff', copy:'Endless magical deliveries: potions, crystals and spellbooks.' },
    { id:'venue:arctic', name:'Arctic Station', world:'arctic', location:12, price:550, accent:'#bdeaff', copy:'Endless polar deliveries: warm kits and expedition supplies.' },
    { id:'venue:rome', name:'Roman Forum', world:'rome', location:13, price:600, accent:'#f2d08c', copy:'Roman scenery, music and endless amphorae, scrolls and shields.' },
    { id:'venue:egypt', name:'Nile Court', world:'egypt', location:14, price:650, accent:'#91dfe5', copy:'Nile scenery, music and endless papyrus, pottery and linen.' },
    { id:'venue:viking', name:'Viking Harbour', world:'viking', location:15, price:700, accent:'#b8dbe9', copy:'Northern scenery, music and endless shields, barrels and wool.' },
    { id:'venue:silkroad', name:'Silk Road Bazaar', world:'silkroad', location:16, price:750, accent:'#bddea8', copy:'Caravan scenery, music and endless silk, tea and spices.' },
    { id:'venue:diner', name:'Midnight Diner', world:'diner', location:17, price:350, accent:'#ffa99c', new:true, copy:'Neon diner scenery, music and endless burgers, fries and shakes.' },
    { id:'venue:bakery', name:'Sunrise Bakery', world:'bakery', location:18, price:350, accent:'#ffe1a4', new:true, copy:'Warm bakery scenery, music and endless bread, cakes and pastries.' },
    { id:'venue:metro', name:'Metro Crossing', world:'metro', location:19, price:550, accent:'#99deff', new:true, copy:'City streets, metro music and endless urban supplies.' },
    { id:'venue:canal', name:'Canal Quarter', world:'canal', location:20, price:500, accent:'#a4e4cf', new:true, copy:'Canal markets, waterside music and endless flower and fruit deliveries.' },
    { id:'venue:skyguard', name:'Skyguard HQ', world:'skyguard', location:21, price:700, accent:'#ffc9a1', new:true, copy:'An original superhero base, soaring music and rescue equipment.' },
    { id:'venue:arena', name:'All-Star Arena', world:'arena', location:22, price:500, accent:'#b9e8a0', new:true, copy:'Multi-sport courts, tournament music and endless game-day gear.' },
    { id:'venue:build', name:'Big Build', world:'build', location:23, price:600, accent:'#ffd276', new:true, copy:'Cranes, worksite music and endless construction materials.' },
    { id:'venue:robot', name:'Robot Lab', world:'robot', location:24, price:750, accent:'#a9eee7', new:true, copy:'Robot workshop scenery, electronic music and technology components.' },
    { id:'venue:prism', name:'Prism Forge', world:'prism', location:25, price:650, accent:'#c7bfff', new:true, copy:'Crystal workshop scenery, prism music and colour-matched ring deliveries.' }
  ].map(item=>({...item,type:'venue'}));
  const styles = [
    { id:'wrap:classic', name:'Classic Wrap', style:'wrap', pattern:'classic', need:0, accent:'#e8c58a', copy:'The original parcel look.' },
    { id:'wrap:hero', name:'Hero Wrap', style:'wrap', pattern:'hero', price:120, accent:'#ffe17e', copy:'Comic corner marks and a little bat stamp.' },
    { id:'wrap:hologram', name:'Holo Wrap', style:'wrap', pattern:'hologram', price:180, accent:'#a5f4f0', copy:'A fine holographic grid around your cargo.' },
    { id:'wrap:candy', name:'Candy Wrap', style:'wrap', pattern:'candy', price:150, accent:'#ffc7ea', copy:'Sweet striped edges and a ribbon seal.' },
    { id:'wrap:stars', name:'Star Wrap', style:'wrap', pattern:'stars', price:220, accent:'#d9cbff', copy:'Tiny constellations for interstellar deliveries.' },
    { id:'zone:classic', name:'Classic Dock', style:'zone', pattern:'classic', need:0, accent:'#b8e6b7', copy:'Your original green loading zone.' },
    { id:'zone:neon', name:'Neon Dock', style:'zone', pattern:'neon', price:200, accent:'#9fe9f3', copy:'Cyan side rails and tiny circuit lights.' },
    { id:'zone:stars', name:'Starlight Dock', style:'zone', pattern:'stars', price:300, accent:'#ccb8ff', copy:'Violet rails with a scattering of little stars.' },
    { id:'zone:gold', name:'Golden Dock', style:'zone', pattern:'gold', price:450, accent:'#ffe097', copy:'Gold trim and a chequered perfect stripe.' },
    { id:'wrap:picnic', name:'Picnic Wrap', style:'wrap', pattern:'picnic', price:130, accent:'#ffd7b0', new:true, copy:'A gingham border for your restaurant deliveries.' },
    { id:'wrap:blueprint', name:'Blueprint Wrap', style:'wrap', pattern:'blueprint', price:170, accent:'#a7deff', new:true, copy:'Drafting lines and corner measurements around each parcel.' },
    { id:'wrap:prism', name:'Prism Wrap', style:'wrap', pattern:'prism', price:240, accent:'#d5c5ff', new:true, copy:'Four-colour crystal corners with a tiny gem seal.' },
    { id:'zone:hazard', name:'Builder Dock', style:'zone', pattern:'hazard', price:230, accent:'#ffd276', new:true, copy:'Amber safety stripes and a precise loading marker.' },
    { id:'zone:circuit', name:'Circuit Dock', style:'zone', pattern:'circuit', price:280, accent:'#a9eee7', new:true, copy:'Mint circuit traces with tiny component lights.' }
  ].map(item=>({...item,type:'style'}));
  const catalog=[...trucks,...venues,...styles], newItems=catalog.filter(item=>item.new), byId=new Map(catalog.map(item=>[item.id,item]));
  const integer = n => typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(MAX, Math.floor(n))) : 0;
  function readWallet(raw, profile = {}) {
    // Only an absent wallet receives the one-time welcome / returning-player gift.
    if (raw === null || raw === undefined) {
      const gift = 100 + Math.min(3000, integer(profile.totalDelivered) * 2 + integer(profile.totalPerfect) + integer(profile.totalTrucks) * 8 + integer(profile.totalGoals) * 15);
      return { version:1, coins:gift, earned:gift, spent:0, owned:[] };
    }
    let saved;
    try { saved = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (_) {}
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
    const coins=integer(saved.coins),spent=integer(saved.spent);
    return { version:1, coins, earned:Math.max(coins,integer(saved.earned)), spent,
      owned:[...new Set(Array.isArray(saved.owned) ? saved.owned.filter(id => byId.get(id)?.price) : [])] };
  }
  function isOwned(wallet, truck, profile = {}) {
    return !!truck && (truck.price ? wallet.owned.includes(truck.id) : integer(profile.totalDelivered) >= truck.need);
  }
  function purchase(wallet, id, profile = {}) {
    const truck=byId.get(id);
    if(!truck)return {wallet,ok:false,reason:'unknown'};
    if(isOwned(wallet,truck,profile))return {wallet,ok:true,reason:'owned'};
    if(!truck.price)return {wallet,ok:false,reason:'deliveries'};
    if(wallet.coins<truck.price)return {wallet,ok:false,reason:'coins',missing:truck.price-wallet.coins};
    return {ok:true,reason:'bought',wallet:{...wallet,coins:wallet.coins-truck.price,spent:Math.min(MAX,wallet.spent+truck.price),owned:[...wallet.owned,truck.id]}};
  }
  function award(wallet, amount) {
    if(!Number.isInteger(amount) || amount<=0)return wallet;
    const gain=Math.min(amount,MAX-wallet.coins);
    return {...wallet,coins:wallet.coins+gain,earned:Math.min(MAX,wallet.earned+gain)};
  }
  function deliveryReward({perfect=false,special=false,practice=false}={}) {return practice?0:2+(perfect?1:0)+(special?1:0);}
  function missionReward(stage, stars, previousStars = 0) {
    if(!Number.isInteger(stage) || stage<0 || stage>7 || !Number.isInteger(stars) || stars<1 || stars>3)return 0;
    previousStars=Math.min(3,integer(previousStars));
    return 20+stage*10+(previousStars===0?50+stage*25:0)+Math.max(0,stars-previousStars)*15;
  }
  function ownedLocations(wallet,profile={}) {return venues.filter(v=>isOwned(wallet,v,profile)).map(v=>v.location);}
  function arcadeLocation(wallet,location,shift=1,rotate=false,profile={}) {
    const locations=ownedLocations(wallet,profile),start=locations.indexOf(location),origin=start<0?0:start;
    return locations[(origin+(rotate?Math.floor((Math.max(1,integer(shift))-1)/2):0))%locations.length];
  }
  function equippedStyle(wallet,id,kind) {
    const item=byId.get(id);return item?.style===kind && isOwned(wallet,item)?item.id:`${kind}:classic`;
  }
  return {trucks,venues,styles,catalog,newItems,item:id=>byId.get(id),ownedLocations,arcadeLocation,equippedStyle,readWallet,isOwned,purchase,award,deliveryReward,missionReward,rewards:{truck:8,goal:15,shift:10}};
});
