export class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private pannerNode: StereoPannerNode | null = null;
  private loudnessGainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private loudnessNormalizationEnabled = false;
  private isInitialized = false;

  // EQ Frequencies: 60Hz, 230Hz, 910Hz, 4000Hz, 14000Hz
  private static FREQUENCIES = [60, 230, 910, 4000, 14000];

  constructor() {
    // Lazy init on first play interaction
  }

  public init(audioEl: HTMLAudioElement) {
    if (this.isInitialized && this.audioElement === audioEl) return;
    this.audioElement = audioEl;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.ctx = new AudioCtxClass();
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Create 5-band Equalizer
      this.eqFilters = AudioEngine.FREQUENCIES.map((freq, index) => {
        const filter = this.ctx!.createBiquadFilter();
        if (index === 0) filter.type = 'lowshelf';
        else if (index === AudioEngine.FREQUENCIES.length - 1) filter.type = 'highshelf';
        else filter.type = 'peaking';

        filter.frequency.value = freq;
        filter.Q.value = 1.0;
        filter.gain.value = 0; // Default flat 0 dB
        return filter;
      });

      // Create Stereo Panner for 3D Audio effect
      if (this.ctx.createStereoPanner) {
        this.pannerNode = this.ctx.createStereoPanner();
        this.pannerNode.pan.value = 0;
      }

      // Create Gain Node and Dynamics Compressor Node for Loudness Normalization
      this.loudnessGainNode = this.ctx.createGain();
      this.loudnessGainNode.gain.value = this.loudnessNormalizationEnabled ? 0.85 : 1.0;

      this.compressorNode = this.ctx.createDynamicsCompressor();
      this.compressorNode.threshold.value = this.loudnessNormalizationEnabled ? -20 : 0;
      this.compressorNode.knee.value = 12;
      this.compressorNode.ratio.value = this.loudnessNormalizationEnabled ? 6 : 1;
      this.compressorNode.attack.value = 0.003;
      this.compressorNode.release.value = 0.25;

      // Connect source -> EQ filters in series -> Panner -> Loudness Gain -> Compressor -> Analyser -> Destination
      this.sourceNode = this.ctx.createMediaElementSource(audioEl);

      let lastNode: AudioNode = this.sourceNode;
      this.eqFilters.forEach((filter) => {
        lastNode.connect(filter);
        lastNode = filter;
      });

      if (this.pannerNode) {
        lastNode.connect(this.pannerNode);
        lastNode = this.pannerNode;
      }

      lastNode.connect(this.loudnessGainNode);
      this.loudnessGainNode.connect(this.compressorNode);
      this.compressorNode.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (err) {
      console.warn('Web Audio API setup warning:', err);
    }
  }

  public resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEQBandGain(bandIndex: number, gainDb: number) {
    if (this.eqFilters[bandIndex] && this.ctx) {
      this.eqFilters[bandIndex].gain.setTargetAtTime(gainDb, this.ctx.currentTime, 0.05);
    }
  }

  public setEQGains(gains: number[]) {
    gains.forEach((gain, idx) => this.setEQBandGain(idx, gain));
  }

  public setSpatialAudio(enabled: boolean) {
    if (!this.pannerNode || !this.ctx) return;
    if (enabled) {
      // Gentle subtle 3D spatial panning oscillation
      this.pannerNode.pan.setTargetAtTime(0.35, this.ctx.currentTime, 0.1);
    } else {
      this.pannerNode.pan.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  public setLoudnessNormalization(enabled: boolean) {
    this.loudnessNormalizationEnabled = enabled;

    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (enabled) {
        // Apply targeted Gain Node leveling and dynamic range compression to normalize perceived loudness
        if (this.loudnessGainNode) {
          this.loudnessGainNode.gain.setTargetAtTime(0.85, now, 0.05); // Attenuate peak spikes
        }
        if (this.compressorNode) {
          this.compressorNode.threshold.setTargetAtTime(-20, now, 0.05);
          this.compressorNode.ratio.setTargetAtTime(6, now, 0.05);
        }
      } else {
        // Restore unity gain pass-through
        if (this.loudnessGainNode) {
          this.loudnessGainNode.gain.setTargetAtTime(1.0, now, 0.05);
        }
        if (this.compressorNode) {
          this.compressorNode.threshold.setTargetAtTime(0, now, 0.05);
          this.compressorNode.ratio.setTargetAtTime(1, now, 0.05);
        }
      }
    }
  }

  public isLoudnessNormalizationEnabled(): boolean {
    return this.loudnessNormalizationEnabled;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(64).map(() => Math.floor(Math.random() * 40));
    }
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public getWaveformData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(64).fill(128);
    }
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  // Synthesizes a high quality lossless audio WAV Blob for demo tracks offline testing
  public static generateHighQualityAudioBlob(trackTitle: string, durationSec: number = 30): Blob {
    const sampleRate = 44100;
    const numChannels = 2;
    const numSamples = sampleRate * durationSec;
    const buffer = new Float32Array(numSamples * numChannels);

    // Generate warm harmonic progression (E minor / C Major ambient synth chord pad)
    const baseFreqs = [164.81, 196.00, 246.94, 329.63, 392.00]; // E3, G3, B3, E4, G4
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sampleL = 0;
      let sampleR = 0;

      // Chord modulation over time
      const chordIdx = Math.floor(t / 4) % 4;
      const pitchOffset = [0, 3, -2, 5][chordIdx];

      baseFreqs.forEach((freq, idx) => {
        const actualFreq = freq * Math.pow(2, pitchOffset / 12);
        // Soft sine wave with warm second harmonic
        const harmonic1 = Math.sin(2 * Math.PI * actualFreq * t);
        const harmonic2 = 0.3 * Math.sin(2 * Math.PI * actualFreq * 2 * t);
        // Low frequency lfo for breathing texture
        const lfo = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.2 * t + idx);

        const envelope = Math.min(1, t / 1.5) * Math.min(1, (durationSec - t) / 2);
        const val = (harmonic1 + harmonic2) * lfo * envelope * 0.15;

        sampleL += val * (1 - (idx * 0.1));
        sampleR += val * (1 - ((4 - idx) * 0.1));
      });

      buffer[i * 2] = Math.max(-1, Math.min(1, sampleL));
      buffer[i * 2 + 1] = Math.max(-1, Math.min(1, sampleR));
    }

    // Encode to WAV format
    const wavBuffer = AudioEngine.encodeWAV(buffer, numChannels, sampleRate);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  private static encodeWAV(samples: Float32Array, numChannels: number, sampleRate: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    /* RIFF identifier */
    this.writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    this.writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    this.writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw PCM) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * numChannels * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numChannels * 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    this.writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    // Float to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return buffer;
  }

  private static writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

export const audioEngine = new AudioEngine();
