/**
 * Minimal ZIP writer — Assembl
 * Version: 0.1.0 · 2026-04-09
 *
 * Implements ZIP format (PKZIP spec) using Node.js built-in modules only.
 * No external dependencies — pure Node.js crypto + zlib.
 *
 * Supports: DEFLATE compression (method 8) + STORED (method 0).
 * Supports: multiple files, correct local + central directory + EOCD structure.
 *
 * Not for general use — purpose-built for the evidence pack generator.
 * Produces valid ZIPs readable by all standard unzip tools.
 */

import { deflateRawSync, crc32 as zlibCrc32 } from 'zlib';

export type ZipEntry = {
  name: string;      // file path in zip, e.g. 'cover.pdf'
  data: Buffer;
  compress?: boolean; // default true; false = STORE (no compression)
};

/**
 * Build a ZIP archive from an array of entries.
 * Returns the complete ZIP as a Buffer.
 */
export function buildZip(entries: ZipEntry[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  const localOffsets: number[] = [];
  let offset = 0;

  const dosTime = dosDateTime(new Date());

  for (const entry of entries) {
    localOffsets.push(offset);

    const nameBytes = Buffer.from(entry.name, 'utf-8');
    const compress = entry.compress !== false;

    // CRC32 of uncompressed data
    const crc = zlibCrc32(entry.data) as unknown as number;
    const uncompressedSize = entry.data.length;

    // Compress or store
    const compressedData = compress ? deflateRawSync(entry.data, { level: 6 }) : entry.data;
    const compressedSize = compressedData.length;
    const method = compress ? 8 : 0;  // 8 = DEFLATE, 0 = STORE

    // Local file header: signature + 26 bytes fixed + name + data
    const localHeader = Buffer.alloc(30 + nameBytes.length);
    localHeader.writeUInt32LE(0x04034b50, 0);   // Local file header signature
    localHeader.writeUInt16LE(20, 4);            // Version needed to extract (2.0)
    localHeader.writeUInt16LE(0, 6);             // General purpose bit flag
    localHeader.writeUInt16LE(method, 8);        // Compression method
    localHeader.writeUInt16LE(dosTime.time, 10); // Last mod file time
    localHeader.writeUInt16LE(dosTime.date, 12); // Last mod file date
    localHeader.writeUInt32LE(crc >>> 0, 14);    // CRC-32
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(nameBytes.length, 26); // Filename length
    localHeader.writeUInt16LE(0, 28);               // Extra field length
    nameBytes.copy(localHeader, 30);

    const localRecord = Buffer.concat([localHeader, compressedData]);
    localHeaders.push(localRecord);
    offset += localRecord.length;

    // Central directory header
    const centralHeader = Buffer.alloc(46 + nameBytes.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);  // Central dir signature
    centralHeader.writeUInt16LE(20, 4);           // Version made by
    centralHeader.writeUInt16LE(20, 6);           // Version needed
    centralHeader.writeUInt16LE(0, 8);            // Bit flag
    centralHeader.writeUInt16LE(method, 10);      // Compression method
    centralHeader.writeUInt16LE(dosTime.time, 12);
    centralHeader.writeUInt16LE(dosTime.date, 14);
    centralHeader.writeUInt32LE(crc >>> 0, 16);
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(nameBytes.length, 28);
    centralHeader.writeUInt16LE(0, 30);           // Extra field length
    centralHeader.writeUInt16LE(0, 32);           // File comment length
    centralHeader.writeUInt16LE(0, 34);           // Disk number start
    centralHeader.writeUInt16LE(0, 36);           // Internal file attributes
    centralHeader.writeUInt32LE(0, 38);           // External file attributes
    centralHeader.writeUInt32LE(localOffsets[localOffsets.length - 1], 42); // Relative offset
    nameBytes.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
  }

  const centralDir = Buffer.concat(centralHeaders);
  const centralDirOffset = offset;
  const centralDirSize = centralDir.length;

  // End of central directory record
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);    // EOCD signature
  eocd.writeUInt16LE(0, 4);             // Disk number
  eocd.writeUInt16LE(0, 6);             // Disk with central dir
  eocd.writeUInt16LE(entries.length, 8);    // Entries on this disk
  eocd.writeUInt16LE(entries.length, 10);   // Total entries
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20);            // Comment length

  return Buffer.concat([...localHeaders, centralDir, eocd]);
}

/** Parse a ZIP and return the raw bytes for each file — for testing. */
export function readZipEntry(zipBytes: Buffer, name: string): Buffer | null {
  // Locate EOCD
  const eocdSig = 0x06054b50;
  let eocdPos = zipBytes.length - 22;
  while (eocdPos >= 0) {
    if (zipBytes.readUInt32LE(eocdPos) === eocdSig) break;
    eocdPos--;
  }
  if (eocdPos < 0) return null;

  const cdOffset = zipBytes.readUInt32LE(eocdPos + 16);
  const cdEntries = zipBytes.readUInt16LE(eocdPos + 10);

  let pos = cdOffset;
  for (let i = 0; i < cdEntries; i++) {
    if (zipBytes.readUInt32LE(pos) !== 0x02014b50) break;
    const nameLen = zipBytes.readUInt16LE(pos + 28);
    const extraLen = zipBytes.readUInt16LE(pos + 30);
    const commentLen = zipBytes.readUInt16LE(pos + 32);
    const entryName = zipBytes.slice(pos + 46, pos + 46 + nameLen).toString('utf-8');
    const localOffset = zipBytes.readUInt32LE(pos + 42);

    if (entryName === name) {
      // Read from local file header
      const localNameLen = zipBytes.readUInt16LE(localOffset + 26);
      const localExtraLen = zipBytes.readUInt16LE(localOffset + 28);
      const dataOffset = localOffset + 30 + localNameLen + localExtraLen;
      const compressedSize = zipBytes.readUInt32LE(localOffset + 18);
      const uncompressedSize = zipBytes.readUInt32LE(localOffset + 22);
      const method = zipBytes.readUInt16LE(localOffset + 8);
      const compressedData = zipBytes.slice(dataOffset, dataOffset + compressedSize);

      if (method === 0) return compressedData;
      if (method === 8) {
        const { inflateRawSync } = require('zlib') as typeof import('zlib');
        return inflateRawSync(compressedData, { maxOutputLength: uncompressedSize + 1 });
      }
      return null;
    }

    pos += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}

/** Convert a JS Date to MS-DOS format time/date fields. */
function dosDateTime(d: Date): { time: number; date: number } {
  const time = ((d.getHours() & 0x1f) << 11) | ((d.getMinutes() & 0x3f) << 5) | ((d.getSeconds() >> 1) & 0x1f);
  const date = (((d.getFullYear() - 1980) & 0x7f) << 9) | (((d.getMonth() + 1) & 0x0f) << 5) | (d.getDate() & 0x1f);
  return { time, date };
}
