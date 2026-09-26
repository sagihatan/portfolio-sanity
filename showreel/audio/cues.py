"""Frame-accurate sound cues for the story cut (60fps, 1038 frames).

Frames mirror src/lib/timeline.ts and the scene files; keep them in sync if the picture changes.
Each cue: (frame, kind, params).
"""

FPS = 60
DURATION = 1362

# Tour (timeline.ts): T, PAN_IN = 8, PAN_OUT = 10
T = [518, 584, 650, 716, 782]
PAN_IN, PAN_OUT = 8, 10
END_FROM = 962  # PortraitEnd local 0
HEADLINE_FROM = 972
ZOOM_OUT = 840
VORTEX = (900, 990)

CUES = []


def cue(frame, kind, **p):
    CUES.append((frame, kind, p))


# ── Ignition: pen tool draws the three slabs (SlabsStage DRAW + corner pops)
for start, end in [(10, 36), (40, 72), (76, 98)]:
    for t in (0, 0.14, 0.5, 0.64):
        cue(start + (end - start) * t, "tick", freq=2600, amp=0.35)
    cue(start, "scratch", dur=(end - start) / FPS, amp=0.05)

# Gradient floods each slab (FILL), selection box snaps, glint sweeps
for start, pan in [(34, 0.25), (66, 0.0), (92, -0.25)]:
    cue(start, "whoosh", dur=0.55, f0=1800, f1=5200, pan0=pan - 0.2, pan1=pan + 0.2, amp=0.22)
cue(104, "tick", freq=1800, amp=0.3)
cue(108, "shimmer", dur=0.8, amp=0.16)

# Deconstruct: layers explode into 3D, tags pop, slabs morph into panels
cue(128, "whoosh", dur=1.0, f0=300, f1=1400, pan0=-0.3, pan1=0.3, amp=0.34)
cue(132, "bloom", dur=1.2, freq=55, amp=0.28)
for f in (160, 166, 172):
    cue(f, "tick", freq=2100, amp=0.22)
for i, f in enumerate((196, 202, 208)):
    cue(f, "whoosh", dur=0.7, f0=900, f1=3200, pan0=-0.5 + i * 0.5, pan1=-0.3 + i * 0.5, amp=0.2)
cue(258, "glass", amp=0.26)

# Interfaces come alive: chips, cursor click, toast
for f in (282, 292, 302):
    cue(f, "tick", freq=3000, amp=0.2)
cue(312, "click", amp=0.35)
cue(374, "blip", freq=1318.5, amp=0.18)

# Panels collapse into the bar → block reveal "From idea to product."
cue(404, "suck", dur=0.7, amp=0.3)
cue(446, "whoosh", dur=0.3, f0=2500, f1=6000, pan0=0, pan1=0, amp=0.2)
cue(460, "whoosh", dur=0.4, f0=5000, f1=1600, pan0=-0.6, pan1=0.6, amp=0.17)
cue(500, "whoosh", dur=0.35, f0=1500, f1=4000, pan0=0, pan1=0, amp=0.12)

# Canvas tour: a soft silk swipe per camera move; each hand-off settles with a quiet glass ring.
# Same sounds every time — calm and deliberate, no hits, no melody.
cue(T[0] - 14, "silk", dur=0.45, amp=0.2, pan0=0, pan1=0)
cue(T[0] + PAN_OUT, "glass", amp=0.16)
for k in range(1, 5):
    cue(T[k] - PAN_IN - 2, "silk", dur=(PAN_IN + PAN_OUT) / FPS + 0.1, amp=0.24, pan0=0.45, pan1=-0.45)
    cue(T[k] + PAN_OUT, "glass", amp=0.16)

# Zoom-out to all five → the lift
cue(ZOOM_OUT - 4, "swell", dur=1.2, freqs=(261.63, 329.63, 392.0, 523.25), amp=0.22)
cue(ZOOM_OUT - 2, "whoosh", dur=0.7, f0=4000, f1=900, pan0=-0.4, pan1=0.4, amp=0.16)

# Vortex: everything spirals into one point, then releases "One designer. / Full coverage."
cue(VORTEX[0], "vortex", dur=(VORTEX[1] - VORTEX[0]) / FPS, amp=0.26)
# Each line gets its own entrance: a warm low bloom for "One designer." (also the collapse),
# then a light glass shimmer answering it for "Full coverage."
cue(VORTEX[1], "bloom", dur=1.6, freq=49, amp=0.55)
cue(HEADLINE_FROM + 50, "glass", amp=0.55)
cue(HEADLINE_FROM + 50, "shimmer", dur=0.9, amp=0.16)

# Portrait ending (PortraitEnd, local e): silk swipes only — same family as the service moves.
# Light and flowing; no pads, no tails, nothing on the logo.
cue(END_FROM + 158, "silk", dur=0.7, amp=0.09, pan0=-0.3, pan1=0.3)  # ring draws around
cue(END_FROM + 190, "silk", dur=0.6, amp=0.1, pan0=0, pan1=0)       # Sagi rises out of the circle
