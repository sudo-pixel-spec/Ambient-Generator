export class AudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  pannerNode: StereoPannerNode | null = null;
  focusFilter: BiquadFilterNode | null = null;
  analyserNode: AnalyserNode | null = null;
  activeTracks: {
    [env: string]: {
      nodes: AudioNode[];
      intervals: number[];
      envGain: GainNode;
      envPanner: StereoPannerNode;
    };
  } = {};

  constructor() {
    if (typeof window !== "undefined") {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;

      this.focusFilter = this.ctx.createBiquadFilter();
      this.focusFilter.type = "lowpass";
      this.focusFilter.frequency.value = 24000;

      this.pannerNode = this.ctx.createStereoPanner();
      this.pannerNode.pan.value = 0;

      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 256;

      this.masterGain.connect(this.focusFilter);
      this.focusFilter.connect(this.pannerNode);
      this.pannerNode.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);
    }
  }

  public init() {
    if (this.ctx?.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMuffled(muffled: boolean) {
      if (this.focusFilter && this.ctx) {
          const targetFreq = muffled ? 600 : 24000;
          this.focusFilter.frequency.exponentialRampToValueAtTime(targetFreq, this.ctx.currentTime + 2.0);
      }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
        this.masterGain.gain.linearRampToValueAtTime(Math.max(vol, 0.001), this.ctx.currentTime + 0.1);
    }
  }

  public setPan(panValue: number) {
      if (this.pannerNode && this.ctx) {
          this.pannerNode.pan.linearRampToValueAtTime(panValue, this.ctx.currentTime + 0.1);
      }
  }

  public setTrackVolume(env: string, vol: number) {
      const track = this.activeTracks[env];
      if (track && this.ctx) {
          track.envGain.gain.linearRampToValueAtTime(Math.max(vol, 0.001), this.ctx.currentTime + 0.1);
      }
  }

  public setTrackPan(env: string, panValue: number) {
      const track = this.activeTracks[env];
      if (track && this.ctx) {
          track.envPanner.pan.linearRampToValueAtTime(panValue, this.ctx.currentTime + 0.1);
      }
  }

  public playRain() {
    this.init();
    if (!this.ctx || !this.masterGain || this.activeTracks["Rain"]) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1000;

    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.5;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 200;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const envGain = this.ctx.createGain();
    envGain.gain.value = 0.001; 
    envGain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 2);

    const envPanner = this.ctx.createStereoPanner();
    envPanner.pan.value = 0;

    noiseSource.connect(filter);
    filter.connect(envGain);
    envGain.connect(envPanner);
    envPanner.connect(this.masterGain);

    noiseSource.start();
    lfo.start();

    this.activeTracks["Rain"] = {
      nodes: [noiseSource, filter, lfo, lfoGain],
      intervals: [],
      envGain,
      envPanner,
    };
  }

  public playWaves() {
    this.init();
    if (!this.ctx || !this.masterGain || this.activeTracks["Waves"]) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11;
        b6 = white * 0.115926;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;

    const waveGain = this.ctx.createGain();
    waveGain.gain.value = 0.001;

    const envGain = this.ctx.createGain();
    envGain.gain.value = 0.001;
    envGain.gain.linearRampToValueAtTime(0.6, this.ctx.currentTime + 2);

    const envPanner = this.ctx.createStereoPanner();
    envPanner.pan.value = 0;

    noiseSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(envGain);
    envGain.connect(envPanner);
    envPanner.connect(this.masterGain);

    noiseSource.start();

    waveGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    const swell = () => {
        if (!this.ctx || !this.activeTracks["Waves"]) return;
        const now = this.ctx.currentTime;
        waveGain.gain.cancelScheduledValues(now);
        waveGain.gain.setValueAtTime(waveGain.gain.value, now);
        waveGain.gain.linearRampToValueAtTime(1.0, now + 4);
        waveGain.gain.linearRampToValueAtTime(0.001, now + 8);
    };

    swell();
    const interval = window.setInterval(swell, 8000);

    this.activeTracks["Waves"] = {
      nodes: [noiseSource, filter, waveGain],
      intervals: [interval],
      envGain,
      envPanner,
    };
  }

  public playNightSky() {
    this.init();
    if (!this.ctx || !this.masterGain || this.activeTracks["Night Sky"]) return;

    const chords = [220, 277.18, 329.63, 440];
    const synths: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    const envGain = this.ctx.createGain();
    envGain.gain.value = 0.001;
    envGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 3);
    
    const envPanner = this.ctx.createStereoPanner();
    envPanner.pan.value = 0;

    chords.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const g = this.ctx!.createGain();
      g.gain.value = 0.1;

      const lfo = this.ctx!.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.05 + Math.random() * 0.05;
      const lfoAmp = this.ctx!.createGain();
      lfoAmp.gain.value = 0.08;
      
      lfo.connect(lfoAmp);
      lfoAmp.connect(g.gain);

      osc.connect(g);
      g.connect(envGain);

      osc.start();
      lfo.start();

      synths.push(osc, lfo);
      gains.push(g, lfoAmp);
    });

    envGain.connect(envPanner);
    envPanner.connect(this.masterGain);

    this.activeTracks["Night Sky"] = {
      nodes: [...synths, ...gains],
      intervals: [],
      envGain,
      envPanner,
    };
  }

  public playFireplace() {
    this.init();
    if (!this.ctx || !this.masterGain || this.activeTracks["Fireplace"]) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.value = 300;
    
    const envGain = this.ctx.createGain();
    envGain.gain.value = 0.001;
    envGain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 2);

    const envPanner = this.ctx.createStereoPanner();
    envPanner.pan.value = 0;

    noiseSource.connect(rumbleFilter);
    rumbleFilter.connect(envGain);
    envGain.connect(envPanner);
    envPanner.connect(this.masterGain);

    noiseSource.start();

    const trackNodes: AudioNode[] = [noiseSource, rumbleFilter];
    const trackIntervals: number[] = [];

    const crackle = () => {
        if (!this.ctx || !this.activeTracks["Fireplace"]) return;
        
        const osc = this.ctx.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(500 + Math.random() * 5000, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

        const hpFilter = this.ctx.createBiquadFilter();
        hpFilter.type = "highpass";
        hpFilter.frequency.value = 2000;

        const cGain = this.ctx.createGain();
        cGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        cGain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.01);
        cGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(hpFilter);
        hpFilter.connect(cGain);
        cGain.connect(envGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
        
        const nextTime = Math.random() * 1000 + 100;
        const t = window.setTimeout(crackle, nextTime);
        trackIntervals.push(t);
    };

    crackle();

    this.activeTracks["Fireplace"] = {
      nodes: trackNodes,
      intervals: trackIntervals,
      envGain,
      envPanner,
    };
  }

  public playDeepForest() {
      this.init();
      if (!this.ctx || !this.masterGain || this.activeTracks["Deep Forest"]) return;
  
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
  
      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = "lowpass";
      windFilter.frequency.value = 600; 

      const windLfo = this.ctx.createOscillator();
      windLfo.type = "sine";
      windLfo.frequency.value = 0.1;
      const windLfoGain = this.ctx.createGain();
      windLfoGain.gain.value = 200;
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      
      const envGain = this.ctx.createGain();
      envGain.gain.value = 0.001;
      envGain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 2);
  
      const envPanner = this.ctx.createStereoPanner();
      envPanner.pan.value = 0;

      noiseSource.connect(windFilter);
      windFilter.connect(envGain);
      envGain.connect(envPanner);
      envPanner.connect(this.masterGain);
  
      noiseSource.start();
      windLfo.start();
  
      const trackNodes: AudioNode[] = [noiseSource, windFilter, windLfo, windLfoGain];
      const trackIntervals: number[] = [];
  
      const chirp = () => {
          if (!this.ctx || !this.activeTracks["Deep Forest"]) return;
          
          const osc = this.ctx.createOscillator();
          osc.type = "sine"; 
          const startFreq = 2000 + Math.random() * 2000;
          osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
          
          osc.frequency.exponentialRampToValueAtTime(startFreq * (Math.random() > 0.5 ? 1.5 : 0.5), this.ctx.currentTime + 0.1);
  
          const cGain = this.ctx.createGain();
          cGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          cGain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.02);
          cGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
  
          osc.connect(cGain);
          cGain.connect(envGain);
          
          osc.start();
          osc.stop(this.ctx.currentTime + 0.2);
          
          const nextTime = Math.random() * 5000 + 2000;
          const t = window.setTimeout(chirp, nextTime);
          trackIntervals.push(t);
      };
      chirp();
  
      this.activeTracks["Deep Forest"] = {
        nodes: trackNodes,
        intervals: trackIntervals,
        envGain,
        envPanner,
      };
  }

  public playTrainJourney() {
      this.init();
      if (!this.ctx || !this.masterGain || this.activeTracks["Train Journey"]) return;
  
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
  
      const lowFilter = this.ctx.createBiquadFilter();
      lowFilter.type = "lowpass";
      lowFilter.frequency.value = 150;
      
      const envGain = this.ctx.createGain();
      envGain.gain.value = 0.001;
      envGain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 2);
  
      const envPanner = this.ctx.createStereoPanner();
      envPanner.pan.value = 0;

      noiseSource.connect(lowFilter);
      lowFilter.connect(envGain);
      envGain.connect(envPanner);
      envPanner.connect(this.masterGain);
      noiseSource.start();
  
      const trackNodes: AudioNode[] = [noiseSource, lowFilter];
      const trackIntervals: number[] = [];
  
      const clack = () => {
          if (!this.ctx || !this.activeTracks["Train Journey"]) return;
          
          [0, 0.1].forEach(delay => {
              const osc = this.ctx!.createOscillator();
              osc.type = "square";
              osc.frequency.setValueAtTime(400, this.ctx!.currentTime + delay);
              osc.frequency.exponentialRampToValueAtTime(100, this.ctx!.currentTime + delay + 0.05);
      
              const cGain = this.ctx!.createGain();
              cGain.gain.setValueAtTime(0.001, this.ctx!.currentTime + delay);
              cGain.gain.linearRampToValueAtTime(0.08, this.ctx!.currentTime + delay + 0.01);
              cGain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + delay + 0.05);
      
              osc.connect(cGain);
              cGain.connect(envGain);
              
              osc.start(this.ctx!.currentTime + delay);
              osc.stop(this.ctx!.currentTime + delay + 0.1);
          });
          
          const t = window.setTimeout(clack, 800);
          trackIntervals.push(t);
      };
      clack();
  
      this.activeTracks["Train Journey"] = {
        nodes: trackNodes,
        intervals: trackIntervals,
        envGain,
        envPanner,
      };
  }

  public playSnowCabin() {
      this.init();
      if (!this.ctx || !this.masterGain || this.activeTracks["Snow Cabin"]) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const windSource = this.ctx.createBufferSource();
      windSource.buffer = buffer;
      windSource.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 800;
      bandpass.Q.value = 2.0;

      const windLfo = this.ctx.createOscillator();
      windLfo.type = "sine";
      windLfo.frequency.value = 0.08;
      const windLfoGain = this.ctx.createGain();
      windLfoGain.gain.value = 400;
      
      windLfo.connect(windLfoGain);
      windLfoGain.connect(bandpass.frequency);

      const envGain = this.ctx.createGain();
      envGain.gain.value = 0.001;
      envGain.gain.linearRampToValueAtTime(0.6, this.ctx.currentTime + 3);

      const envPanner = this.ctx.createStereoPanner();
      envPanner.pan.value = 0;

      windSource.connect(bandpass);
      bandpass.connect(envGain);
      envGain.connect(envPanner);
      envPanner.connect(this.masterGain);

      windSource.start();
      windLfo.start();

      const trackNodes: AudioNode[] = [windSource, bandpass, windLfo, windLfoGain];
      const trackIntervals: number[] = [];

      const creak = () => {
          if (!this.ctx || !this.activeTracks["Snow Cabin"]) return;
          
          const osc = this.ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(50 + Math.random() * 30, this.ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.5);

          const filter = this.ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 200;

          const cGain = this.ctx.createGain();
          cGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          cGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.1);
          cGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

          osc.connect(filter);
          filter.connect(cGain);
          cGain.connect(envGain);

          osc.start(this.ctx.currentTime);
          osc.stop(this.ctx.currentTime + 0.7);

          const nextTime = Math.random() * 8000 + 4000;
          const t = window.setTimeout(creak, nextTime);
          trackIntervals.push(t);
      };
      creak();

      this.activeTracks["Snow Cabin"] = {
          nodes: trackNodes,
          intervals: trackIntervals,
          envGain,
          envPanner
      };
  }

  public playThunderstorm() {
      this.init();
      if (!this.ctx || !this.masterGain || this.activeTracks["Thunderstorm"]) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const rainSource = this.ctx.createBufferSource();
      rainSource.buffer = buffer;
      rainSource.loop = true;

      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = "lowpass";
      rainFilter.frequency.value = 1500;

      const envGain = this.ctx.createGain();
      envGain.gain.value = 0.001;
      envGain.gain.linearRampToValueAtTime(0.7, this.ctx.currentTime + 2);

      const envPanner = this.ctx.createStereoPanner();
      envPanner.pan.value = 0;

      rainSource.connect(rainFilter);
      rainFilter.connect(envGain);
      envGain.connect(envPanner);
      envPanner.connect(this.masterGain);

      rainSource.start();

      const trackNodes: AudioNode[] = [rainSource, rainFilter];
      const trackIntervals: number[] = [];

      const triggerThunder = (intensity: number) => {
          if (!this.ctx || !this.activeTracks["Thunderstorm"]) return;
          
          const tBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 4, this.ctx.sampleRate);
          const tData = tBuffer.getChannelData(0);
          for(let i=0; i<tBuffer.length; i++) {
              tData[i] = Math.random() * 2 - 1;
          }
          const thunderSource = this.ctx.createBufferSource();
          thunderSource.buffer = tBuffer;

          const distAmount = 50;
          const curve = new Float32Array(44100);
          const deg = Math.PI / 180;
          for (let i = 0; i < 44100; ++i) {
            const x = (i * 2) / 44100 - 1;
            curve[i] = ((3 + distAmount) * x * 20 * deg) / (Math.PI + distAmount * Math.abs(x));
          }
          const distortion = this.ctx.createWaveShaper();
          distortion.curve = curve;
          distortion.oversample = '4x';

          const rumble = this.ctx.createBiquadFilter();
          rumble.type = "lowpass";
          rumble.frequency.setValueAtTime(400, this.ctx.currentTime);
          rumble.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1.5);

          const tGain = this.ctx.createGain();
          tGain.gain.setValueAtTime(0, this.ctx.currentTime);
          tGain.gain.linearRampToValueAtTime(intensity, this.ctx.currentTime + 0.05);
          tGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (3 * intensity));

          thunderSource.connect(distortion);
          distortion.connect(rumble);
          rumble.connect(tGain);
          tGain.connect(envGain);

          thunderSource.start();
      };

      (window as any).triggerThunder = triggerThunder;

      const scheduleLightning = () => {
          if (!this.ctx || !this.activeTracks["Thunderstorm"]) return;
          const intensity = 0.4 + Math.random() * 0.6;
          triggerThunder(intensity);
          (window as any).lightningFlash = { intensity, time: Date.now() };
          const nextDelay = (8 + Math.random() * 27) * 1000;
          const t = window.setTimeout(scheduleLightning, nextDelay);
          trackIntervals.push(t);
      };
      const firstStrike = window.setTimeout(scheduleLightning, 4000);
      trackIntervals.push(firstStrike);

      this.activeTracks["Thunderstorm"] = {
          nodes: trackNodes,
          intervals: trackIntervals,
          envGain,
          envPanner
      };
  }

  public playChime() {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(528, this.ctx.currentTime);

      const harmonic = this.ctx.createOscillator();
      harmonic.type = "sine";
      harmonic.frequency.setValueAtTime(1056, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.8, this.ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 4.0);

      osc.connect(gain);
      harmonic.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      harmonic.start();
      
      osc.stop(this.ctx.currentTime + 4.1);
      harmonic.stop(this.ctx.currentTime + 4.1);
      
      setTimeout(() => {
          gain.disconnect();
      }, 4200);
  }

  public stopTrack(env: string) {
    if (!this.activeTracks[env] || !this.ctx) return;

    const track = this.activeTracks[env];
    track.envGain.gain.cancelScheduledValues(this.ctx.currentTime);
    track.envGain.gain.setValueAtTime(track.envGain.gain.value, this.ctx.currentTime);
    track.envGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

    setTimeout(() => {
        if (this.activeTracks[env] === track) { 
            track.nodes.forEach((node) => {
              try {
                if ("stop" in node) (node as OscillatorNode | AudioBufferSourceNode).stop();
                node.disconnect();
              } catch (e) {
              }
            });
        
            track.intervals.forEach(clearInterval);
            track.intervals.forEach(clearTimeout);
            track.envGain.disconnect();
            track.envPanner.disconnect();
        
            delete this.activeTracks[env];
        }
    }, 1600);
  }

  public stopAll() {
    if (!this.ctx) return;

    Object.keys(this.activeTracks).forEach(env => {
        this.stopTrack(env);
    });
  }
}