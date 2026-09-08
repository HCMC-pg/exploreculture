// Web Audio API Sound Synthesis Engine for Southern Heritage, Traditional Folk (Cải Lương, Đờn Ca Tài Tử), Speech Narration & FX
import { TraditionalSong } from '../data/traditionalMusic';

class HeritageAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlayingTraditional: boolean = false;
  private currentLoopTimer: any = null;
  private songPlaybackTimers: any[] = [];
  private ambientOscillators: { stop: () => void }[] = [];
  private isSpeaking: boolean = false;
  private currentSong: TraditionalSong | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopTraditionalMusic();
      this.stopSpeech();
      this.stopBackgroundAmbience();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // 1. UI Click
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // 2. Success Chord
  public playSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.08);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + index * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + index * 0.08);
      osc.stop(this.ctx.currentTime + index * 0.08 + 0.65);
    });
  }

  // 3. Error Buzz
  public playError() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // 4. Heritage Bell
  public playHeritageBell(deep: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const baseFreq = deep ? 220 : 440;
    const harmonics = [1, 2.01, 3.01, 4.2];

    harmonics.forEach((h, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * h, this.ctx.currentTime);

      const amp = 0.25 / (i + 1);
      gain.gain.setValueAtTime(amp, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.6);
    });
  }

  // 5. Cyclo Bell Chime
  public playCycloBell() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const chimeNotes = [1760, 2093];
    chimeNotes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 0.4);
    });
  }

  // 6. Song Lang Wooden Clapper
  public playSongLangBeat(delayOffset: number = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime + delayOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(920, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // 7. Đàn Tranh Pluck Note (Ngũ cung Nam Bộ)
  public playDanTranhNote(freq: number, startTimeOffset: number = 0, volume: number = 0.25) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTimeOffset);

    // Vibrato effect (nhấn rung phím đàn tranh)
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(5.5, this.ctx.currentTime + startTimeOffset);
    vibratoGain.gain.setValueAtTime(4.5, this.ctx.currentTime + startTimeOffset);
    vibrato.connect(osc.frequency);
    vibrato.start(this.ctx.currentTime + startTimeOffset);
    vibrato.stop(this.ctx.currentTime + startTimeOffset + 1.4);

    gain.gain.setValueAtTime(0, this.ctx.currentTime + startTimeOffset);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + startTimeOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTimeOffset + 1.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime + startTimeOffset);
    osc.stop(this.ctx.currentTime + startTimeOffset + 1.4);
  }

  // 8. Đàn Kìm / Guitar Phím Lõm Note (Chân mộc sâu lắng)
  public playDanKimNote(freq: number, startTimeOffset: number = 0, volume: number = 0.22) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTimeOffset);

    // Pitch bend / luyến láy
    osc.frequency.linearRampToValueAtTime(freq * 1.02, this.ctx.currentTime + startTimeOffset + 0.1);
    osc.frequency.linearRampToValueAtTime(freq, this.ctx.currentTime + startTimeOffset + 0.3);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime + startTimeOffset);

    gain.gain.setValueAtTime(0, this.ctx.currentTime + startTimeOffset);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + startTimeOffset + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTimeOffset + 1.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime + startTimeOffset);
    osc.stop(this.ctx.currentTime + startTimeOffset + 1.2);
  }

  // 9. Sáo Trúc / Flute Note
  public playSaoTrucNote(freq: number, startTimeOffset: number = 0, volume: number = 0.18) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTimeOffset);

    gain.gain.setValueAtTime(0, this.ctx.currentTime + startTimeOffset);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + startTimeOffset + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTimeOffset + 1.0);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime + startTimeOffset);
    osc.stop(this.ctx.currentTime + startTimeOffset + 1.1);
  }

  // 🌟 PLAY DEDICATED TRADITIONAL SONG FROM THE 10+ PLAYLIST
  public playSpecificSong(
    song: TraditionalSong,
    onNoteChange?: (noteIdx: number) => void,
    onFinished?: () => void
  ) {
    if (this.isMuted) return;
    this.stopTraditionalMusic();
    this.initContext();
    if (!this.ctx) return;

    this.isPlayingTraditional = true;
    this.currentSong = song;

    let accumulatedDelay = 0;
    const bpm = song.tempoBpm || 80;
    const timeScale = 60 / bpm;

    song.melodyNotes.forEach((item, index) => {
      const startTime = accumulatedDelay;
      
      // Timer for UI note animation
      const noteTimer = setTimeout(() => {
        if (this.isPlayingTraditional && onNoteChange) {
          onNoteChange(index);
        }
      }, startTime * 1000);
      this.songPlaybackTimers.push(noteTimer);

      // Play instrument note
      if (song.category === 'cai_luong') {
        this.playDanKimNote(item.freq, startTime, 0.24);
      } else if (song.category === 'dieu_ly') {
        this.playSaoTrucNote(item.freq, startTime, 0.20);
        this.playDanTranhNote(item.freq, startTime + 0.05, 0.16);
      } else {
        this.playDanTranhNote(item.freq, startTime, 0.25);
      }

      // Play Song Lang clapper if note has songLang flag
      if (item.songLang) {
        this.playSongLangBeat(startTime);
      }

      accumulatedDelay += item.dur * timeScale;
    });

    // End of song trigger / loop
    const endTimer = setTimeout(() => {
      if (this.isPlayingTraditional) {
        if (onFinished) {
          onFinished();
        } else {
          // Loop song seamlessly
          this.playSpecificSong(song, onNoteChange, onFinished);
        }
      }
    }, (accumulatedDelay + 1.0) * 1000);
    this.songPlaybackTimers.push(endTimer);
  }

  // 10. Traditional Southern Pentatonic Melody Loop
  public playTraditionalMelody() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const pentatonicScale = [293.66, 329.63, 392.00, 440.00, 493.88, 587.33];
    const melodySeq = [
      { noteIdx: 0, delay: 0.0 },
      { noteIdx: 2, delay: 0.35 },
      { noteIdx: 3, delay: 0.7 },
      { noteIdx: 4, delay: 1.1 },
      { noteIdx: 5, delay: 1.5 },
      { noteIdx: 3, delay: 2.0 },
      { noteIdx: 2, delay: 2.4 },
      { noteIdx: 0, delay: 2.9 },
    ];

    melodySeq.forEach((step) => {
      this.playDanTranhNote(pentatonicScale[step.noteIdx], step.delay, 0.22);
      if (step.noteIdx === 0 || step.noteIdx === 4) {
        this.playSongLangBeat(step.delay);
      }
    });
  }

  public playCaiLuongSolo() {
    this.playDanKimNote(293.66, 0, 0.25);
    this.playSongLangBeat(0);
    this.playDanKimNote(392.00, 0.4, 0.22);
    this.playDanKimNote(440.00, 0.8, 0.22);
    this.playDanKimNote(493.88, 1.2, 0.28);
    this.playSongLangBeat(1.2);
  }

  // 11. Speech Synthesis for Landmark History Narration & Poetry Chanting
  public speakText(
    text: string, 
    onEnd?: () => void, 
    rate: number = 0.95, 
    pitch: number = 1.05
  ): boolean {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return false;
    }

    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return false;
    }

    this.stopSpeech();
    this.isSpeaking = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }

  public stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getIsPlayingTraditional(): boolean {
    return this.isPlayingTraditional;
  }

  public getCurrentSong(): TraditionalSong | null {
    return this.currentSong;
  }

  public stopTraditionalMusic() {
    this.isPlayingTraditional = false;
    this.currentSong = null;
    this.songPlaybackTimers.forEach(t => clearTimeout(t));
    this.songPlaybackTimers = [];
    if (this.currentLoopTimer) {
      clearInterval(this.currentLoopTimer);
      this.currentLoopTimer = null;
    }
  }

  // Scratch card friction sound effect
  public playScratchCardSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 600, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      whiteNoise.start();
    } catch {}
  }

  // Mystery Chest / Gift Unboxing sound effect
  public playChestOpeningSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const chords = [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66]; // G4, B4, D5, G5, B5, D6
    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + idx * 0.06 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + idx * 0.06);
      osc.stop(this.ctx.currentTime + idx * 0.06 + 0.85);
    });

    // Shimmer sparkle
    setTimeout(() => {
      this.playDanTranhNote(880, 0.9);
      setTimeout(() => this.playDanTranhNote(1174.66, 0.9), 100);
      setTimeout(() => this.playDanTranhNote(1567.98, 1.2), 200);
    }, 380);
  }

  public playVoucherUnlockedSound() {
    if (this.isMuted) return;
    this.playSuccess();
    setTimeout(() => {
      this.playCycloBell();
    }, 250);
  }

  public stopBackgroundAmbience() {
    this.ambientOscillators.forEach(item => {
      try {
        item.stop();
      } catch {}
    });
    this.ambientOscillators = [];
  }

  public playBackgroundAmbience(ambientType: string = 'market_bustle', _volume: number = 0.5) {
    if (this.isMuted) return;
    this.stopBackgroundAmbience();
    this.triggerLandmarkSound(ambientType);
  }

  // 12. Buddhist Temple Gong (Đại Hồng Chung & Mõ)
  public playTempleGong(deep: boolean = true) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const base = deep ? 110.0 : 164.81; // A2 or E3
    const overtones = [1.0, 2.02, 2.76, 4.07, 5.43];
    const decay = deep ? 5.5 : 4.0;

    overtones.forEach((multiplier, index) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(base * multiplier, this.ctx.currentTime);

      const amp = (0.22 / (index + 1));
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(amp, this.ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + decay);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + decay + 0.1);
      this.ambientOscillators.push(osc);
    });

    // Gentle hollow wood fish tap (Mõ)
    setTimeout(() => {
      this.playWoodenFish();
    }, 600);
  }

  // 13. Wooden Fish (Tiếng Mõ Chùa)
  public playWoodenFish() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(280, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  // 14. Water Wave & River Splash
  public playWaterWaveSound(volume: number = 0.4) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      // Noise buffer for realistic water wave surf
      const bufferSize = this.ctx.sampleRate * 2.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * white)) / 1.02; // Pink-brown noise filter
        data[i] = lastOut * 3.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 1.2);
      filter.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 2.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18 * volume, this.ctx.currentTime + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
      noise.stop(this.ctx.currentTime + 2.6);
      this.ambientOscillators.push(noise);
    } catch {}
  }

  // 15. Subterranean Wind Drone (Địa Đạo Củ Chi)
  public playSubterraneanDrone(volume: number = 0.4) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(73.42, this.ctx.currentTime); // D2
    osc.frequency.linearRampToValueAtTime(65.41, this.ctx.currentTime + 2.0);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15 * volume, this.ctx.currentTime + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 3.3);
    this.ambientOscillators.push(osc);

    // Distant heroic brass tone
    setTimeout(() => {
      this.playDanTranhNote(293.66, 0.8); // D4
    }, 450);
  }

  public playLocationHistoricalSoundscape(ambientType: string, volume: number = 0.45) {
    if (this.isMuted) return;
    this.stopBackgroundAmbience();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      if (ambientType === 'temple_bell' || ambientType === 'pagoda') {
        // Chùa Hội Khánh, Thích Ca Phật Đài: Đại Hồng Chung & Mõ
        this.playTempleGong(true);
        setTimeout(() => this.playWoodenFish(), 1400);
        setTimeout(() => this.playWoodenFish(), 2100);
      } else if (ambientType === 'church_bell') {
        // Nhà Thờ Đức Bà, Bưu Điện: Chuông hòa âm phương Tây
        this.playHeritageBell(false);
        const baseFreqs = [130.81, 196.00, 261.63, 329.63];
        baseFreqs.forEach(freq => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.04 * volume, this.ctx.currentTime + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 4.5);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start();
          osc.stop(this.ctx.currentTime + 4.6);
          this.ambientOscillators.push(osc);
        });
      } else if (ambientType === 'river_wave' || ambientType === 'sea_waves') {
        // Bến Nhà Rồng, Hồ Dầu Tiếng, Bãi Sau, Côn Đảo: Sóng nước và còi tàu vang
        this.playWaterWaveSound(volume);
        this.playHeritageBell(true);
        setTimeout(() => this.playWaterWaveSound(volume * 0.8), 1200);
      } else if (ambientType === 'market_bustle') {
        // Chợ Bến Thành, Chợ Thủ Dầu Một, Chợ Xóm Lưới: Chuông xích lô + gõ nhịp sầm uất
        this.playCycloBell();
        setTimeout(() => this.playSongLangBeat(), 280);
        setTimeout(() => this.playCycloBell(), 650);
        setTimeout(() => this.playDanTranhNote(659.25, 0.7), 900);
      } else if (ambientType === 'street_chime' || ambientType === 'book_street') {
        // Phố Đi Bộ, Đường Sách, Thành Phố Mới: Chuông gió tao nhã
        this.playDanTranhNote(523.25, 0.8);
        setTimeout(() => this.playDanTranhNote(659.25, 0.8), 220);
        setTimeout(() => this.playDanTranhNote(783.99, 0.9), 440);
        setTimeout(() => this.playDanTranhNote(1046.50, 1.2), 700);
      } else if (ambientType === 'forest_wind' || ambientType === 'tunnels') {
        // Địa Đạo Củ Chi, Rừng Di Tích: Tiếng gió trầm & bước chân
        this.playSubterraneanDrone(volume);
        setTimeout(() => this.playSongLangBeat(), 500);
        setTimeout(() => this.playSongLangBeat(), 1100);
      } else if (ambientType === 'pottery_kiln' || ambientType === 'craft_artisan') {
        // Làng Nghề Sơn Mài Tương Bình Hiệp, Gốm Sứ: Tiếng gõ mộc và cung đàn
        this.playSongLangBeat();
        setTimeout(() => this.playSongLangBeat(), 250);
        setTimeout(() => this.playDanTranhNote(440.0, 0.8), 500);
        setTimeout(() => this.playDanTranhNote(587.33, 0.9), 850);
      } else {
        // Mặc định: Giai điệu ngũ cung Nam Bộ
        this.playTraditionalMelody();
      }
    } catch {}
  }

  public speakVietnamese(text: string, rate: number = 0.95, pitch: number = 1.0, onEnd?: () => void) {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  }

  public playTravelStart() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  public playTravelArrive() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.playSuccess();
  }

  public triggerLandmarkSound(ambientType: string) {
    if (this.isMuted) return;

    switch (ambientType) {
      case 'church_bell':
        this.playHeritageBell(false);
        break;
      case 'market_bustle':
      case 'street_chime':
        this.playCycloBell();
        break;
      case 'river_wave':
      case 'sea_waves':
        this.playHeritageBell(true);
        break;
      case 'traditional_music':
      case 'cai_luong':
        this.playTraditionalMelody();
        break;
      case 'pottery_kiln':
        this.playSongLangBeat();
        break;
      default:
        this.playTraditionalMelody();
        break;
    }
  }
}

export const sound = new HeritageAudioEngine();
