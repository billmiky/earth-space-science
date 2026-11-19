// timer.js — Countdown timer with a soft chime. Calls back with (remainingSeconds, running, finished).

export class Timer {
  constructor(onTick) {
    this.onTick = onTick;
    this.remaining = 0;
    this.initial = 0;
    this.running = false;
    this.finished = false;
    this.handle = null;
    this.endAt = 0;
    this._emit();
  }

  set(seconds) {
    this.stop();
    this.initial = this.remaining = seconds;
    this.finished = false;
    this.start();
  }

  start() {
    if (this.remaining <= 0 || this.running) return;
    this.running = true;
    this.endAt = Date.now() + this.remaining * 1000;
    this.handle = setInterval(() => this._tick(), 250);
    this._emit();
  }

  stop() {
    this.running = false;
    clearInterval(this.handle);
    this.handle = null;
  }

  toggle() {
    if (this.running) { this.stop(); this._emit(); } else this.start();
  }

  reset() {
    this.stop();
    this.remaining = this.initial;
    this.finished = false;
    this._emit();
  }

  _tick() {
    this.remaining = Math.max(0, (this.endAt - Date.now()) / 1000);
    if (this.remaining <= 0) {
      this.stop();
      this.finished = true;
      this._chime();
    }
    this._emit();
  }

  _emit() { this.onTick(this.remaining, this.running, this.finished); }

  _chime() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      [0, 0.25, 0.5].forEach((t) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = 660; g.gain.value = 0.08;
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.18);
      });
    } catch { /* audio is optional */ }
  }
}
