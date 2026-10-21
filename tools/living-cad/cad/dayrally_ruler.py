"""
dayrally ruler — a scale on the lid, a 35 cm fish ruler from the long pod, and a 15 cm ruler piece. Proposed, unprinted.

The lid scale (`dayrally2.ruler_cs`, lid style "ruler") is a 0.6 mm flush inlay in the second colour, like the dots
and the name: half-centimetre ticks and centimetre numbers, 0 at the lid's own end. Every pod size gets it:
9.2 cm on the mini, 12.8 on the standard and tall, 17.6 on the long.

The fish ruler is the long pod itself. Its lid reads 0 to 17.6 cm; its base carries raised marks on the outer
wall from 17.6 to 35.2 cm. Open the pod, lay the lid on the wharf end to end with the base, and the two ends
touching are one 35 cm rule with nothing extra to carry. The datum is the stadium's own apex: both ends are
r = 36 mm arcs, so pushing them together along the line registers them, and sliding sideways costs almost
nothing (10 mm of sideways slop reads 0.7 mm short; 5 mm reads 0.2 mm short). No legal fish sizes are marked:
they differ by area and change; the rule measures, the regulations decide.

The 15 cm ruler is a 150 × 10 × 2 mm piece with engraved millimetre ticks that lives in one of the long pod's
two middle pen slots (157 mm long), so the school kit carries a ruler.

Marks and numbers are starting points for the first print: check the scale against a steel rule.
"""
import math
import os
import manifold3d as m3d
import lib
import dayrally2 as d2
from lib import M, CS, ext_z, ext_y, rrect, text_cs, EPS

FONT = d2.RULER_FONT
RAISE = 0.6              # raised marks on the base wall
ENGRAVE = 0.4            # engraved marks on the ruler piece


def fish_base(size="long"):
    """The long pod base with raised marks on its -y wall continuing the lid scale: 17.6 cm at the -x apex to 35.2 at
    the +x apex. Centimetre ribs 10 mm tall, half-centimetre ribs 6 mm, numbers 19 to 34 below them where the wall
    is within 45 degrees of flat (18 and 35 are ribs only; the wall is too steep there for a number to read)."""
    L, W, H, ZT = d2.dims(size)
    base = d2.pod_base(size)
    offset_mm = L                       # the lid's own length is where the base scale starts
    marks = None
    numbers = None
    for i in range(0, int(L) + 1):
        v = offset_mm + i                # value in mm at x = -L/2 + i
        if v % 5:
            continue
        x = -L / 2 + i
        if abs(x) > L / 2 - 2.0:
            continue
        cm = v % 10 == 0
        w, h = (1.4, 10.0) if cm else (1.0, 6.0)
        t = CS.square([w, h], center=True).translate([x, ZT - 3.0 - h / 2])
        marks = t if marks is None else marks + t
        if cm and abs(x) <= (L - W) / 2 + (W / 2) * math.sin(math.radians(45)):
            n = text_cs(str(v // 10), FONT, cap_height=5.0).translate([x, ZT - 19.0])
            numbers = n if numbers is None else numbers + n
    cs = marks + numbers
    band = ext_z(d2.stadium(L + 2 * RAISE, W + 2 * RAISE), ZT - 24.0, ZT) - ext_z(d2.stadium(L - 0.2, W - 0.2), ZT - 25.0, ZT + 1)
    raised = ext_y(cs, -W / 2 - RAISE - 1.0, 0.0) ^ band
    return base + raised


def ruler_150(length=150.0, width=10.0, t=2.0):
    """A 15 cm ruler that fits a long pod pen slot. 0 is the left end. Millimetre ticks engraved 0.4 mm into the top:
    2 mm ticks every millimetre, 3 mm at the half centimetre, 4.5 mm at the centimetre with the number above."""
    body = ext_z(rrect(length, width, 1.5), 0, t)
    x0 = -length / 2
    cs = None
    for i in range(0, int(length) + 1):
        if i % 10 == 0:
            w, h = 0.7, 4.5
        elif i % 5 == 0:
            w, h = 0.6, 3.0
        else:
            w, h = 0.5, 2.0
        tick = CS.square([w, h], center=True).translate([x0 + i, -width / 2 + h / 2])
        cs = tick if cs is None else cs + tick
    for i in range(10, int(length), 10):
        cs = cs + text_cs(str(i // 10), FONT, cap_height=2.8).translate([x0 + i, 2.3])
    cs = cs + text_cs("cm", FONT, cap_height=2.4).translate([length / 2 - 5.0, 2.3])
    cs = cs ^ rrect(length - 0.8, width - 0.8, 1.2)       # keep the engraving off the edge
    return body - ext_z(cs, t - ENGRAVE, t + 1)


PARTS = {
    "ruler-pod-long-fish": ("dayrally pod, long, fish ruler base", fish_base, "as_is", "pod",
                            "The long pod with raised marks 17.6 to 35.2 cm on its outer wall; with the ruler lid end to end it is a 35 cm rule. Floor is a TURN flange."),
    "ruler-150": ("Ruler, 15 cm", ruler_150, "as_is", "add-on", "Prints flat, marks up. Lives in a long pod pen slot."),
}
