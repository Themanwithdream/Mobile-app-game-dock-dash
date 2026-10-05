/* Small, bounded caches and batched progress saves. No game-state copies. */
(function (root) {
  'use strict';
  class DockDashCache {
    constructor(limit = 96) { this.limit = limit; this.entries = new Map(); }
    get(key, build) {
      if (this.entries.has(key)) return this.entries.get(key);
      const value = build();
      if (this.entries.size >= this.limit) this.entries.delete(this.entries.keys().next().value);
      this.entries.set(key, value);
      return value;
    }
    clear() { this.entries.clear(); }
  }
  class DockDashProgress {
    constructor({storage, snapshots, schedule, cancel}) {
      this.storage = storage; this.snapshots = snapshots;
      this.schedule = schedule; this.cancel = cancel;
      this.dirty = new Set(); this.ticket = null;
    }
    mark(key) {
      this.dirty.add(key);
      if (this.ticket === null) this.ticket = this.schedule(() => { this.ticket = null; this.flush(); });
    }
    flush() {
      if (this.ticket !== null) { this.cancel(this.ticket); this.ticket = null; }
      for (const key of this.dirty) {
        try { this.storage.setItem(key, JSON.stringify(this.snapshots[key]())); this.dirty.delete(key); }
        catch (_) { /* Retry on the next delivery or lifecycle flush. */ }
      }
    }
  }
  class DockDashFrameBudget {
    constructor(scale = 2) { this.scale = scale; this.minimum = Math.min(scale,1.25); this.reset(); }
    reset() { this.last = null; this.since = null; this.frames = 0; this.slow = 0; this.cooldown = 0; }
    observe(now, active) {
      if(!active || !Number.isFinite(now)) { this.reset(); return false; }
      const gap=this.last===null?0:now-this.last;this.last=now;
      if(gap<0 || gap>250) { this.since=now;this.frames=this.slow=0;return false; }
      if(now<this.cooldown)return false;
      if(this.since===null){this.since=now;return false;}
      this.frames++;if(gap>20)this.slow++;
      if(now-this.since<2000)return false;
      const pressured=this.frames>=30 && this.slow/this.frames>.35 && this.scale>this.minimum;
      this.since=now;this.frames=this.slow=0;
      if(pressured){this.scale=Math.max(this.minimum,this.scale-.5);this.cooldown=now+3000;this.since=this.cooldown;return true;}
      return false;
    }
  }
  root.DockDashCache = DockDashCache;
  root.DockDashProgress = DockDashProgress;
  root.DockDashFrameBudget = DockDashFrameBudget;
  if (typeof module !== 'undefined' && module.exports) module.exports = {DockDashCache, DockDashProgress, DockDashFrameBudget};
})(typeof window === 'undefined' ? globalThis : window);
