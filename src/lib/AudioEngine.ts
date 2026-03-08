export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private activeNodes: AudioNode[] = [];
  private activeIntervals: number[] = [];

  constructor() {}

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx!.currentTime, 0.1);
    }
  }

  public stopAll() {
    this.activeNodes.forEach((node) => {
      try {
        if ("stop" in node) (node as OscillatorNode | AudioBufferSourceNode).stop();
        node.disconnect();
      } catch (e) {
      }
    });
    this.activeNodes = [];

    this.activeIntervals.forEach(clearInterval);
    this.activeIntervals.forEach(clearTimeout);
    this.activeIntervals = [];
  }

  private createNoiseBuffer(duration: number = 2): { buffer: AudioBuffer; data: Float32Array } {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    return { buffer, data };
  }

  private createWhiteNoise(): AudioBufferSourceNode {
    const { buffer, data } = this.createNoiseBuffer();
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = this.ctx!.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    return noiseSource;
  }

  private createPinkNoise(): AudioBufferSourceNode {
    const { buffer, data } = this.createNoiseBuffer();
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < data.length; i++) {
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
    const noiseSource = this.ctx!.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    return noiseSource;
  }

  private createBrownNoise(): AudioBufferSourceNode {
    const { buffer, data } = this.createNoiseBuffer();
    let lastOut = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const noiseSource = this.ctx!.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    return noiseSource;
  }

  public playRain() {
    this.init();
    this.stopAll();
    const noise = this.createWhiteNoise();
    
    const filter = this.ctx!.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;

    const lfo = this.ctx!.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.1;
    const lfoGain = this.ctx!.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx!.createGain();
    gain.gain.value = 0.3;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    noise.start();
    lfo.start();
    
    this.activeNodes.push(noise, filter, lfo, lfoGain, gain);
  }

  public playWaves() {
    this.init();
    this.stopAll();
    const noise = this.createPinkNoise();

    const filter = this.ctx!.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    
    const waveGain = this.ctx!.createGain();
    waveGain.gain.value = 0.1;

    let time = this.ctx!.currentTime;
    const waveCycle = () => {
        if(!this.ctx) return;
        const now = this.ctx.currentTime;
        waveGain.gain.exponentialRampToValueAtTime(0.6, now + 3);
        waveGain.gain.exponentialRampToValueAtTime(0.1, now + 8);
    };
    
    waveCycle();
    const interval = window.setInterval(waveCycle, 8000);
    this.activeIntervals.push(interval);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain!);

    noise.start();
    this.activeNodes.push(noise, filter, waveGain);
  }

  public playFireplace() {
    this.init();
    this.stopAll();
    
    const rumble = this.createBrownNoise();
    const rumbleFilter = this.ctx!.createBiquadFilter();
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.value = 250;
    
    const rumbleGain = this.ctx!.createGain();
    rumbleGain.gain.value = 0.4;
    
    rumble.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.masterGain!);
    rumble.start();
    this.activeNodes.push(rumble, rumbleFilter, rumbleGain);

    const crackle = () => {
      if(!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "square";
      osc.frequency.setValueAtTime(100 + Math.random() * 500, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1, this.ctx.currentTime + 0.05);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 2000;
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(Math.random() * 0.3 + 0.1, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (0.05 + Math.random() * 0.1));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.2);
      
      const nextTime = Math.random() * 1000 + 200;
      const timeout = window.setTimeout(crackle, nextTime);
      this.activeIntervals.push(timeout);
    };
    crackle();
  }

  public playNightSky() {
    this.init();
    this.stopAll();
    
    const frequencies = [220.00, 277.18, 329.63, 415.30, 440.00];
    
    frequencies.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        
        const gain = this.ctx!.createGain();
        gain.gain.value = 0;

        const lfo = this.ctx!.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.05 + Math.random() * 0.02;
        
        const lfoGain = this.ctx!.createGain();
        lfoGain.gain.value = 0.05;
        
        const baseGain = 0.05;
        gain.gain.setTargetAtTime(baseGain, this.ctx!.currentTime, 2);

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        
        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.start();
        lfo.start();
        this.activeNodes.push(osc, lfo, gain, lfoGain);
    });
  }
}
