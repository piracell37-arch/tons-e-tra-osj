/* Áudio procedural: trilha ambiente e efeitos, sem arquivos externos. */
(function (global) {
  let ac = null, musicGain = null, sfxGain = null, timer = null, running = false;

  function ensure() {
    if (ac) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ac = new AC(); } catch (e) { return false; }
    musicGain = ac.createGain();
    sfxGain = ac.createGain();
    musicGain.connect(ac.destination);
    sfxGain.connect(ac.destination);
    applyVolume();
    return true;
  }
  function applyVolume() {
    if (!ac) return;
    const v = (window.Store ? window.Store.prefs().volume : 30) / 100;
    musicGain.gain.setTargetAtTime(v * 0.16, ac.currentTime, 0.1);
    sfxGain.gain.setTargetAtTime(v * 0.5, ac.currentTime, 0.05);
  }
  function tone(freq, dur, vol, type = 'sine', delay = 0, dest = sfxGain) {
    if (!ac || !dest || ac.state !== 'running') return;
    if (dest === sfxGain && window.Store && !window.Store.prefs().sfx) return;
    const t = ac.currentTime + delay;
    const osc = ac.createOscillator(), env = ac.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(env); env.connect(dest);
    osc.start(t); osc.stop(t + dur + 0.03);
  }

  const chords = [[261.63, 329.63, 392.0, 523.25], [220.0, 261.63, 329.63, 440.0],
  [174.61, 220.0, 261.63, 349.23], [196.0, 246.94, 293.66, 392.0]];
  const melody = [523.25, 659.25, 587.33, 440.0, 392.0, 523.25, 659.25, 587.33, 493.88, 523.25, 440.0, 392.0];
  let step = 0;

  global.Sound = {
    unlock() { if (!ensure()) return; if (ac.state === 'suspended') ac.resume(); },
    startMusic() {
      if (!window.Store.prefs().music) return this.stopMusic();
      if (!ensure() || running) return;
      if (ac.state === 'suspended') ac.resume();
      running = true;
      timer = setInterval(() => {
        if (!window.Store.prefs().music) return;
        const beat = step % 16, chord = chords[Math.floor(beat / 4) % 4];
        if (beat % 4 === 0) {
          chord.forEach((f, i) => tone(f, 1.7, 0.09, 'triangle', i * 0.05, musicGain));
          tone(chord[0] / 2, 1.9, 0.1, 'sine', 0, musicGain);
        }
        tone(melody[step % melody.length], 0.85, 0.16, 'sine', 0.03, musicGain);
        step++;
      }, 470);
    },
    stopMusic() { if (timer) clearInterval(timer); timer = null; running = false; },
    setVolume() { ensure(); applyVolume(); },
    paint() { tone(880, 0.14, 0.3, 'triangle'); tone(1320, 0.1, 0.16, 'sine', 0.03); },
    wrong() { tone(180, 0.16, 0.24, 'sawtooth'); },
    tap() { tone(660, 0.06, 0.14, 'sine'); },
    unlock2() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 0.25, 'triangle', i * 0.08)); },
    fanfare() { [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((f, i) => tone(f, 0.42, 0.3, 'triangle', i * 0.13)); },
    coin() { tone(1046, 0.1, 0.22, 'square'); tone(1568, 0.14, 0.18, 'square', 0.07); }
  };
})(window);
