/* Repeat on the audio clock, without media-element seeks or game-frame timers. */
(function (root) {
  'use strict';
  class LoopPool {
    constructor(context, limit = 1, fetcher = url => root.fetch(url)) {
      this.context = context;
      this.limit = limit;
      this.fetcher = fetcher;
      this.entries = new Map();
      this.decodeQueue = Promise.resolve();
      this.decodes = 0;
    }
    entry(url) {
      let entry = this.entries.get(url);
      if (entry) { this.entries.delete(url); this.entries.set(url, entry); return entry; }
      entry = {url, bytes: null, buffer: null, context: null, fetching: null, decoding: null};
      this.entries.set(url, entry);
      while (this.entries.size > this.limit) this.entries.delete(this.entries.keys().next().value);
      return entry;
    }
    async prime(url) {
      const entry = this.entry(url);
      if (!entry.bytes && !entry.buffer && !entry.fetching) {
        entry.fetching = this.fetcher(url).then(response => {
          if (!response.ok) throw new Error('Music download failed');
          return response.arrayBuffer();
        }).then(bytes => { entry.bytes = bytes; return entry; }).finally(() => { entry.fetching = null; });
      }
      if (entry.fetching) await entry.fetching;
      return entry;
    }
    async load(url, current) {
      const entry = await this.prime(url), context = this.context();
      if (!current()) throw new Error('Music selection changed');
      if (!context || context.state === 'closed') throw new Error('Audio context unavailable');
      if (entry.buffer) return entry.buffer;
      if (!entry.decoding) {
        // One decode at a time, even when a player browses mission themes quickly.
        entry.decoding = this.decodeQueue.catch(() => {}).then(async () => {
          if (!current()) throw new Error('Music selection changed');
          const bytes = entry.bytes;
          if (!bytes) throw new Error('Music data unavailable');
          const buffer = await context.decodeAudioData(bytes.slice(0));
          this.decodes++;
          if (!current()) throw new Error('Music selection changed');
          LoopPlayer.prepare(buffer);
          entry.buffer = buffer; entry.context = context; entry.bytes = null;
          return buffer;
        }).finally(() => { entry.decoding = null; });
        this.decodeQueue = entry.decoding.then(() => {}, () => {});
      }
      return entry.decoding;
    }
  }
  class LoopPlayer extends EventTarget {
    constructor(native, pool) {
      super();
      this.native = native; this.pool = pool;
      this._src = ''; this._volume = 1; this._muted = false; this._rate = 1;
      this.preload = 'none'; this.loop = true; this.preservesPitch = true;
      this.buffer = null; this.source = null; this.gain = null; this.context = null;
      this.offset = 0; this.startedAt = 0; this.generation = 0;
      this.fallback = false; this.loading = null; this.loaded = false;
      this.mixTarget = null; this.stateListener = null;
      for (const event of ['playing', 'pause', 'error']) native.addEventListener(event, () => {
        if (this.fallback) this.dispatchEvent(new Event(event));
      });
    }
    static prepare(buffer) {
      // MP3 reconstruction can leave a small sample jump at the splice. Smooth
      // only the last eight milliseconds; keep every beat and the full duration.
      const count = Math.min(Math.round(buffer.sampleRate * .008), Math.floor(buffer.length / 4));
      if (count < 2) return buffer;
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const data = buffer.getChannelData(channel), opening = data[0];
        for (let i = 0; i < count; i++) {
          const t = i / (count - 1);
          const at = data.length - count + i, blend = t * t * (3 - 2 * t);
          data[at] += (opening - data[at]) * blend;
        }
        // A fractional end position can make the resampler extrapolate one
        // sample at a later repeat. A flat two-sample edge avoids that click.
        data[data.length - 2] = data[data.length - 1] = opening;
      }
      return buffer;
    }
    get src() { return this._src; }
    set src(url) {
      this.pause(); this.generation++; this._src = url;
      this.buffer = null; this.offset = 0; this.loaded = false; this.loading = null;
      if (this.fallback) { this.fallback = false; this.native.removeAttribute('src'); }
    }
    get readyState() { return this.fallback ? this.native.readyState : this.buffer || this.loaded ? 4 : 0; }
    get error() { return this.fallback ? this.native.error : null; }
    get paused() { return this.fallback ? this.native.paused : !this.source || this.context.state !== 'running'; }
    get currentTime() {
      if (this.fallback) return this.native.currentTime;
      const elapsed = this.source ? Math.max(0, this.context.currentTime - this.startedAt) * this._rate : 0;
      return this.buffer ? (this.offset + elapsed) % this.buffer.duration : this.offset;
    }
    set currentTime(time) {
      if (!Number.isFinite(time) || time < 0) return;
      if (this.fallback) { this.native.currentTime = time; return; }
      const playing = !!this.source;
      this.pause(); this.offset = this.buffer ? time % this.buffer.duration : time;
      if (playing) this.play().catch(() => {});
    }
    get volume() { return this._volume; }
    set volume(value) { this._volume = Math.max(0, Math.min(1, value)); this.mix(); }
    get muted() { return this._muted; }
    set muted(value) { this._muted = !!value; this.mix(); }
    get playbackRate() { return this._rate; }
    set playbackRate(value) {
      // Keep the original pitch and tempo; a hot streak must not resample music.
      this._rate = 1;
      if (this.fallback && this.native.playbackRate !== 1) this.native.playbackRate = 1;
    }
    mix() {
      const volume = this._muted ? 0 : this._volume;
      if (this.gain && this.mixTarget !== volume) {
        this.mixTarget = volume;
        this.gain.gain.setTargetAtTime(volume, this.context.currentTime, .012);
      }
      if (this.fallback) {
        if (this.native.muted !== this._muted) this.native.muted = this._muted;
        try { if (this.native.volume !== this._volume) this.native.volume = this._volume; } catch (_) {}
      }
    }
    load() {
      const url = this._src;
      if (!url || this.preload === 'none') return;
      this.pool.prime(url).then(() => { if (url === this._src) this.loaded = true; }).catch(() => {});
    }
    stopSource() {
      const source = this.source;
      if (!source) return;
      this.offset = this.currentTime; this.source = null;
      source.onended = null;
      try { source.stop(); } catch (_) {}
      source.disconnect();
    }
    pause() {
      const wasPlaying = !!this.source || this.fallback && !this.native.paused;
      this.generation++;
      this.loading = null;
      this.stopSource();
      if (this.fallback) this.native.pause();
      if (wasPlaying && !this.fallback) this.dispatchEvent(new Event('pause'));
    }
    async nativePlay(generation) {
      if (generation !== this.generation) return;
      this.fallback = true;
      this.native.loop = true; this.native.preload = 'auto';
      if (this.native.getAttribute('src') !== this._src) this.native.src = this._src;
      try { this.native.currentTime = this.offset; } catch (_) {}
      this.mix();
      await this.native.play();
      if (generation !== this.generation) this.native.pause();
    }
    play() {
      if (this.fallback) return this.native.play();
      const context = this.pool.context();
      let resumed = Promise.resolve();
      // resume() is invoked in the original touch gesture, before any fetch.
      if (context && context.state !== 'running' && context.state !== 'closed') {
        try { resumed = context.resume(); } catch (error) { resumed = Promise.reject(error); }
      }
      // Fetch/decode may take longer than resume rejection; handle it now and
      // still propagate it through the eventual playback promise below.
      resumed.catch(() => {});
      if (this.source && this.context !== context) this.stopSource();
      if (this.source) {
        return resumed.then(() => {
          if (this.context.state !== 'running') throw new Error('Audio is interrupted');
          this.dispatchEvent(new Event('playing'));
        });
      }
      if (this.loading) return this.loading;
      const url = this._src, generation = this.generation;
      const current = () => generation === this.generation && url === this._src;
      const loading = this.pool.load(url, () => url === this._src).then(async buffer => {
        await resumed;
        if (!current()) return;
        const nextContext = this.pool.context();
        if (!nextContext || nextContext.state !== 'running') throw new Error('Audio is interrupted');
        if (this.context !== nextContext) {
          if (this.context && this.stateListener) this.context.removeEventListener('statechange', this.stateListener);
          this.context = nextContext;
          this.stateListener = () => { if (this.source) this.dispatchEvent(new Event(this.context.state === 'running' ? 'playing' : 'pause')); };
          this.context.addEventListener('statechange', this.stateListener);
        }
        this.buffer = buffer;
        if (!this.gain || this.gain.context !== this.context) {
          if (this.gain) this.gain.disconnect();
          this.gain = this.context.createGain(); this.gain.connect(this.context.destination);
        }
        this.gain.gain.value = this._muted ? 0 : this._volume;
        this.mixTarget = this.gain.gain.value;
        const source = this.context.createBufferSource();
        source.buffer = buffer; source.loop = true; source.loopStart = 0; source.loopEnd = buffer.duration;
        source.connect(this.gain);
        this.offset %= buffer.duration; this.startedAt = this.context.currentTime; this.source = source;
        source.start(this.startedAt, this.offset);
        this.dispatchEvent(new Event('playing'));
      }).catch(error => {
        if (!current()) return;
        // A rejected unlock needs another gesture, not an overlapping decoder.
        if (context && context.state !== 'running' && context.state !== 'closed') throw error;
        return this.nativePlay(generation);
      }).finally(() => { if (this.loading === loading) this.loading = null; });
      this.loading = loading;
      return loading;
    }
  }
  LoopPlayer.Pool = LoopPool;
  root.DockDashLoopPlayer = LoopPlayer;
  if (typeof module !== 'undefined' && module.exports) module.exports = LoopPlayer;
})(typeof window === 'undefined' ? globalThis : window);
