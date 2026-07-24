/**
 * MP3 Background Music Engine & Sound FX for Pool Party RSVP
 * Plays 'Right_Round-561480-mobiles24.mp3' automatically on load / first interaction
 */

class PartyAudioEngine {
  constructor() {
    this.audio = new Audio("./assets/Right_Round-561480-mobiles24.mp3");
    this.audio.loop = true;
    this.audio.preload = "auto";
    this.isPlaying = false;
    this.ctx = null;
    
    this.initAutoplay();
  }

  initAutoplay() {
    // Attempt automatic playback
    const playPromise = this.audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.updateUI(true);
        })
        .catch(() => {
          // Autoplay blocked by browser policy; wait for first user interaction anywhere
          this.isPlaying = false;
          this.updateUI(false);

          const unlockAudio = () => {
            if (!this.isPlaying) {
              this.audio.play().then(() => {
                this.isPlaying = true;
                this.updateUI(true);
              }).catch(e => console.log("Audio play error:", e));
            }
            document.removeEventListener("click", unlockAudio);
            document.removeEventListener("touchstart", unlockAudio);
          };

          document.addEventListener("click", unlockAudio, { once: true });
          document.addEventListener("touchstart", unlockAudio, { once: true });
        });
    }
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
  window.partyAudio = new PartyAudioEngine();
});
