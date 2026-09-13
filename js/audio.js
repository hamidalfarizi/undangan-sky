/* ════════════════════════════════════════
   SKY WEDDING — js/audio.js
   Web Audio API ambient music manager
   ════════════════════════════════════════ */

class AudioManager {
  constructor () {
    this.actx      = null;
    this.master    = null;
    this.reverb    = null;
    this.ambGain   = null;
    this.oscillators = [];
    this.muted     = false;
    this.ready     = false;
    this.currentRealm = -1;

    /* Uplifting chord (Hz) and harmonics per Daylight Prairie chapter */
    this.themes = [
      { chord:[261.63,329.63,392.00,493.88], sub:130.81, label:'C-maj7',  vol:.50 }, // Padang Kupu-Kupu
      { chord:[293.66,369.99,440.00,554.37], sub:146.83, label:'D-maj7',  vol:.50 }, // Tiga Menara Lonceng
      { chord:[392.00,493.88,587.33,739.99], sub:196.00, label:'G-maj7',  vol:.52 }, // Desa Praire & Altar
      { chord:[261.63,329.63,392.00,523.25], sub:130.81, label:'C-maj+',  vol:.60 }, // Kuil Cahaya (Ending)
    ];
  }

  /* ── Must be called after a user gesture ── */
  init () {
    if (this.ready) return;
    try {
      this.actx   = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.actx.createGain();
      this.master.gain.value = 0.28;
      this.master.connect(this.actx.destination);

      this.reverb  = this._makeReverb(3.5);
      this.ambGain = this.actx.createGain();
      this.ambGain.gain.value = 0;
      this.ambGain.connect(this.reverb);
      this.reverb.connect(this.master);

      this.ready = true;
    } catch (e) {
      console.warn('[Audio] Web Audio not supported', e);
    }
  }

  /* ── Convolution reverb impulse ── */
  _makeReverb (secs) {
    const conv = this.actx.createConvolver();
    const sr   = this.actx.sampleRate;
    const len  = sr * secs;
    const buf  = this.actx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
      }
    }
    conv.buffer = buf;
    return conv;
  }

  /* ── Start ambient pad for a realm ── */
  startAmbient (realmIdx) {
    if (!this.ready || this.muted) return;
    if (realmIdx === this.currentRealm) return;
    this._stopOscillators();
    this.currentRealm = realmIdx;

    const t = this.themes[realmIdx] || this.themes[0];
    const now = this.actx.currentTime;

    /* Fade in */
    this.ambGain.gain.cancelScheduledValues(now);
    this.ambGain.gain.setValueAtTime(0, now);
    this.ambGain.gain.linearRampToValueAtTime(t.vol, now + 2.5);

    /* Sub bass */
    this._addOsc(t.sub, 'sine', 0.25, 0);

    /* Chord tones with gentle LFO tremolo */
    t.chord.forEach((freq, i) => {
      const vol = 0.22 - i * 0.03;
      this._addOsc(freq, 'sine', vol, i * 0.08, true);
    });
  }

  _addOsc (freq, type, vol, detuneCents, withLfo = false) {
    const now = this.actx.currentTime;
    const osc  = this.actx.createOscillator();
    const gain = this.actx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detuneCents * 10;
    gain.gain.value = vol;

    if (withLfo) {
      const lfo     = this.actx.createOscillator();
      const lfoGain = this.actx.createGain();
      lfo.frequency.value = 0.15 + Math.random() * 0.1;
      lfoGain.gain.value = 0.06;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      this.oscillators.push({ osc: lfo });
    }

    osc.connect(gain);
    gain.connect(this.ambGain);
    osc.start(now);
    this.oscillators.push({ osc, gain });
  }

  _stopOscillators () {
    if (!this.actx) return;
    const now = this.actx.currentTime;
    /* Fade out */
    if (this.ambGain) {
      this.ambGain.gain.cancelScheduledValues(now);
      this.ambGain.gain.setValueAtTime(this.ambGain.gain.value, now);
      this.ambGain.gain.linearRampToValueAtTime(0, now + 1.2);
    }
    const toStop = [...this.oscillators];
    setTimeout(() => {
      toStop.forEach(({ osc }) => { try { osc.stop(); } catch (_) {} });
    }, 1300);
    this.oscillators = [];
  }

  /* ── SFX: collect candle ── */
  playCollect () {
    if (!this.ready || this.muted) return;
    const now  = this.actx.currentTime;
    const osc  = this.actx.createOscillator();
    const gain = this.actx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain); gain.connect(this.master);
    osc.start(now); osc.stop(now + 0.45);
  }

  /* ── SFX: portal entered ── */
  playPortal () {
    if (!this.ready || this.muted) return;
    [440, 550, 660, 880, 1100].forEach((freq, i) => {
      setTimeout(() => {
        const now  = this.actx.currentTime;
        const osc  = this.actx.createOscillator();
        const gain = this.actx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.connect(gain); gain.connect(this.reverb);
        osc.start(now); osc.stop(now + 0.9);
      }, i * 130);
    });
  }

  /* ── SFX: jump / fly ── */
  playFly () {
    if (!this.ready || this.muted) return;
    const now  = this.actx.currentTime;
    const osc  = this.actx.createOscillator();
    const gain = this.actx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain); gain.connect(this.master);
    osc.start(now); osc.stop(now + 0.2);
  }

  /* ── Toggle mute ── */
  toggle () {
    this.muted = !this.muted;
    if (this.actx && this.master) {
      const now = this.actx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(this.muted ? 0 : 0.28, now + 0.4);
    }
    return this.muted;
  }

  /* ── Cross-fade to new realm ── */
  changeRealm (realmIdx) {
    if (!this.ready) return;
    if (this.currentRealm === realmIdx) return;
    this._stopOscillators();
    this.currentRealm = -1;
    setTimeout(() => this.startAmbient(realmIdx), 1400);
  }
}

const audioManager = new AudioManager();
