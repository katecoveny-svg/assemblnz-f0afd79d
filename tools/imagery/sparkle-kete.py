"""Apply a warm-gold tint and a starburst-sparkle pass to the hero kete image
in-place, so it reads as the foreground element of the / and /about heroes.

Usage:  python3 tools/imagery/sparkle-kete.py
        (idempotent only at fixed RNG seed; re-running with the same seed
        produces the same composited PNG given the same input.)

Inputs:  public/images/hero-kete-totem.png   (1920x1080 RGB or RGBA)
Outputs: public/images/hero-kete-totem.png   (overwritten, RGBA)
"""

from PIL import Image, ImageDraw
import os, random

SRC = "public/images/hero-kete-totem.png"

# --- Tunables -----------------------------------------------------------------
TINT_R_MUL, TINT_R_ADD = 1.08, 12   # warm-gold cast: lift reds
TINT_G_MUL, TINT_G_ADD = 1.04,  8   # mild green lift (gold = R+G)
TINT_B_MUL, TINT_B_ADD = 0.82,  0   # pull blues for warmth

SEED            = 20260506
N_SPARKLES      = 90                # total sparkles to drop
BRIGHTNESS_MIN  = 105               # only place sparkles where source pixel
                                    #   is at least this bright (so they sit on
                                    #   the kete + bead nodes, not the background)
SAMPLE_FACTOR   = 30                # candidates_to_consider = N_SPARKLES * this
SIZE_CHOICES    = [3, 4, 5, 6, 7, 9, 11, 14]   # half-length of cross beams
SIZE_WEIGHTS    = [10, 14, 14, 12,  9, 6,  4,  2]   # smaller > larger

CORE_RGBA       = (255, 245, 210, 220)   # cream-gold center
BEAM_RGBA       = (255, 235, 195, 165)   # softer outer beam
RING_RGBA       = (252, 222, 165, 130)   # warm gold mid-ring


def gold_tint(src):
    """Warm-gold per-channel point transform."""
    r, g, b, a = src.split()
    r = r.point(lambda v: max(0, min(255, int(v * TINT_R_MUL + TINT_R_ADD))))
    g = g.point(lambda v: max(0, min(255, int(v * TINT_G_MUL + TINT_G_ADD))))
    b = b.point(lambda v: max(0, min(255, int(v * TINT_B_MUL + TINT_B_ADD))))
    return Image.merge("RGBA", (r, g, b, a))


def pick_sparkle_positions(img, n, threshold):
    """Random pixel positions weighted toward bright source pixels."""
    rng = random.Random(SEED)
    W, H = img.size
    pixels = img.load()
    chosen = []
    tries = 0
    max_tries = n * SAMPLE_FACTOR
    while len(chosen) < n and tries < max_tries:
        tries += 1
        x = rng.randrange(W)
        y = rng.randrange(H)
        r, g, b, _ = pixels[x, y]
        if (r + g + b) // 3 >= threshold:
            chosen.append((x, y, rng.choices(SIZE_CHOICES, SIZE_WEIGHTS, k=1)[0]))
    return chosen


def draw_sparkle(draw, x, y, s):
    """4-point sparkle: cross beams + soft radial center, additive feel."""
    # Outer beam (long, faint)
    draw.line([(x - s * 2, y), (x + s * 2, y)], fill=BEAM_RGBA, width=1)
    draw.line([(x, y - s * 2), (x, y + s * 2)], fill=BEAM_RGBA, width=1)
    # Inner beam (shorter, brighter)
    draw.line([(x - s, y), (x + s, y)], fill=CORE_RGBA, width=1)
    draw.line([(x, y - s), (x, y + s)], fill=CORE_RGBA, width=1)
    # Soft radial glow — rings of decreasing alpha
    for r in range(s, 0, -1):
        falloff = (1 - r / max(s, 1)) ** 2
        alpha = int(CORE_RGBA[3] * falloff)
        draw.ellipse([x - r, y - r, x + r, y + r],
                     fill=(CORE_RGBA[0], CORE_RGBA[1], CORE_RGBA[2], alpha))
    # Warm gold mid-ring at half radius
    if s >= 5:
        mr = max(1, s // 2)
        draw.ellipse([x - mr, y - mr, x + mr, y + mr], outline=RING_RGBA)


def main():
    if not os.path.exists(SRC):
        raise SystemExit(f"missing {SRC} — run from repo root")
    src = Image.open(SRC).convert("RGBA")
    src = gold_tint(src)
    positions = pick_sparkle_positions(src, N_SPARKLES, BRIGHTNESS_MIN)
    draw = ImageDraw.Draw(src, "RGBA")
    for (x, y, s) in positions:
        draw_sparkle(draw, x, y, s)
    src.save(SRC, "PNG", optimize=True)
    print(f"wrote {SRC} ({os.path.getsize(SRC)} bytes), "
          f"{len(positions)} sparkles, mode={src.mode}, size={src.size}")


if __name__ == "__main__":
    main()
