/* =========================
   UI sound effects (Web Audio)
   ========================= */
const UIItem = {
  played: true,
  ctx: null,
  gainNode: null,

  ensure() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    const gain = this.ctx.createGain();
    gain.gain.value = 0.08;
    gain.connect(this.ctx.destination);
    this.gainNode = gain;
    return this.ctx;
  },

  play(type) {
    if (!this.played) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const beep = (freq, start, dur, type, vol) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.6, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o.connect(g);
      g.connect(this.gainNode);
      o.start(start);
      o.stop(start + dur + 0.05);
    };
    const s = now + 0.02;
    switch (type) {
      case "click":
        beep(1200, s, 0.06, "sine", 0.12);
        beep(1600, s + 0.03, 0.04, "sine", 0.08);
        break;
      case "pop":
        beep(220, s, 0.12, "sine", 0.16);
        beep(330, s + 0.06, 0.08, "sine", 0.1);
        break;
      case "tick":
        beep(1800, s, 0.05, "sine", 0.1);
        break;
      case "hover":
        beep(800, s, 0.08, "sine", 0.06);
        beep(1000, s + 0.04, 0.06, "sine", 0.04);
        break;
      case "vote":
        beep(660, s, 0.1, "sine", 0.1);
        beep(880, s + 0.1, 0.12, "sine", 0.08);
        break;
      case "unvote":
        beep(330, s, 0.1, "sine", 0.08);
        beep(220, s + 0.1, 0.12, "sine", 0.06);
        break;
      case "favorite":
        beep(880, s, 0.12, "sine", 0.1);
        beep(1320, s + 0.12, 0.16, "sine", 0.07);
        break;
      case "unfavorite":
        beep(220, s, 0.1, "sine", 0.06);
        beep(110, s + 0.1, 0.12, "sine", 0.05);
        break;
      case "menu":
        beep(1200, s, 0.06, "sine", 0.1);
        beep(900, s + 0.08, 0.07, "sine", 0.07);
        beep(1500, s + 0.16, 0.09, "sine", 0.06);
        break;
      case "open":
        beep(523, s, 0.08, "sine", 0.08);
        beep(659, s + 0.08, 0.08, "sine", 0.08);
        beep(784, s + 0.16, 0.1, "sine", 0.08);
        break;
      case "news":
        beep(880, s, 0.08, "triangle", 0.06);
        beep(1175, s + 0.1, 0.08, "triangle", 0.05);
        break;
      case "close":
        beep(1568, s, 0.1, "sine", 0.06);
        beep(1319, s + 0.08, 0.1, "sine", 0.05);
        break;
      case "toTop":
        beep(1400, s, 0.1, "sine", 0.08);
        beep(900, s + 0.12, 0.14, "sine", 0.06);
        break;
      default:
        beep(660, s, 0.1, "sine", 0.08);
    }
  },
};

/* Экспорт для подключаемых скриптов */
window.__uiSound = UIItem;

