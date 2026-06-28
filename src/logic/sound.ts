class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && this.enabled) {
      try {
        this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch (e) {
        console.warn("Web Audio API not supported", e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  playHit() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Quick pitch drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playEnemyHit() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playHeal() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Arpeggio slide up
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + index * 0.06 + 0.1);
      
      gain.gain.setValueAtTime(0.15, now + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.06 + 0.15);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(now + index * 0.06);
      osc.stop(now + index * 0.06 + 0.15);
    });
  }

  playLevelUp() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Rich triumph sound
    const chords = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major pentatonic
    chords.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + index * 0.08 + 0.4);
      
      gain.gain.setValueAtTime(0.2, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + index * 0.08 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.5);
    });
  }

  playStairs() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Descending/ascending warp sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.2);
    osc.frequency.linearRampToValueAtTime(800, now + 0.4);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.4);
  }

  playFireball() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Exploding noise
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + 0.4);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.4);
  }

  playDeath() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.8);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.8);
  }

  playGold() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // High pitch chime
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.53, now); // B6
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  }

  playTyping() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Slightly randomize pitch for a retro chirping sound
    const pitch = 700 + Math.random() * 150;
    osc.frequency.setValueAtTime(pitch, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  playFanfare() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Classic RPG arpeggio fanfare: C4 -> G4 -> C5 -> E5 -> G5 -> C6
    const notes = [
      { freq: 261.63, duration: 0.12, time: 0.0 },
      { freq: 392.00, duration: 0.12, time: 0.12 },
      { freq: 523.25, duration: 0.12, time: 0.24 },
      { freq: 659.25, duration: 0.16, time: 0.36 },
      { freq: 783.99, duration: 0.16, time: 0.52 },
      { freq: 1046.50, duration: 0.5, time: 0.68 }
    ];

    notes.forEach(note => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle'; // Warmer, brassy retro sound
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.12, now + note.time);
      gain.gain.linearRampToValueAtTime(0.12, now + note.time + note.duration - 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.duration);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.duration);
    });
  }
}

export const soundEffects = new SoundEffectsManager();
