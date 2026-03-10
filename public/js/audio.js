// Disco beat synthesizer using the Web Audio API
// 120 BPM — kick on 1&3, clap on 2&4, hi-hat on every 8th note, repeating bass line

const BPM = 120;
const BEAT = 60 / BPM;         // seconds per beat
const STEP = BEAT / 2;         // seconds per 8th-note step

// Bass pattern in semitones above A1 (55 Hz) — 2 bars of 8 steps each
const BASS_PATTERN = [0, 0, 7, 0, 5, 0, 3, 0, 0, 0, 7, 5, 3, 0, 5, 7];
const A1 = 55;

let ctx = null;
let schedulerTimer = null;
let nextStepTime = 0;
let stepIndex = 0;
let masterGain = null;

function createContext() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, ctx.currentTime);
    masterGain.connect(ctx.destination);
}

// --- Instrument helpers ---

function playKick(time) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc.start(time);
    osc.stop(time + 0.3);
}

function playClap(time) {
    // White noise burst filtered to a snappy clap
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start(time);
    source.stop(time + 0.12);
}

function playHihat(time, open = false) {
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;

    const gain = ctx.createGain();
    const decay = open ? 0.15 : 0.04;
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start(time);
    source.stop(time + decay);
}

function playBass(time, semitone) {
    const freq = A1 * Math.pow(2, semitone / 12);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.55, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + STEP * 0.9);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(time);
    osc.stop(time + STEP);
}

// --- Scheduler ---
// Schedules notes slightly ahead so the audio clock drives timing, not JS setInterval.

const LOOK_AHEAD = 0.1; // seconds ahead to schedule

function scheduleStep(time, index) {
    const beat = index % 8; // position within a bar (8th-note steps)

    // Kick on beat 1 (step 0) and beat 3 (step 4)
    if (beat === 0 || beat === 4) playKick(time);
    // Clap on beat 2 (step 2) and beat 4 (step 6)
    if (beat === 2 || beat === 6) playClap(time);
    // Hi-hat on every step; open hi-hat on off-beats
    playHihat(time, beat % 2 !== 0);
    // Bass line
    playBass(time, BASS_PATTERN[index % BASS_PATTERN.length]);
}

function tick() {
    while (nextStepTime < ctx.currentTime + LOOK_AHEAD) {
        scheduleStep(nextStepTime, stepIndex);
        nextStepTime += STEP;
        stepIndex = (stepIndex + 1) % BASS_PATTERN.length;
    }
    schedulerTimer = setTimeout(tick, 25);
}

// --- Public API ---

export function startDiscoMusic() {
    if (ctx) return; // already running
    createContext();
    stepIndex = 0;
    nextStepTime = ctx.currentTime + 0.05;
    tick();
}

export function stopDiscoMusic() {
    if (!ctx) return;
    clearTimeout(schedulerTimer);
    schedulerTimer = null;
    ctx.close();
    ctx = null;
    masterGain = null;
}
