/**
 * AeroSync Audio Synthesizer Core
 * Procedural generative audio utilizing the Web Audio API:
 * 1. Pink/Brown noise generator for gentle rain & cloudbursts
 * 2. Bandpass sweeping noise for howling wind
 * 3. Deep resonant boom & rumble for thunderclaps
 * 4. Frequency-modulated synthesis for songbirds (fair weather)
 * 5. Low rumble white noise with whistle for blizzard/snow
 * 6. Interactive UI haptic sound cues (button clicks, mode changes)
 * 7. SpeechSynthesis integration for spoken verbal weather briefings
 */

class WeatherSoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.currentPreset = 'rain';
    this.volume = 0.4;

    // Active nodes holders
    this.activeNodes = [];
    this.thunderTimeout = null;
    this.birdTimeout = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  toggleMaster() {
    this.init();
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play(this.currentPreset);
      return true;
    }
  }

  play(presetName) {
    this.init();
    this.stopCurrentGenerators();
    this.currentPreset = presetName || this.currentPreset;
    this.isPlaying = true;

    switch (this.currentPreset) {
      case 'rain':
        this.startRainSynth();
        break;
      case 'thunder':
        this.startStormSynth();
        break;
      case 'wind':
        this.startWindSynth();
        break;
      case 'birds':
      case 'clear':
        this.startFairWeatherSynth();
        break;
      case 'snow':
        this.startSnowSynth();
        break;
      default:
        this.startRainSynth();
        break;
    }
  }

  stop() {
    this.stopCurrentGenerators();
    this.isPlaying = false;
  }

  stopCurrentGenerators() {
    if (this.thunderTimeout) clearTimeout(this.thunderTimeout);
    if (this.birdTimeout) clearTimeout(this.birdTimeout);

    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // Safe catch for already disconnected audio nodes
      }
    });
    this.activeNodes = [];
  }

  // Helper: Create Pink / Filtered noise buffer
  createNoiseBuffer(seconds = 3) {
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // 3dB/octave pinking filter
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // --- Rain Synthesizer ---
  startRainSynth() {
    const noiseBuffer = this.createNoiseBuffer(4);
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    // Filter to simulate raindrops pitter-patter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noiseSrc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSrc.start();
    this.activeNodes.push(noiseSrc, filter, gain);
  }

  // --- Storm Synth (Rain + Periodic Deep Thunder) ---
  startStormSynth() {
    this.startRainSynth();

    const triggerThunder = () => {
      if (!this.isPlaying) return;
      this.playThunderClap();
      // Next thunder in 6 to 14 seconds
      const nextDelay = 6000 + Math.random() * 8000;
      this.thunderTimeout = setTimeout(triggerThunder, nextDelay);
    };

    triggerThunder();
  }

  playThunderClap() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Deep sub-bass oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 2.5);

    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 3);

    // Rumble noise burst
    const noiseBuffer = this.createNoiseBuffer(3);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(70, now + 2.5);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 2.8);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 3);
  }

  // --- Wind Synthesizer (Dynamic Sweeping Bandpass) ---
  startWindSynth() {
    const noiseBuffer = this.createNoiseBuffer(5);
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3.5;
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    // LFO to slowly sweep wind howling pitch
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.25; // 0.25 Hz slow breath
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 220; // Sweep range

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    noiseSrc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    lfo.start();
    noiseSrc.start();
    this.activeNodes.push(noiseSrc, filter, gain, lfo, lfoGain);
  }

  // --- Snow / Blizzard Synthesizer ---
  startSnowSynth() {
    const noiseBuffer = this.createNoiseBuffer(4);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 520;
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.3;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.activeNodes.push(noise, filter, gain);
  }

  // --- Fair Weather (Breeze + Generative Bird Chirps) ---
  startFairWeatherSynth() {
    // Soft sunny breeze layer
    const noiseBuffer = this.createNoiseBuffer(4);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.15;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    this.activeNodes.push(noise, filter, gain);

    // Generative bird chirps
    const triggerBird = () => {
      if (!this.isPlaying) return;
      this.playBirdChirp();
      const delay = 2500 + Math.random() * 4500;
      this.birdTimeout = setTimeout(triggerBird, delay);
    };

    triggerBird();
  }

  playBirdChirp() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 2400 + Math.random() * 800;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, now + 0.16);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // UI Interactive Haptic Click Sound
  playClick() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Text-To-Speech Weather Broadcast
  speakBriefing(text) {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }
}

// Global instance
const weatherAudio = new WeatherSoundEngine();

