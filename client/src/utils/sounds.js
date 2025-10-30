// 🎵 Enhanced Sound Manager สำหรับเกม Werewolf
// ออกแบบให้ไม่น่าเบื่อ ไม่ปวดหัว เล่นแล้วเพลิน

class SoundManager {
  constructor() {
    this.enabled = localStorage.getItem('soundEnabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('soundVolume') || '0.3');
    this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    this.musicVolume = parseFloat(localStorage.getItem('musicVolume') || '0.15');
    this.audioContext = null;
    this.currentMusic = null;
    this.currentMusicType = null;
    this.musicGainNode = null;
    this.musicOscillators = [];
    this.musicIntervals = []; // เก็บ intervals สำหรับหยุด
  }

  // เริ่มต้น Audio Context
  init() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('🎵 Audio Context initialized');
        
        // ⭐ Resume AudioContext เมื่อมี user interaction (แก้ warning)
        this.setupAutoResume();
      } catch (e) {
        console.warn('❌ Web Audio API not supported:', e);
      }
    }
  }

  // ⭐ ตั้งค่า Auto Resume เมื่อมี user gesture
  setupAutoResume() {
    const resumeContext = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('🎵 Audio Context resumed');
        });
      }
    };

    // เพิ่ม event listeners สำหรับ user interactions
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, resumeContext, { once: true });
    });
  }

  // ========================================
  // 🎵 ENHANCED SOUND EFFECTS
  // ========================================

  // 🌊 เสียงที่นุ่มนวล ไม่แหลมคม
  playTone(frequency, duration, type = 'sine', volume = this.volume, fadeOut = true) {
    if (!this.enabled || !this.audioContext) return;
    
    // ⭐ Resume context ถ้า suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter(); // เพิ่ม filter

    // เชื่อมต่อ: oscillator -> filter -> gain -> output
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    // ตั้งค่า filter (ลด treble ให้นุ่มนวล)
    filter.type = 'lowpass';
    filter.frequency.value = frequency * 2;
    filter.Q.value = 1;

    osc.type = type;
    osc.frequency.value = frequency;

    const now = this.audioContext.currentTime;
    
    // Smooth fade in
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    
    if (fadeOut) {
      gain.gain.linearRampToValueAtTime(volume * 0.3, now + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    }

    osc.start(now);
    osc.stop(now + duration);
  }

  // 🎹 Chord ที่ไพเราะขึ้น
  playChord(frequencies, duration, volume = this.volume, stagger = 0.03) {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, duration, 'sine', volume * (0.7 + index * 0.1));
      }, index * stagger * 1000);
    });
  }

  // ✨ Sparkle effect - เสียงวิบวับน่ารัก
  playSparkle(volume = this.volume) {
    if (!this.enabled || !this.audioContext) return;
    
    const notes = [783.99, 987.77, 1318.51]; // G5, B5, E6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', volume * 0.4);
      }, i * 50);
    });
  }

  // 🔔 Notification - เสียงแจ้งเตือนที่ไพเราะ
  playNotification(type = 'info') {
    const patterns = {
      info: [523.25, 659.25], // C5, E5
      success: [523.25, 659.25, 783.99], // C5, E5, G5
      warning: [587.33, 493.88], // D5, B4
      error: [392, 349.23] // G4, F4
    };
    
    const notes = patterns[type] || patterns.info;
    this.playChord(notes, 0.2, this.volume * 0.5, 0.05);
  }

  // ========================================
  // 🎮 GAME EVENT SOUNDS
  // ========================================

  playJoin() {
    this.playSparkle(this.volume * 0.6);
  }

  playLeave() {
    this.playChord([392, 349.23], 0.15, this.volume * 0.4);
  }

  playClick() {
    this.playTone(800, 0.08, 'sine', this.volume * 0.3);
  }

  playGameStart() {
    // Fanfare สั้นๆ
    const melody = [523.25, 659.25, 783.99, 1046.5];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', this.volume * 0.7);
      }, i * 80);
    });
  }

  // 🌙 กลางคืน - เสียงลึกลับแต่ไม่น่ากลัวเกินไป
  playNightStart() {
    this.playChord([220, 261.63, 329.63], 0.4, this.volume * 0.6, 0.08);
    // Wind sound effect (subtle)
    setTimeout(() => {
      this.playWindSound();
    }, 300);
  }

  // 🌬️ เสียงลม (นุ่มนวล)
  playWindSound() {
    if (!this.enabled || !this.audioContext) return;

    const noise = this.audioContext.createBufferSource();
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 2, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1; // Quiet noise
    }
    
    noise.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    const now = this.audioContext.currentTime;
    gain.gain.linearRampToValueAtTime(this.volume * 0.15, now + 0.5);
    gain.gain.linearRampToValueAtTime(0, now + 1.8);
    
    noise.start(now);
    noise.stop(now + 2);
  }

  // ☀️ กลางวัน - เสียงสดใสแต่ไม่จี้หู
  playDayStart() {
    this.playChord([523.25, 659.25, 783.99], 0.3, this.volume * 0.6, 0.06);
    // Bird chirp (simplified)
    setTimeout(() => {
      this.playBirdChirp();
    }, 250);
  }

  // 🐦 เสียงนกร้อง (นุ่มนวล)
  playBirdChirp() {
    const notes = [
      { freq: 1200, duration: 0.08 },
      { freq: 1400, duration: 0.06 },
      { freq: 1300, duration: 0.1 }
    ];
    
    let time = 0;
    notes.forEach(note => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration, 'sine', this.volume * 0.3);
      }, time * 1000);
      time += note.duration;
    });
  }

  playRoleAssigned() {
    this.playChord([392, 493.88, 587.33, 783.99], 0.35, this.volume * 0.7, 0.07);
  }

  playAction() {
    this.playTone(698.46, 0.12, 'sine', this.volume * 0.5);
  }

  playVote() {
    this.playChord([659.25, 783.99], 0.15, this.volume * 0.5);
  }

  // 💀 ตาย - dramatic แต่ไม่หนักหนาเกินไป
  playDeath() {
    if (!this.enabled || !this.audioContext) return;
    
    const notes = [440, 392, 349.23];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.25, 'triangle', this.volume * (0.6 - i * 0.15));
      }, i * 120);
    });
  }

  // 🎉 ชนะ
  playVictory() {
    const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 1046.5];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', this.volume * 0.6);
      }, i * 80);
    });
  }

  // 😢 แพ้
  playDefeat() {
    const melody = [392, 349.23, 293.66, 261.63];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.25, 'triangle', this.volume * 0.5);
      }, i * 150);
    });
  }

  playFoolWin() {
    // เสียงตลกๆ
    const notes = [523.25, 659.25, 523.25, 783.99];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.12, 'square', this.volume * 0.5);
      }, i * 100);
    });
  }

  // 🔮 Seer Result
  playSeerResult(isWerewolf) {
    if (isWerewolf) {
      this.playChord([220, 246.94, 277.18], 0.3, this.volume * 0.6);
    } else {
      this.playChord([523.25, 659.25, 783.99], 0.25, this.volume * 0.6);
    }
  }

  playLover() {
    this.playChord([659.25, 783.99, 987.77], 0.3, this.volume * 0.6);
  }

  playHunterShoot() {
    this.playTone(1200, 0.08, 'square', this.volume * 0.6);
    setTimeout(() => {
      this.playTone(200, 0.2, 'sawtooth', this.volume * 0.5);
    }, 80);
  }

  playMessage() {
    this.playTone(800, 0.06, 'sine', this.volume * 0.3);
  }

  playTimeWarning() {
    this.playTone(880, 0.12, 'sine', this.volume * 0.5);
  }

  playError() {
    this.playNotification('error');
  }

  playSuccess() {
    this.playNotification('success');
  }

  // เสียงหอน/ไก่ขัน (simplified)
  playWolfHowl() {
    if (!this.enabled || !this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    const now = this.audioContext.currentTime;
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.linearRampToValueAtTime(400, now + 0.6);
    osc.frequency.linearRampToValueAtTime(200, now + 1.2);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.3);
    gain.gain.linearRampToValueAtTime(0, now + 1.2);
    
    osc.start(now);
    osc.stop(now + 1.2);
  }

  playRooster() {
    const notes = [600, 750, 650, 850];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.1, 'square', this.volume * 0.4);
      }, i * 100);
    });
  }

  // ========================================
  // 🎵 ENHANCED BACKGROUND MUSIC
  // ========================================

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled.toString());
    
    if (this.enabled) {
      if (!this.audioContext) this.init();
      if (this.audioContext) this.playClick();
      if (this.musicEnabled && this.currentMusicType) {
        this.playMusic(this.currentMusicType);
      }
    } else {
      if (this.currentMusic) this.stopMusic();
    }
    
    return this.enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundVolume', this.volume.toString());
  }

  isEnabled() {
    return this.enabled;
  }

  getVolume() {
    return this.volume;
  }

  stopMusic() {
    // หยุด oscillators
    this.musicOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.musicOscillators = [];
    
    // หยุด intervals
    this.musicIntervals.forEach(interval => clearInterval(interval));
    this.musicIntervals = [];
    
    this.currentMusic = null;
  }

  playMusic(type) {
    this.currentMusicType = type;
    
    if (!this.musicEnabled) return;
    
    if (!this.audioContext) {
      this.init();
      if (!this.audioContext) return;
    }

    this.stopMusic();
    this.currentMusic = type;

    if (!this.musicGainNode) {
      this.musicGainNode = this.audioContext.createGain();
      this.musicGainNode.connect(this.audioContext.destination);
    }
    this.musicGainNode.gain.value = this.musicVolume;

    // เล่นดนตรีตามประเภท
    switch (type) {
      case 'home':
        this.playHomeMusic();
        break;
      case 'lobby':
        this.playLobbyMusic();
        break;
      case 'night':
        this.playNightMusic();
        break;
      case 'day':
        this.playDayMusic();
        break;
      case 'gameover-win':
        this.playGameOverMusic(true);
        break;
      case 'gameover-lose':
        this.playGameOverMusic(false);
        break;
    }
  }

  // 🏠 ดนตรีหน้าแรก - Ambient นุ่มนวล ผ่อนคลาย
  playHomeMusic() {
    // Ambient pad with variation
    const chordProgression = [
      [261.63, 329.63, 392.00], // C major
      [293.66, 369.99, 440.00], // D minor  
      [246.94, 311.13, 369.99], // B diminished
      [261.63, 329.63, 392.00]  // C major
    ];
    
    let currentChord = 0;
    
    const playChordLayer = () => {
      if (this.currentMusic !== 'home') return;
      
      const chord = chordProgression[currentChord];
      chord.forEach((freq, i) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq * 0.5; // ต่ำลงหน่อย
        gain.gain.value = 0;
        
        osc.connect(gain);
        gain.connect(this.musicGainNode);
        
        const now = this.audioContext.currentTime;
        gain.gain.linearRampToValueAtTime(0.015, now + 1);
        gain.gain.linearRampToValueAtTime(0, now + 7);
        
        osc.start(now);
        osc.stop(now + 8);
      });
      
      currentChord = (currentChord + 1) % chordProgression.length;
    };
    
    playChordLayer();
    const interval = setInterval(playChordLayer, 6000);
    this.musicIntervals.push(interval);
    
    // Gentle melody
    this.createGentleMelody([261.63, 293.66, 329.63, 293.66], 4);
  }

  // 🚪 ดนตรีห้องรอ - Upbeat แต่ไม่รบกวน
  playLobbyMusic() {
    // Arpeggiated pattern
    const pattern = [261.63, 329.63, 392.00, 523.25]; // C E G C
    let noteIndex = 0;
    
    const playArpeggio = () => {
      if (this.currentMusic !== 'lobby') return;
      
      const freq = pattern[noteIndex % pattern.length];
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      
      osc.connect(gain);
      gain.connect(this.musicGainNode);
      
      const now = this.audioContext.currentTime;
      gain.gain.linearRampToValueAtTime(0.02, now + 0.05);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.5);
      
      noteIndex++;
    };
    
    playArpeggio();
    const interval = setInterval(playArpeggio, 400);
    this.musicIntervals.push(interval);
  }

  // 🌙 ดนตรีกลางคืน - ลึกลับ บรรยากาศ แต่ไม่น่ากลัว
  playNightMusic() {
    // Dark ambient with movement
    const darkNotes = [
      [220, 261.63, 329.63], // A minor
      [207.65, 246.94, 311.13], // G# dim
      [220, 261.63, 329.63]
    ];
    
    let chordIndex = 0;
    
    const playDarkChord = () => {
      if (this.currentMusic !== 'night') return;
      
      const chord = darkNotes[chordIndex];
      chord.forEach(freq => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = freq * 0.5;
        gain.gain.value = 0;
        
        osc.connect(gain);
        gain.connect(this.musicGainNode);
        
        const now = this.audioContext.currentTime;
        gain.gain.linearRampToValueAtTime(0.02, now + 2);
        gain.gain.linearRampToValueAtTime(0, now + 9);
        
        osc.start(now);
        osc.stop(now + 10);
      });
      
      chordIndex = (chordIndex + 1) % darkNotes.length;
    };
    
    playDarkChord();
    const interval = setInterval(playDarkChord, 8000);
    this.musicIntervals.push(interval);
    
    // Mysterious melody
    this.createMysteryMelody([220, 233.08, 246.94, 233.08], 5);
  }

  // ☀️ ดนตรีกลางวัน - สดใส มีพลัง แต่ไม่รบกวน
  playDayMusic() {
    // Bright progression
    const brightPattern = [
      392.00, // G
      493.88, // B
      587.33, // D
      493.88  // B
    ];
    
    let noteIndex = 0;
    
    const playBrightNote = () => {
      if (this.currentMusic !== 'day') return;
      
      const freq = brightPattern[noteIndex % brightPattern.length];
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      
      osc.connect(gain);
      gain.connect(this.musicGainNode);
      
      const now = this.audioContext.currentTime;
      gain.gain.linearRampToValueAtTime(0.025, now + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 2);
      
      osc.start(now);
      osc.stop(now + 2.5);
      
      noteIndex++;
    };
    
    playBrightNote();
    const interval = setInterval(playBrightNote, 2000);
    this.musicIntervals.push(interval);
  }

  // 🏆 ดนตรีจบเกม
  playGameOverMusic(isVictory) {
    if (isVictory) {
      // Victory theme
      const victoryMelody = [523.25, 659.25, 783.99, 1046.5];
      victoryMelody.forEach((freq, i) => {
        setTimeout(() => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.value = 0;
          
          osc.connect(gain);
          gain.connect(this.musicGainNode);
          
          const now = this.audioContext.currentTime;
          gain.gain.linearRampToValueAtTime(0.04, now + 0.1);
          gain.gain.linearRampToValueAtTime(0, now + 1.5);
          
          osc.start(now);
          osc.stop(now + 2);
        }, i * 300);
      });
    } else {
      // Defeat theme
      const defeatMelody = [392, 349.23, 329.63, 293.66];
      defeatMelody.forEach((freq, i) => {
        setTimeout(() => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.value = 0;
          
          osc.connect(gain);
          gain.connect(this.musicGainNode);
          
          const now = this.audioContext.currentTime;
          gain.gain.linearRampToValueAtTime(0.03, now + 0.2);
          gain.gain.linearRampToValueAtTime(0, now + 2);
          
          osc.start(now);
          osc.stop(now + 2.5);
        }, i * 400);
      });
    }
  }

  // Helper: สร้าง melody ที่นุ่มนวล
  createGentleMelody(notes, interval) {
    let noteIndex = 0;
    
    const playNote = () => {
      if (!this.musicEnabled || this.currentMusic === null) return;
      
      const freq = notes[noteIndex % notes.length];
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      osc.connect(gain);
      gain.connect(this.musicGainNode);
      
      const now = this.audioContext.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.012, now + 0.3);
      gain.gain.linearRampToValueAtTime(0, now + interval - 0.5);
      
      osc.start(now);
      osc.stop(now + interval);
      
      noteIndex++;
    };
    
    playNote();
    const intervalId = setInterval(playNote, interval * 1000);
    this.musicIntervals.push(intervalId);
  }

  createMysteryMelody(notes, interval) {
    let noteIndex = 0;
    
    const playNote = () => {
      if (!this.musicEnabled || this.currentMusic === null) return;
      
      const freq = notes[noteIndex % notes.length];
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      osc.connect(gain);
      gain.connect(this.musicGainNode);
      
      const now = this.audioContext.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.015, now + 0.5);
      gain.gain.linearRampToValueAtTime(0, now + interval - 1);
      
      osc.start(now);
      osc.stop(now + interval);
      
      noteIndex++;
    };
    
    playNote();
    const intervalId = setInterval(playNote, interval * 1000);
    this.musicIntervals.push(intervalId);
  }

  // ควบคุมดนตรี
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    localStorage.setItem('musicEnabled', this.musicEnabled.toString());
    
    if (!this.musicEnabled) {
      this.stopMusic();
    } else {
      if (this.currentMusicType) {
        this.playMusic(this.currentMusicType);
      }
    }
    
    return this.musicEnabled;
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('musicVolume', this.musicVolume.toString());
    
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.musicVolume;
    }
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  getMusicVolume() {
    return this.musicVolume;
  }
}

export const soundManager = new SoundManager();
