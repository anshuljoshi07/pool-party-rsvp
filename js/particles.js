/**
 * Background Particle Canvas & Confetti Explosion Engine
 */

class ParticleEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.confetti = [];
    this.animId = null;
  }

  init() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "particle-canvas";
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100vw";
    this.canvas.style.height = "100vh";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "0";
    document.body.prepend(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Generate floating pool ambient bubbles & light orbs
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 4 + 1.5,
        color: Math.random() > 0.5 ? 'rgba(0, 245, 212, ' : 'rgba(0, 180, 216, ',
        alpha: Math.random() * 0.4 + 0.1,
        speedY: Math.random() * 0.6 + 0.2,
        speedX: (Math.random() - 0.5) * 0.4
      });
    }

    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burstConfetti(x, y) {
    const colors = ['#00F5D4', '#00B4D8', '#FF9E00', '#FF477E', '#7000FF'];
    const originX = x || this.canvas.width / 2;
    const originY = y || this.canvas.height / 3;

    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      this.confetti.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        gravity: 0.25
      });
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ambient floating particles
    this.particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < -10) {
        p.y = this.canvas.height + 10;
        p.x = Math.random() * this.canvas.width;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + p.alpha + ')';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color + '0.8)';
      this.ctx.fill();
    });

    // Draw confetti particles
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.gravity;
      c.rotation += c.rotSpeed;
      c.opacity -= 0.015;

      if (c.opacity <= 0) {
        this.confetti.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(c.x, c.y);
      this.ctx.rotate((c.rotation * Math.PI) / 180);
      this.ctx.fillStyle = c.color;
      this.ctx.globalAlpha = c.opacity;
      this.ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
      this.ctx.restore();
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.particleEngine = new ParticleEngine();
  window.particleEngine.init();
});
