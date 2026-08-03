#!/usr/bin/env python3
"""Render every vertical page from one template.

A new vertical is a data file plus a parts manifest. Nothing in the page markup is
per-client, so keeping three near-identical HTML files in sync by hand is exactly the
kind of drift this project is supposed to prevent. Edit templates/vertical.tmpl.html.

    python3 build-verticals.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent

VERTICALS = [
    # page dir,        data file,     manifest module, manifest export
    ('lending',        'lending',     'vault',         'vault'),
    ('retirement',     'retirement',  'villa',         'villa'),
    ('automotive',     'automotive',  'motorcar',      'motorcar'),
    ('airline',        'airline',     'aircraft',      'aircraft'),
    ('mealkit',        'mealkit',     'scale',         'scale'),
    ('energy',         'energy',      'meter',         'meter'),
]


def build():
    tmpl = (ROOT / 'templates' / 'vertical.tmpl.html').read_text(encoding='utf-8')
    for page, data_id, module, export in VERTICALS:
        data = json.loads((ROOT / 'data' / f'{data_id}.json').read_text(encoding='utf-8'))
        html = (tmpl
                .replace('__MANIFEST_EXPORT__', export)
                .replace('__MANIFEST_MODULE__', module)
                .replace('__DATA__', data_id)
                .replace('__SECTOR__', data['client']['sector'])
                .replace('__DESCRIPTION__', data['proposition'].replace('"', '&quot;')))
        out = ROOT / 'verticals' / page / 'index.html'
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html, encoding='utf-8')
        print(f'{out.relative_to(ROOT)}  ({data["client"]["name"]} · {export})')


if __name__ == '__main__':
    build()
