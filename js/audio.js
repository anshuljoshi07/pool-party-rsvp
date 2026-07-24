/**
 * MP3 Background Music Engine
 * Ensures 'Right_Round-561480-mobiles24.mp3' plays automatically on load
 */

class PartyAudioEngine {
  constructor() {
    this.audio = new Audio("./assets/Right_Round-561480-mobiles24.mp3");
    this.audio.loop = true;
    this.audio.autoplay = true;
    this.audio.preload = "auto";
    this.isPlaying = false;
    this.ctx = null;
    
    this.startMusic();
    this.bindGlobalAutoplayUnlock();
  }

  startMusic() {
    const playPromise = this.audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.updateUI(true);
        })
        .catch(() => {
          this.isPlaying = false;
          this.updateUI(false);
        });
    }
  }

  bindGlobalAutoplayUnlock() {
    const forcePlay = () => {
      if (!this.isPlaying || this.audio.paused) {
        this.audio.play().then(() => {
          this.isPlaying = true;
          this.updateUI(true);
          this.removeListeners(forcePlay);
        }).catch(() => {});
      } else {
        this.removeListeners(forcePlay);
      }
    };

    const events = ["click", "touchstart", "mousemove", "mousedown", "keydown", "scroll"];
    events.forEach(evt => {
      document.addEventListener(evt, forcePlay, { passive: true });
    });
  }

  removeListeners(handler) {
    const events = ["click", "touchstart", "mousemove", "mousedown", "keydown", "scroll"];
    events.forEach(evt => {
      document.removeEventListener(evt, handler);
    });
  }

  togglePlay() {
    if (this.audio.paused) {
      this.audio.play();
      this.isPlaying = true;
    } else {
      this.audio.pause();
      this.isPlaying = false;
    }
    this.updateUI(this.isPlaying);
    return this.isPlaying;
  }

  updateUI(playing) {
    const btn = document.getElementById("btn-toggle-music");
    if (btn) {
      btn.classList.toggle("playing", playing);
    }
  }

  playPop() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx && AudioCtx) this.ctx = new AudioCtx();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(850, t + 0.08);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {}
  }

  playFanfare() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx && AudioCtx) this.ctx = new AudioCtx();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const t = this.ctx.currentTime + (idx * 0.1);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch (e) {}
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!window.partyAudio) {
    window.partyAudio = new PartyAudioEngine();
  }
});
