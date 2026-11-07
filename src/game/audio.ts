import { Timeline } from '../types/game';

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private isMuted: boolean = false;
  private musicVolume: number = 0.45;
  private sfxVolume: number = 0.7;

  private currentTimeline: Timeline = 'PRESENT';
  private musicTimer: number | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private chordIndex: number = 0;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);

      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(this.currentTimeline === 'PAST' ? 2400 : 900, this.ctx.currentTime);

      this.musicGain.connect(this.ambientFilter);
      this.ambientFilter.connect(this.masterGain);

      this.masterGain.connect(this.ctx.destination);
      this.startMusicLoop();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setTimeline(timeline: Timeline) {
    this.currentTimeline = timeline;
    if (this.ctx && this.ambientFilter) {
      const now = this.ctx.currentTime;
      // In PAST, music is warm, bright, rich. In PRESENT, music is filtered, distant, eerie
      const targetFreq = timeline === 'PAST' ? 2600 : 700;
      this.ambientFilter.frequency.exponentialRampToValueAtTime(Math.max(100, targetFreq), now + 1.2);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  // --- SOUND EFFECTS ---

  public playFootstep() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Wood floor thud
    const baseFreq = this.currentTimeline === 'PAST' ? 140 : 110;
    osc.frequency.setValueAtTime(baseFreq + (Math.random() * 20 - 10), now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playJump() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.16);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playLand() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playTimelineWarp(toTimeline: Timeline) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Dual oscillator sweep: low rumble + high shimmer
    const oscLow = this.ctx.createOscillator();
    const oscHigh = this.ctx.createOscillator();
    const warpGain = this.ctx.createGain();

    oscLow.type = 'sawtooth';
    oscHigh.type = 'sine';

    if (toTimeline === 'PAST') {
      // Ascending, warm shimmer
      oscLow.frequency.setValueAtTime(80, now);
      oscLow.frequency.exponentialRampToValueAtTime(260, now + 0.5);
      oscHigh.frequency.setValueAtTime(350, now);
      oscHigh.frequency.exponentialRampToValueAtTime(880, now + 0.5);
    } else {
      // Descending, melancholy resonance
      oscLow.frequency.setValueAtTime(220, now);
      oscLow.frequency.exponentialRampToValueAtTime(60, now + 0.5);
      oscHigh.frequency.setValueAtTime(700, now);
      oscHigh.frequency.exponentialRampToValueAtTime(220, now + 0.5);
    }

    warpGain.gain.setValueAtTime(0.01, now);
    warpGain.gain.linearRampToValueAtTime(0.28 * this.sfxVolume, now + 0.15);
    warpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    oscLow.connect(warpGain);
    oscHigh.connect(warpGain);
    warpGain.connect(this.sfxGain);

    oscLow.start(now);
    oscHigh.start(now);
    oscLow.stop(now + 0.55);
    oscHigh.stop(now + 0.55);
  }

  public playClockTick(isTock: boolean = false) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isTock ? 620 : 880, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playClockWind() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    for (let i = 0; i < 4; i++) {
      const clickTime = now + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(400 + i * 80, clickTime);
      gain.gain.setValueAtTime(0.08 * this.sfxVolume, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(clickTime);
      osc.stop(clickTime + 0.04);
    }
  }

  public playSwitchFlip() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.06);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playChimeSuccess() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Harmonic arpeggio (E4, G4, B4, E5)
    const notes = [329.63, 392.00, 493.88, 659.25];
    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.12;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.22 * this.sfxVolume, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.8);
    });
  }

  public playDoorUnlock() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Heavy iron bolt click & groan
    const oscBolt = this.ctx.createOscillator();
    const gainBolt = this.ctx.createGain();

    oscBolt.type = 'sawtooth';
    oscBolt.frequency.setValueAtTime(90, now);
    oscBolt.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    gainBolt.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gainBolt.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    oscBolt.connect(gainBolt);
    gainBolt.connect(this.sfxGain);

    oscBolt.start(now);
    oscBolt.stop(now + 0.35);
  }

  // --- AMBIENT MUSIC ENGINE ---
  private startMusicLoop() {
    if (this.musicTimer) clearInterval(this.musicTimer);

    // Warm chord progression in C/Am
    const pastChords = [
      [261.63, 329.63, 392.00], // C major (C4, E4, G4)
      [220.00, 261.63, 329.63], // A minor (A3, C4, E4)
      [174.61, 220.00, 261.63], // F major (F3, A3, C4)
      [196.00, 246.94, 293.66], // G major (G3, B3, D4)
    ];

    const presentChords = [
      [110.00, 164.81, 220.00], // Low A drone
      [130.81, 196.00, 261.63], // C minor/flat
      [98.00, 146.83, 196.00],  // Low G
      [87.31, 130.81, 174.61],  // Low F
    ];

    const playNextBeat = () => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      const isPast = this.currentTimeline === 'PAST';
      const chords = isPast ? pastChords : presentChords;
      const currentChord = chords[this.chordIndex % chords.length];
      this.chordIndex++;

      // Play soft arpeggiated piano note or ambient tone
      currentChord.forEach((freq, idx) => {
        const noteTime = now + idx * 0.45;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = isPast ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        const duration = isPast ? 1.4 : 2.5;
        const noteVol = (isPast ? 0.045 : 0.035) * this.musicVolume;

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(noteVol, noteTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + duration);

        osc.connect(gain);
        gain.connect(this.musicGain!);

        osc.start(noteTime);
        osc.stop(noteTime + duration);
      });
    };

    // Trigger every 2.4s
    this.musicTimer = window.setInterval(playNextBeat, 2400);
  }

  public playPuzzleNote(index:number) {
    this.init();if(!this.ctx||!this.sfxGain)return;
    const frequencies=[261.63,293.66,329.63,349.23,392,523.25];
    const now=this.ctx.currentTime;const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();
    osc.type='sine';osc.frequency.value=frequencies[index]??261.63;
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.35,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.8);
    osc.connect(gain);gain.connect(this.sfxGain);osc.start(now);osc.stop(now+.85);
  }

  public destroy() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const soundManager = new SoundManager();
