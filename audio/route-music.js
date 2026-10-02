/* Dock Dash: two media players keep music independent of the game frame loop. */
(function (root) {
  'use strict';
  class DockDashSoundtrack {
    constructor(tracks, options = {}) {
      this.tracks = tracks;
      this.allowed = options.allowed || (() => true);
      this.onStatus = options.onStatus || (() => {});
      this.volume = .52;
      this.enabled = true;
      this.rate = 1;
      this.active = null;
      this.pending = null;
      this.serial = 0;
      this.timer = null;
      this.blocked = false;
      this.slots = [0, 1].map(() => {
        const player = document.createElement('audio');
        player.loop = true;
        player.preload = 'none';
        player.setAttribute('playsinline', '');
        player.setAttribute('aria-hidden', 'true');
        document.body.appendChild(player);
        const slot = {player, track: -1, weight: 0, intentionalPause: false};
        player.addEventListener('playing', () => {
          if (!this.canPlay()) { this.pause(); return; }
          if (slot === this.active) { this.blocked = false; this.notify(); }
        });
        player.addEventListener('pause', () => {
          const intentional = slot.intentionalPause;
          slot.intentionalPause = false;
          if (player.paused && slot === this.active && !intentional && !this.pending && this.canPlay()) this.blocked = true;
          this.notify();
        });
        player.addEventListener('error', () => {
          if (slot === this.active || (this.pending && this.pending.slot === slot)) {
            this.blocked = true;
            this.notify();
          }
        });
        return slot;
      });
      // iPhone Safari may ignore per-element volume. Never overlap songs there.
      const probe = this.slots[0].player;
      this.canFade = false;
      try { probe.volume = .314; this.canFade = Math.abs(probe.volume - .314) < .001; } catch (_) {}
      this.applyMix();
    }
    canPlay() { return this.enabled && this.volume > 0 && this.allowed(); }
    notify() {
      this.onStatus({live: this.slots.some(s => !s.player.paused), blocked: this.blocked, track: this.active ? this.active.track : -1});
    }
    silence(slot) {
      if (!slot.player.paused) slot.intentionalPause = true;
      slot.player.pause();
    }
    cancelFade() {
      if (this.timer !== null) clearInterval(this.timer);
      this.timer = null;
    }
    applyMix() {
      for (const slot of this.slots) {
        slot.player.muted = !this.enabled || this.volume === 0;
        if (this.canFade) slot.player.volume = Math.max(0, Math.min(1, this.volume * slot.weight));
      }
    }
    setMix(volume, enabled) {
      this.volume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0;
      this.enabled = !!enabled;
      this.applyMix();
      if (!this.canPlay()) this.pause();
    }
    setRate(rate) {
      this.rate = Number.isFinite(rate) ? Math.max(.8, Math.min(1.2, rate)) : 1;
      for (const {player} of this.slots) {
        player.preservesPitch = true;
        if ('webkitPreservesPitch' in player) player.webkitPreservesPitch = true;
        if (player.playbackRate !== this.rate) player.playbackRate = this.rate;
      }
    }
    pause() {
      if (!this.pending && this.timer === null && this.slots.every(s => s.player.paused)) return;
      this.serial++;
      this.pending = null;
      this.cancelFade();
      for (const slot of this.slots) {
        this.silence(slot);
        slot.weight = slot === this.active ? 1 : 0;
      }
      this.blocked = false;
      this.applyMix();
      this.notify();
    }
    fadeTo(target, previous) {
      this.cancelFade();
      if (!this.canFade) {
        for (const slot of this.slots) {
          slot.weight = slot === target ? 1 : 0;
          if (slot !== target) this.silence(slot);
        }
        this.applyMix();
        return;
      }
      const initial = this.slots.map(s => s.weight);
      const start = performance.now();
      const duration = previous && previous !== target && !previous.player.paused ? 650 : 240;
      const step = () => {
        if (!this.canPlay()) { this.pause(); return; }
        const t = Math.min(1, (performance.now() - start) / duration);
        this.slots.forEach((slot, i) => {
          slot.weight = slot === target ? initial[i] + (1 - initial[i]) * Math.sin(t * Math.PI / 2) : initial[i] * Math.cos(t * Math.PI / 2);
        });
        this.applyMix();
        if (t >= 1) {
          this.cancelFade();
          for (const slot of this.slots) if (slot !== target) { slot.weight = 0; this.silence(slot); }
          this.applyMix();
          this.notify();
        }
      };
      this.timer = setInterval(step, 20);
      step();
    }
    play(track) {
      if (!Number.isInteger(track) || !this.tracks[track] || !this.canPlay()) return;
      if (this.pending && this.pending.track === track) return;
      if (this.active && this.active.track === track && !this.active.player.paused && !this.active.player.error && !this.pending) return;
      this.cancelFade();
      const previous = this.active;
      const target = !this.canFade ? previous || this.slots[0] : previous && previous.track === track ? previous : this.slots.find(s => s !== previous);
      // Reuse at most two elements, even during very rapid route changes.
      if (target !== previous || target.player.error) this.silence(target);
      if (target.track !== track || target.player.error) {
        this.silence(target);
        target.track = track;
        target.player.src = this.tracks[track];
        target.player.preload = 'auto';
      }
      target.weight = 0;
      target.player.playbackRate = this.rate;
      this.applyMix();
      const token = ++this.serial;
      this.pending = {slot: target, track, token};
      const started = () => {
        if (token !== this.serial) {
          if (!this.canPlay() || (target !== this.active && (!this.pending || this.pending.slot !== target))) this.silence(target);
          return;
        }
        this.pending = null;
        if (!this.canPlay()) { this.pause(); return; }
        this.active = target;
        this.blocked = false;
        this.fadeTo(target, previous);
        this.notify();
      };
      const failed = () => {
        if (token !== this.serial) return;
        this.pending = null;
        this.silence(target);
        this.blocked = this.canPlay();
        if (previous) { previous.weight = 1; this.applyMix(); }
        this.notify();
      };
      // Synchronous play() preserves the original touch/keyboard activation.
      try {
        const result = target.player.play();
        if (result && typeof result.then === 'function') result.then(started, failed);
        else started();
      } catch (_) { failed(); }
    }
  }
  root.DockDashSoundtrack = DockDashSoundtrack;
  if (typeof module !== 'undefined' && module.exports) module.exports = DockDashSoundtrack;
})(typeof window === 'undefined' ? globalThis : window);
