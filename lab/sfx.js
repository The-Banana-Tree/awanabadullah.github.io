/* UI sound for the orbit, synthesised rather than loaded.

   The site's own audio is one 7.9MB mp3; a set of clicks has no business
   adding more download than the page it decorates, and these are short enough
   that an oscillator is the whole sample. Everything runs through one master
   gain and a lowpass, so no single blip can get shrill - the site's language
   is a terminal in deep space, not an arcade.

   Nothing is heard before the visitor touches something: browsers block audio
   until a gesture, and a page that greets you with a noise is worse than one
   that stays quiet. `unlock()` on the first real interaction is what opens it. */

const KEY = 'labSfxMuted';

let ctx = null;
let master = null;
let unlocked = false;
let muted = localStorage.getItem(KEY) === '1';

function audio() {
    if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        const tame = ctx.createBiquadFilter();
        tame.type = 'lowpass';
        tame.frequency.value = 2600;
        master = ctx.createGain();
        // 0.85 read too quiet against the site's music (Awan, 2026-10-19). The
        // per-voice gains top out around 0.11 even when arrive() stacks, so
        // there is plenty of headroom here before anything clips.
        master.gain.value = 1.5;
        master.connect(tame).connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

function live() {
    return unlocked && !muted && audio();
}

/* One voice: a tone that slides, fades in fast and decays. Gains are ramped
   rather than set, because a square wave switched on at full level clicks. */
function tone(freq, { type = 'triangle', to = freq, dur = 0.12, gain = 0.05, at = 0 } = {}) {
    const a = live();
    if (!a) return;
    const t = a.currentTime + at;
    const osc = a.createOscillator();
    const amp = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, to), t + dur);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(amp).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
}

/* A band of noise - the breath under the model arriving. Built once per call;
   a quarter second of mono noise is a few thousand samples. */
function hiss({ dur = 0.3, gain = 0.03, freq = 900, at = 0 } = {}) {
    const a = live();
    if (!a) return;
    const t = a.currentTime + at;
    const frames = Math.ceil(a.sampleRate * dur);
    const buf = a.createBuffer(1, frames, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

    const src = a.createBufferSource();
    src.buffer = buf;
    const band = a.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(freq, t);
    band.frequency.exponentialRampToValueAtTime(freq * 2.4, t + dur);
    band.Q.value = 1.4;
    const amp = a.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.04);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    src.connect(band).connect(amp).connect(master);
    src.start(t);
    src.stop(t + dur + 0.02);
}

export const sfx = {
    /* Hovering a node. Quiet and brief enough to sweep across the ring without
       turning into a rattle. */
    hover() {
        tone(1240, { type: 'square', to: 1240, dur: 0.03, gain: 0.012 });
    },

    /* Picking a node: a rising pair, the second a fifth above the first. */
    select() {
        tone(540, { to: 760, dur: 0.09, gain: 0.05 });
        tone(1080, { type: 'square', dur: 0.07, gain: 0.018, at: 0.055 });
    },

    /* The arrows. Direction is audible - the ring is going somewhere. */
    turn(dir) {
        const from = dir > 0 ? 460 : 700;
        const to = dir > 0 ? 700 : 460;
        tone(from, { to, dur: 0.11, gain: 0.035 });
    },

    /* A model settling into the centre: a low swell with air on top, landing
       on a tick as it comes to rest. */
    arrive() {
        tone(96, { type: 'sine', to: 186, dur: 0.5, gain: 0.07 });
        hiss({ dur: 0.34, gain: 0.022, freq: 760 });
        tone(1480, { type: 'triangle', dur: 0.05, gain: 0.022, at: 0.4 });
    },

    /* Called from the first genuine interaction, after which sound is allowed. */
    unlock() {
        if (unlocked) return;
        unlocked = true;
        audio();
    },

    get muted() { return muted; },

    setMuted(next) {
        muted = next;
        localStorage.setItem(KEY, muted ? '1' : '0');
    }
};
