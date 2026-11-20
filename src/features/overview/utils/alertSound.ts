// Plays a short two-tone alarm for SOS activations via the Web Audio API.
// No audio asset required; silently no-ops when audio is blocked or unavailable.

let audioCtx: AudioContext | null = null

export function playSosAlertSound(): void {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    audioCtx ??= new Ctor()
    if (audioCtx.state === 'suspended') void audioCtx.resume()

    const t0 = audioCtx.currentTime + 0.05
    for (let i = 0; i < 3; i++) {
      const start = t0 + i * 0.45
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(880, start)
      osc.frequency.setValueAtTime(660, start + 0.18)
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.07, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start(start)
      osc.stop(start + 0.42)
    }
  } catch {
    // Autoplay policy or audio unavailable — ignore
  }
}
