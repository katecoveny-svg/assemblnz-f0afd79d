import { zipSync } from 'fflate';

/** ZIP DOS dates have no timezone. Supply fixed local calendar fields, not a UTC instant. */
export function developmentPluginZip(files) {
  const entries = Object.fromEntries(Object.keys(files).sort().map(name => {
    const bytes = files[name];
    if (!(bytes instanceof Uint8Array)) throw new TypeError('Archive content must be bytes');
    return [name, [bytes, { mtime: new Date(2026, 0, 1, 0, 0, 0) }]];
  }));
  return zipSync(entries, { level: 6 });
}
