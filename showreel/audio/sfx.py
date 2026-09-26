"""Synthesize the sound-effects stem from cues.py → out/audio/sfx-stem.wav (48 kHz stereo).

Minimal UI/tech palette: ticks, clicks, blips, filtered-noise whooshes, shimmers, pads.
Run: python3 audio/sfx.py   (from showreel/)
"""

import os

import numpy as np
from scipy.io import wavfile
from scipy.signal import fftconvolve

from cues import CUES, DURATION, FPS

SR = 48000
rng = np.random.default_rng(7)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def env_exp(n, decay):
    return np.exp(-np.arange(n) / SR / decay)


def fade(x, a=0.003, r=0.01):
    na, nr = int(a * SR), int(r * SR)
    x[:na] *= np.linspace(0, 1, na)
    x[-nr:] *= np.linspace(1, 0, nr)
    return x


def svf(x, cutoff, q=0.7, mode="bp"):
    """State-variable filter with per-sample cutoff (array or scalar)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    f = 2 * np.sin(np.pi * np.clip(cutoff, 20, SR / 6) / SR)
    lp = bp = 0.0
    out = np.empty_like(x)
    damp = 1 / q
    for i in range(len(x)):
        hp = x[i] - lp - damp * bp
        bp += f[i] * hp
        lp += f[i] * bp
        out[i] = bp if mode == "bp" else lp
    return out


# ── Instruments ─────────────────────────────────────────────────────
def tick(freq=2400, amp=0.3, **_):
    t = t_(0.06)
    x = np.sin(2 * np.pi * freq * t) * env_exp(len(t), 0.012)
    x += rng.standard_normal(len(t)) * env_exp(len(t), 0.002) * 0.3
    return fade(x) * amp


def click(amp=0.3, **_):
    a = tick(3200, 1)
    b = np.concatenate([np.zeros(int(0.045 * SR)), tick(2400, 0.7)])
    x = np.zeros(max(len(a), len(b)))
    x[: len(a)] += a
    x[: len(b)] += b
    return x * amp


def blip(freq=880, amp=0.3, **_):
    t = t_(0.45)
    x = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2 * t) + 0.12 * np.sin(2 * np.pi * freq * 3.01 * t)
    return fade(x * env_exp(len(t), 0.11), 0.004, 0.05) * amp * 0.7


def whoosh(dur=0.5, f0=600, f1=3000, amp=0.3, **_):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    sweep = np.geomspace(f0, f1, n)
    x = svf(noise, sweep, q=1.4)
    shape = np.sin(np.pi * np.linspace(0, 1, n) ** 0.8) ** 1.6  # swells in, tails out
    return fade(x * shape, 0.01, 0.05) * amp * 2.2


def scratch(dur=0.4, amp=0.05, **_):
    n = int(dur * SR)
    x = svf(rng.standard_normal(n), 4200, q=2.5)
    wob = 0.6 + 0.4 * np.sin(2 * np.pi * 9 * np.arange(n) / SR)
    return fade(x * wob, 0.03, 0.08) * amp * 3


def shimmer(dur=0.8, amp=0.2, rise=False, **_):
    t = t_(dur)
    parts = [2637.0, 3136.0, 3951.1, 5274.0, 6271.9]
    x = sum(np.sin(2 * np.pi * p * (1 + (0.04 * t / dur if rise else 0)) * t + rng.uniform(0, 6.28)) * (0.8 ** i) for i, p in enumerate(parts))
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * 11 * t)
    air = svf(rng.standard_normal(len(t)), 7000, q=0.8) * 0.4
    shape = np.minimum(1, t / (dur * (0.7 if rise else 0.15))) * np.exp(-np.maximum(0, t - dur * (0.7 if rise else 0.15)) / (dur * 0.35))
    return fade((x * 0.25 + air) * shape, 0.01, 0.08) * amp


def bloom(dur=1.2, freq=55, amp=0.3, **_):
    t = t_(dur)
    x = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)
    shape = np.minimum(1, t / 0.25) * np.exp(-np.maximum(0, t - 0.25) / 0.4)
    return fade(x * shape, 0.02, 0.1) * amp


def glass(amp=0.25, **_):
    t = t_(0.9)
    x = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(1567.98, 1), (2349.3, 0.6), (3520.0, 0.35), (4186.0, 0.2)])
    return fade(x * env_exp(len(t), 0.22), 0.002, 0.1) * amp * 0.5


def suck(dur=0.6, amp=0.3, **_):
    n = int(dur * SR)
    x = svf(rng.standard_normal(n), np.geomspace(800, 6000, n), q=1.2)
    shape = np.linspace(0, 1, n) ** 2.4  # reverse-swell: builds, stops dead
    return fade(x * shape, 0.02, 0.006) * amp * 2


def swell(dur=1.4, freqs=(261.63, 329.63, 392.0), amp=0.2, **_):
    t = t_(dur)
    x = np.zeros(len(t))
    for f in freqs:
        for det in (-0.004, 0.004):
            ph = 2 * np.pi * f * (1 + det) * t
            x += np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.1 * np.sin(3 * ph)
    x /= len(freqs) * 2
    x = svf(x, np.linspace(500, 5000, len(t)), q=0.6, mode="lp")
    shape = np.minimum(1, t / (dur * 0.35)) * np.exp(-np.maximum(0, t - dur * 0.35) / (dur * 0.45))
    return fade(x * shape, 0.02, 0.2) * amp * 1.4


def thud(amp=0.5, **_):
    t = t_(0.6)
    f = 95 * np.exp(-t / 0.08) + 48
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(len(t), 0.18)
    k = tick(900, 0.25)
    x[: len(k)] += k
    return fade(x, 0.001, 0.08) * amp


def zip_(dur=0.45, amp=0.14, **_):
    return whoosh(dur, 2500, 7000, amp)


def snap(amp=0.4, **_):
    """An element locking into place: low magnetic body + wooden tock + a tiny click, with a faint second contact."""
    t = t_(0.25)
    f = 210 * np.exp(-t / 0.04) + 125
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(len(t), 0.07)
    tock = svf(rng.standard_normal(len(t)), 1400, q=3) * env_exp(len(t), 0.012) * 1.6
    x = body + tock
    k = tick(4200, 0.18)
    x[: len(k)] += k
    echo = int(0.055 * SR)
    x[echo:] += (body * 0.22)[: len(x) - echo]
    return fade(x, 0.001, 0.05) * amp


def air(dur=0.45, amp=0.2, **_):
    """A soft camera pass: low-passed air that opens and closes, no hiss."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    cutoff = 450 + 1700 * np.sin(np.pi * u) ** 1.5
    x = svf(rng.standard_normal(n), cutoff, q=0.6, mode="lp")
    shape = np.sin(np.pi * u ** 0.9) ** 2
    return fade(x * shape, 0.01, 0.04) * amp * 2.4


def silk(dur=0.36, amp=0.2, **_):
    """A soft, high swipe — like fabric or paper sliding. No low end, no hit."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    x = svf(rng.standard_normal(n), 2600 + 4400 * u ** 0.7, q=0.9)
    shape = np.minimum(1, u / 0.35) ** 1.5 * np.exp(-np.maximum(0, u - 0.35) / 0.25)
    return fade(x * shape, 0.01, 0.06) * amp * 2.6


def vortex(dur=1.5, amp=0.26, **_):
    """Air spinning faster and faster: gently band-passed noise (low Q, capped at 3.5 kHz — no whistle),
    an accelerating flutter, circling the stereo field. Builds to the collapse, then cuts."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    air = svf(rng.standard_normal(n), 300 * (3500 / 300) ** (u ** 1.3), q=0.7)
    flutter = 0.55 + 0.45 * np.sin(np.cumsum(2 * np.pi * (3 + 15 * u ** 1.5) / SR))
    x = fade(air * flutter * 2.4 * u ** 1.6, 0.02, 0.012)
    orbit = np.cumsum(2 * np.pi * (0.5 + 5.5 * u ** 1.5) / SR)
    gl, gr = pan_gains(np.sin(orbit) * 0.8)
    return np.stack([x * gl, x * gr]) * amp


KINDS = dict(tick=tick, click=click, blip=blip, whoosh=whoosh, scratch=scratch, shimmer=shimmer, bloom=bloom, glass=glass, suck=suck, swell=swell, thud=thud, zip=zip_, snap=snap, air=air, silk=silk, vortex=vortex)


# ── Render ──────────────────────────────────────────────────────────
def pan_gains(p):
    a = (p + 1) * np.pi / 4
    return np.cos(a), np.sin(a)


def render():
    n = int(DURATION / FPS * SR) + SR * 2
    L = np.zeros(n)
    R = np.zeros(n)
    for frame, kind, p in CUES:
        x = KINDS[kind](**p)
        s = int(frame / FPS * SR)
        if x.ndim == 2:  # instrument already rendered in stereo
            e = min(n, s + x.shape[1])
            L[s:e] += x[0, : e - s]
            R[s:e] += x[1, : e - s]
            continue
        e = min(n, s + len(x))
        seg = x[: e - s]
        if "pan0" in p:
            ramp = np.linspace(p["pan0"], p["pan1"], len(seg))
            gl, gr = pan_gains(ramp)
        else:
            gl, gr = pan_gains(np.float64(p.get("pan", 0)))
        L[s:e] += seg * gl
        R[s:e] += seg * gr

    # Short, airy room (synthetic IR) for polish
    ir_t = t_(1.1)
    ir = rng.standard_normal((2, len(ir_t))) * np.exp(-ir_t / 0.28)
    ir[:, : int(0.012 * SR)] = 0
    wetL = fftconvolve(L, ir[0])[:n]
    wetR = fftconvolve(R, ir[1])[:n]
    wet_gain = 0.16 / np.max(np.abs(np.concatenate([wetL, wetR])) + 1e-9) * np.max(np.abs(np.concatenate([L, R])))
    L = L + wetL * wet_gain
    R = R + wetR * wet_gain

    out = np.stack([L, R], axis=1)[: int(DURATION / FPS * SR)]
    out *= 10 ** (-12 / 20) / np.max(np.abs(out))  # peak −12 dBFS, headroom for the music
    os.makedirs("out/audio", exist_ok=True)
    wavfile.write("out/audio/sfx-stem.wav", SR, out.astype(np.float32))
    print(f"wrote out/audio/sfx-stem.wav  {len(out) / SR:.2f}s  {len(CUES)} cues")


if __name__ == "__main__":
    render()
