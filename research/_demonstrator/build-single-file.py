#!/usr/bin/env python3
"""Bundle one vertical into a single self-contained .html that opens from file://.

Why this exists: the source is modular on purpose — shared engine, shared tokens, all
copy in a data file — which is what makes the next vertical cheap. But ES modules and
fetch() are blocked on file://, so the modular version needs a static server. That is
one line for you and one line too many for a prospect who has been emailed a link.

This produces a share copy: same code, everything inlined, opens by double-click.
Keep editing the modular source; re-run this before you send anything.

    python3 build-single-file.py lending
    python3 build-single-file.py lending --out ~/Desktop/nectar-demo.html
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent


def inline_css(html: str) -> str:
    def sub(match):
        href = match.group(1)
        path = (ROOT / href.replace('../../', '')).resolve()
        return f'<style>\n{path.read_text(encoding="utf-8")}\n</style>'
    return re.sub(r'<link rel="stylesheet" href="([^"]+)">', sub, html)


EXPORT_RE = re.compile(r"^export\s+(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)",
                       re.MULTILINE)


def strip_module(source: str) -> str:
    """Drop import statements and the `export` keyword from an ES module body.

    Imports must be matched across newlines — a multi-line `import { a, b }\nfrom
    './x.js'` slipped through a single-line regex and produced a bundle that only
    threw at runtime, which is exactly what a build script should catch instead.
    """
    source = re.sub(r"^import\s+[\s\S]*?\s+from\s+['\"][^'\"]+['\"];?",
                    '', source, flags=re.MULTILINE)
    source = re.sub(r"^import\s+['\"][^'\"]+['\"];?", '', source, flags=re.MULTILINE)
    return re.sub(r'^export\s+', '', source, flags=re.MULTILINE)


def wrap_module(path, available=()):
    """Wrap one module in its own scope and publish only its exports.

    Concatenating modules into one script re-declares every shared private helper —
    two modules both defining `clamp01` is a SyntaxError that kills the whole page.
    Real bundlers give each module a closure; so does this.
    """
    src = path.read_text(encoding='utf-8')
    names = EXPORT_RE.findall(src)
    body = strip_module(src)

    # Pull in what earlier modules published, but never a name this module declares
    # itself — injecting `const { clamp01 } = __M` into a file that defines its own
    # clamp01 is the same redeclaration error in a new hat.
    declared = set(re.findall(r'^\s*(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)',
                              body, re.MULTILINE))
    needed = [n for n in available if n not in declared and re.search(rf'\b{re.escape(n)}\b', body)]
    unpack = f'const {{ {", ".join(needed)} }} = __M;\n' if needed else ''

    published = ', '.join(names)
    return (f'\n/* ── {path.name} ─────────────────────────────── */\n'
            f';(function () {{\n{unpack}{body}\n'
            f'Object.assign(__M, {{ {published} }});\n}})();\n'), names


def build(vertical: str, out: Path | None) -> Path:
    page = ROOT / 'verticals' / vertical / 'index.html'
    html = page.read_text(encoding='utf-8')
    data = json.loads((ROOT / 'data' / f'{vertical}.json').read_text(encoding='utf-8'))

    html = inline_css(html)
    data_id = vertical

    manifest_file = {'lending': 'vault', 'retirement': 'villa', 'automotive': 'motorcar', 'airline': 'aircraft', 'mealkit': 'scale'}[vertical]
    mods = [ROOT / 'scripts' / f'{n}.js' for n in
            ('material', 'parts', 'journey', 'blueprint', 'brand', 'sheet')]
    mods.append(ROOT / 'scripts' / 'parts' / f'{manifest_file}.js')
    chunks, exported = [], []
    for m in mods:
        chunk, names = wrap_module(m, tuple(exported))
        chunks.append(chunk)
        exported.extend(names)
    modules = 'const __M = {};\n' + ''.join(chunks)
    unpack = 'const { ' + ', '.join(sorted(set(exported))) + ' } = __M;'

    # the page script: swap the fetch for the literal data, drop the module imports
    body = re.search(r'<script type="module">(.*?)</script>\s*</body>', html, re.S)
    if not body:
        raise SystemExit(f'No module script found in {page}')
    page_script = strip_module(body.group(1))
    page_script = re.sub(
        r"const data = await fetch\(.*?\.json\(\)\);",
        lambda _: f'const data = {json.dumps(data, ensure_ascii=False)};',
        page_script,
        flags=re.S,
    )
    for guard, msg in (('import ', 'an import survived bundling'),
                       ('await ', 'a top-level await survived bundling')):
        if guard in page_script:
            raise SystemExit(f'{msg} — check strip_module against the page script.')
    if False:
        raise SystemExit(
            'A top-level await survived bundling — the data fetch was not replaced. '
            'Check the fetch pattern in the vertical page against the regex above.'
        )

    bundled = (
        '<script>\n'
        '/* single-file build — generated by build-single-file.py.\n'
        '   Edit the modular source, not this file. */\n'
        f'{modules}\n'
        '(function () {\n'
        f'{unpack}\n'
        f'{page_script}\n'
        '})();\n'
        '</script>\n</body>'
    )
    html = html[:body.start()] + bundled + html[body.end():]

    # relative links back to the hub have nowhere to go in a single file
    html = html.replace('href="../../index.html"', 'href="#" aria-disabled="true"')

    out = out or (ROOT / 'dist' / f'assembl-{vertical}.html')
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('vertical')
    ap.add_argument('--out', type=Path)
    args = ap.parse_args()
    written = build(args.vertical, args.out)
    print(f'{written}  ({written.stat().st_size / 1024:.0f} KB) — opens from file://')
