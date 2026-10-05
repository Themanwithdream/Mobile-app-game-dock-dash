/* Earned currency and cosmetic trucks. Stable IDs keep old fleets compatible. */
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
    { id:'space', name:'Star Hauler', price:800, accent:'#c9bfff', emblem:'rocket', world:'space', copy:'The final frontier has four docks.' }
  ];
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
      owned:[...new Set(Array.isArray(saved.owned) ? saved.owned.filter(id => trucks.some(t => t.id === id && t.price)) : [])] };
  }
  function isOwned(wallet, truck, profile = {}) {
    return !!truck && (truck.price ? wallet.owned.includes(truck.id) : integer(profile.totalDelivered) >= truck.need);
  }
  function purchase(wallet, id, profile = {}) {
    const truck=trucks.find(t=>t.id===id);
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
    if(!Number.isInteger(stage) || stage<0 || stage>2 || !Number.isInteger(stars) || stars<1 || stars>3)return 0;
    previousStars=Math.min(3,integer(previousStars));
    return 20+stage*10+(previousStars===0?50+stage*25:0)+Math.max(0,stars-previousStars)*15;
  }
  return {trucks,readWallet,isOwned,purchase,award,deliveryReward,missionReward,rewards:{truck:8,goal:15,shift:10}};
});
