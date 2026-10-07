/**
 * Controls camera hardware and digital zoom, pan-and-scan framing,
 * and high-tech auditory feedback for the Facial Recognition system.
 */

export interface CameraCapabilities {
  supportsHardwareZoom: boolean;
  minZoom: number;
  maxZoom: number;
  currentZoom: number;
}

/**
 * Checks if the media stream track supports PTZ hardware zoom.
 */
export function inspectCameraCapabilities(videoTrack: MediaStreamTrack | null): CameraCapabilities {
  if (!videoTrack) {
    return { supportsHardwareZoom: false, minZoom: 1, maxZoom: 4, currentZoom: 1 };
  }

  try {
    const capabilities = (videoTrack.getCapabilities && (videoTrack.getCapabilities() as any)) || {};
    if (capabilities.zoom) {
      return {
        supportsHardwareZoom: true,
        minZoom: capabilities.zoom.min || 1,
        maxZoom: capabilities.zoom.max || 4,
        currentZoom: 1,
      };
    }
  } catch (err) {
    console.warn('Unable to query camera capabilities:', err);
  }

  return { supportsHardwareZoom: false, minZoom: 1, maxZoom: 4, currentZoom: 1 };
}

/**
 * Applies hardware zoom to the webcam track if supported.
 */
export async function applyHardwareZoom(videoTrack: MediaStreamTrack | null, zoomLevel: number): Promise<boolean> {
  if (!videoTrack) return false;
  try {
    const capabilities = (videoTrack.getCapabilities && (videoTrack.getCapabilities() as any)) || {};
    if (capabilities.zoom) {
      await (videoTrack as any).applyConstraints({
        advanced: [{ zoom: Math.min(capabilities.zoom.max, Math.max(capabilities.zoom.min, zoomLevel)) }],
      });
      return true;
    }
  } catch {
    // Hardware zoom constraint failed or unsupported
  }
  return false;
}

/**
 * Smoothly interpolates (lerp) from current zoom to target zoom.
 */
export function lerpZoom(current: number, target: number, speed = 0.12): number {
  const diff = target - current;
  if (Math.abs(diff) < 0.015) return target;
  return Math.round((current + diff * speed) * 1000) / 1000;
}

/**
 * Exponential Moving Average (EMA) damping for smooth 2D camera pan transitions.
 */
export function smoothDampPan(
  current: { x: number; y: number },
  target: { x: number; y: number },
  factor = 0.14
): { x: number; y: number } {
  const diffX = target.x - current.x;
  const diffY = target.y - current.y;
  return {
    x: Math.abs(diffX) < 0.05 ? target.x : Math.round((current.x + diffX * factor) * 100) / 100,
    y: Math.abs(diffY) < 0.05 ? target.y : Math.round((current.y + diffY * factor) * 100) / 100,
  };
}

/**
 * High-tech audio synthesizer using the Web Audio API.
 * Provides instant auditory telemetry when a student's face is tracked, locked, and marked.
 */
class AttendanceAudioEngine {
  private audioCtx: AudioContext | null = null;

  private initCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Plays a pleasant dual-tone ascending chime (Success lock)
   */
  public playSuccessChime() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Note 1: 587.33 Hz (D5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Note 2: 880 Hz (A5)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.1);
      gain2.gain.setValueAtTime(0.18, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.38);
    } catch {
      // Audio playback suppressed or blocked
    }
  }

  /**
   * Subtle tick as lock-on reticle ring charges
   */
  public playLockTick() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(920, now);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Silently ignore
    }
  }

  /**
   * Plays a radar sweep / scanning pulse
   */
  public playScanTick() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Silently ignore
    }
  }

  /**
   * Sweeping glide sound when patrol shifts to a new classroom row/student
   */
  public playPatrolSweep() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.14);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Silently ignore
    }
  }
}

export const soundEffects = new AttendanceAudioEngine();
