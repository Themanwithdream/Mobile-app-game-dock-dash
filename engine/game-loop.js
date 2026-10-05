/* Fixed simulation steps and demand-driven canvas drawing. No browser timers. */
(function (root) {
  'use strict';
  class DockDashEngine {
    constructor({update, render, onStall = () => {}}) {
      this.update = update;
      this.render = render;
      this.onStall = onStall;
      this.step = 1 / 120;
      this.maxGap = .25;
      this.maxSteps = 30;
      this.reset();
    }
    reset() {
      this.lastTime = null;
      this.accumulator = 0;
      this.nextDraw = null;
      this.fps = null;
      this.dirty = true;
    }
    invalidate() { this.dirty = true; }
    advance(now, {fps = 60, frozen = false} = {}) {
      if (!Number.isFinite(now)) return {steps: 0, drawn: false, stalled: false};
      let elapsed = this.lastTime === null ? 0 : (now - this.lastTime) / 1000;
      if (elapsed < 0) { this.reset(); elapsed = 0; }
      this.lastTime = now;
      const stalled = elapsed > this.maxGap;
      if (stalled) {
        // A long freeze must not consume the player's lives or mission deadline.
        this.accumulator = 0;
        this.dirty = true;
        this.onStall();
      } else this.accumulator += elapsed;
      let steps = 0;
      while (!stalled && this.accumulator + 1e-9 >= this.step && steps < this.maxSteps) {
        this.accumulator = Math.max(0, this.accumulator - this.step);
        this.update(this.step);
        steps++;
      }
      const rate = Number.isFinite(fps) ? Math.max(15, Math.min(120, fps)) : 60;
      if (rate !== this.fps) { this.fps = rate; this.nextDraw = null; this.dirty = true; }
      const drawn = this.dirty || (!frozen && (this.nextDraw === null || now + .01 >= this.nextDraw));
      if (drawn) {
        const interval = 1000 / rate;
        if (this.dirty || this.nextDraw === null) this.nextDraw = now + interval;
        else this.nextDraw += (Math.floor(Math.max(0, now - this.nextDraw + .01) / interval) + 1) * interval;
        this.dirty = false;
        // Render the remaining fraction without advancing scores or deadlines.
        this.render(frozen || stalled ? 0 : Math.min(this.accumulator, this.step));
      }
      return {steps, drawn, stalled};
    }
  }
  root.DockDashEngine = DockDashEngine;
  if (typeof module !== 'undefined' && module.exports) module.exports = DockDashEngine;
})(typeof window === 'undefined' ? globalThis : window);
