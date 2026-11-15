// Web Audio API based Call Sound Synthesizer
// Provides zero-dependency, ultra-reliable outgoing ringback and incoming ringtone sounds

class CallSoundManager {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
    this.isPlaying = false;
    this.currentType = null;
    this.activeNodes = [];
  }

  getAudioContext() {
    if (!this.audioCtx || this.audioCtx.state === "closed") {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Play realistic outgoing telephone ringback tone (440Hz + 480Hz pulses)
  playOutgoingRing() {
    this.stopCallSounds();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.isPlaying = true;
    this.currentType = "outgoing";

    const playBeep = () => {
      if (!this.isPlaying || this.currentType !== "outgoing") return;

      const now = ctx.currentTime;
      const duration = 1.2; // 1.2s tone

      // Dual frequencies standard telephone ringback
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(440, now);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(480, now);

      // Smooth attack and release to avoid clicks
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
      gainNode.gain.setValueAtTime(0.12, now + duration - 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);

      this.activeNodes.push(osc1, osc2, gainNode);
    };

    playBeep();
    // Repeat every 3.5 seconds
    this.intervalId = setInterval(playBeep, 3500);
  }

  // Play modern melodic incoming call chime
  playIncomingRing() {
    this.stopCallSounds();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.isPlaying = true;
    this.currentType = "incoming";

    // Pleasant electronic chime chord sequence (E5 -> G#5 -> B5 -> E6)
    const notes = [659.25, 830.61, 987.77, 1318.51, 987.77, 1318.51];

    const playMelody = () => {
      if (!this.isPlaying || this.currentType !== "incoming") return;

      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = now + idx * 0.16;
        const noteDuration = 0.35;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);

        this.activeNodes.push(osc, gain);
      });
    };

    playMelody();
    // Repeat melody every 2.4 seconds
    this.intervalId = setInterval(playMelody, 2400);
  }

  // Stop any active sounds immediately
  stopCallSounds() {
    this.isPlaying = false;
    this.currentType = null;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Stop active audio nodes
    while (this.activeNodes.length > 0) {
      const node = this.activeNodes.pop();
      try {
        if (typeof node.stop === "function") {
          node.stop();
        }
        node.disconnect();
      } catch {
        // ignore already stopped nodes
      }
    }
  }
}

export const callSounds = new CallSoundManager();

