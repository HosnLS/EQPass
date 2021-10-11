const LeastInterval = 3;
const LeastResolutionRange = 0.5
const FadeTime = 0.5;

var DefinedFreqs = [];

var Workflow = {
  freqs: [],
  status: {},
  _pipe: [],
  _last: null,
  init: function (freqs, stage = 0) {
    this.freqs = freqs
    for (let i = 0; i < freqs.length; i++) {
      freq = freqs[i]
      this._pipe.push(freq);
      this.status[freq] = {lodb: -80, hidb: 0, stage: stage};
    }
  },
  getTest: function () {
    if (this._pipe.length === 0) return null;
    let rangeHigh = Math.max(this._pipe.length - LeastInterval, 0);
    let rangeLow = 0;
    let r = Math.floor(Math.random() * (rangeHigh - rangeLow + 1) + rangeLow);
    this.last = this._pipe[r];
    this._pipe.splice(r, 1);

    var middb = (this.status[this.last].lodb + this.status[this.last].hidb) / 2;
    return {
      freq: this.last,
      db: middb
    };
  },
  saveTest: function (can) {
    let lo = this.status[this.last].lodb;
    let hi = this.status[this.last].hidb;
    if (can) this.status[this.last].hidb = (2 * hi + lo) / 3;
    else this.status[this.last].lodb = (2 * lo + hi) / 3;
    if (this.status[this.last].hidb - this.status[this.last].lodb >= LeastResolutionRange)
      this._pipe.push(this.last);
  }
}

var AUD = {
  Ctx: null,
  Osc: null,
  Gain: null,
  init: function () {
    try {
      this.Ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      alert('Web Audio API is not supported in this browser');
    }
  },
  startSound: function (freq, spl) {
    spl = Math.pow(10, spl / 20);
    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = freq;
    this.Osc.type = 'sine'
    this.Gain = this.Ctx.createGain();
    this.Gain.gain.setValueAtTime(0, this.Ctx.currentTime);
    this.Gain.gain.linearRampToValueAtTime(spl, this.Ctx.currentTime + FadeTime);
    this.Osc.connect(this.Gain);
    this.Gain.connect(this.Ctx.destination);
    this.Osc.start(0);
  },
  stopSound: function () {
    this.Osc.stop(0);
  }
}






