#!/usr/bin/env python3
"""Contrast gate for assembl demonstrators.

Why this exists: pale palettes on paper white fail WCAG quietly. Two independent
builds of this system shipped colours that looked fine and measured 4.05:1 — including
one the design system itself described as "text-safe". The eye cannot do this job.
Run this instead of judging by sight.

Usage:
    python3 check_contrast.py path/to/tokens.css [more.css ...]

It reads every `--token: #hex` declaration, measures each against --paper,
--paper-raised and --paper-sunk, and reports pass/fail against the AA thresholds.

Tokens whose names end in -line, -wash, -sunk, -raised, or that are named --rule,
--chrome*, or bare --seaglass, are treated as non-text (shapes, strokes, fills) and
only need 3:1 as UI components. Everything else is assumed to carry type and needs
4.5:1. If you add a token that carries type, do not name it -line.

Exit code 1 if any token fails, so it can sit in CI.
"""
import re
import sys

AA_TEXT = 4.5      # normal text
AA_LARGE = 3.0     # 18.66px+ bold or 24px+, and UI components / graphical objects

NON_TEXT_SUFFIXES = ('-line',)
NON_TEXT_EXACT = {'--chrome-deep', '--bp-ink-3'}

# Purely decorative: hairlines, tints and washes that carry no information on their
# own. WCAG 1.4.11 covers components you must be able to *identify*; a divider or a
# background tint isn't one, so measuring them produces noise, not signal.
DECORATIVE_SUFFIXES = ('-wash', '-sunk', '-raised')
DECORATIVE_EXACT = {"--rule", "--seaglass", "--chrome", "--accent", "--bp-grid", "--bp-wash"}

SURFACES = ('--paper', '--paper-raised', '--paper-sunk')


def _lin(c):
    c /= 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_colour):
    h = hex_colour.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def classify(name):
    """text (4.5:1) · shape (3:1) · decorative (exempt)"""
    if name in DECORATIVE_EXACT or name.endswith(DECORATIVE_SUFFIXES):
        return 'decorative'
    if name in NON_TEXT_EXACT or name.endswith(NON_TEXT_SUFFIXES):
        return 'shape'
    return 'text'


def parse(paths):
    tokens = {}
    pattern = re.compile(r'(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{3,8})\s*;')
    for path in paths:
        with open(path, encoding='utf-8') as fh:
            for name, value in pattern.findall(fh.read()):
                tokens.setdefault(name, value)
    return tokens


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2

    tokens = parse(argv[1:])
    surfaces = {s: tokens[s] for s in SURFACES if s in tokens}
    if not surfaces:
        print('No --paper* surface tokens found. Nothing to measure against.')
        return 2

    failures = []
    print(f'{"token":22} {"value":9} ' + ' '.join(f'{s.replace("--paper", "paper"):>13}' for s in surfaces))
    print('-' * (32 + 14 * len(surfaces)))

    for name, value in sorted(tokens.items()):
        if name in surfaces:
            continue
        kind = classify(name)
        threshold = {'text': AA_TEXT, 'shape': AA_LARGE}.get(kind)
        cells, worst = [], None
        for sv in surfaces.values():
            r = ratio(value, sv)
            worst = r if worst is None else min(worst, r)
            mark = '    ' if threshold is None else ('ok  ' if r >= threshold else 'FAIL')
            cells.append(f'{r:>9.2f} {mark}')
        need = '—' if threshold is None else threshold
        print(f'{name:22} {value:9} ' + ' '.join(cells) + f'   [{kind} · needs {need}]')
        if threshold is not None and worst < threshold:
            failures.append((name, value, worst, threshold, kind))

    print()
    if failures:
        print(f'{len(failures)} token(s) below threshold:')
        for name, value, worst, threshold, kind in failures:
            print(f'  {name} ({value}) — {worst:.2f}:1, needs {threshold}:1 as {kind}')
        print('\nFix the token, or rename it with a -line suffix if it genuinely only')
        print('draws shapes and a text-safe sibling exists.')
        return 1

    print('All tokens pass.')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
