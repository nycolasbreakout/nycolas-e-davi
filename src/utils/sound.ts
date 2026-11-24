class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0,
    freqEnd?: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, freqEnd),
        start + duration
      );
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  public playLogicSuccess() {
    this.playTone(523.25, 0.11, 'triangle', 0.11, 0);
    this.playTone(659.25, 0.11, 'triangle', 0.11, 0.06);
    this.playTone(783.99, 0.18, 'triangle', 0.12, 0.12);
  }

  public playLogicError() {
    this.playTone(170, 0.16, 'sawtooth', 0.09, 0, 120);
    this.playTone(135, 0.2, 'sawtooth', 0.08, 0.11, 95);
  }

  public playCardSpawn(cost: number) {
    const base = Math.max(150, 340 - cost * 28);
    this.playTone(base, 0.12, 'triangle', 0.11, 0, base * 1.45);
  }

  public playFireball() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Low boom + noise crackle
    this.playTone(140, 0.34, 'sawtooth', 0.13, 0, 42);

    const bufferSize = Math.floor(ctx.sampleRate * 0.28);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.28);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  public playHit(heavy = false) {
    if (heavy) {
      this.playTone(130, 0.09, 'square', 0.055, 0, 65);
    } else {
      this.playTone(320, 0.05, 'triangle', 0.035, 0, 180);
    }
  }

  public playTowerDestroyed() {
    this.playTone(196, 0.28, 'sawtooth', 0.12, 0, 72);
    this.playTone(146.8, 0.38, 'triangle', 0.14, 0.08, 55);
  }

  public playDoubleElixir() {
    this.playTone(587.33, 0.1, 'triangle', 0.11, 0);
    this.playTone(880, 0.18, 'triangle', 0.12, 0.08);
    this.playTone(1174.66, 0.24, 'triangle', 0.12, 0.16);
  }

  public playMatchEnd(win: boolean) {
    if (win) {
      this.playTone(523.25, 0.14, 'triangle', 0.13, 0);
      this.playTone(659.25, 0.14, 'triangle', 0.13, 0.1);
      this.playTone(783.99, 0.14, 'triangle', 0.13, 0.2);
      this.playTone(1046.5, 0.36, 'triangle', 0.15, 0.3);
    } else {
      this.playTone(392, 0.18, 'sawtooth', 0.09, 0);
      this.playTone(349.23, 0.18, 'sawtooth', 0.09, 0.14);
      this.playTone(293.66, 0.35, 'sawtooth', 0.1, 0.28, 220);
    }
  }
}

export const soundEngine = new SoundEngine();
