import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';

/**
 * Family Uploads — the server contract the Family OS UI calls to run the
 * upload + vision pipeline.
 *
 * uploadAndScan() puts the bytes in the PRIVATE `family-uploads` bucket, files a
 * `family_uploads` row ('processing'), then kicks the `family-vision` edge
 * function, which reads the file and proposes family_items (draft-only — nothing
 * is bought, paid or sent). listUploads() reads recent rows for the console.
 *
 * Privacy Act 2020 / IPP 3A: uploads may contain child data. The bucket is
 * private, all access here is service-role only, and rows + objects are purged
 * after 30 days (see 20260715090000_family_uploads.sql).
 *
 * Everything is fail-soft: no method throws — failures come back as
 * { ok: false, error } or an empty list.
 */

export type FamilyUploadKind = 'receipt' | 'fridge' | 'product' | 'newsletter' | 'video';

export type FamilyUpload = {
  id: string;
  hub: string;
  kind: FamilyUploadKind | null;
  storage_path: string | null;
  uploaded_by: string | null;
  status: 'processing' | 'reviewed' | 'done' | 'failed';
  trust: 'A' | 'B' | 'C' | null;
  summary: string | null;
  review: boolean;
  created_at: string;
};

const BUCKET = 'family-uploads';

// Per-kind accept lists + size caps (bytes). Images + pdf ≤ 15 MB; video ≤ 30 MB.
const IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);
const PDF_MIME = new Set(['application/pdf']);
const VIDEO_MIME = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

const MB = 1024 * 1024;
const IMAGE_PDF_CAP = 15 * MB;
const VIDEO_CAP = 30 * MB;

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};

function toBytes(input: Uint8Array | ArrayBuffer | Buffer): Uint8Array {
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  // Uint8Array (and Buffer, which extends it) — copy the viewed range.
  return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
}

function extFor(mime: string, name: string): string {
  if (EXT_BY_MIME[mime]) return EXT_BY_MIME[mime];
  const fromName = name.split('.').pop()?.toLowerCase();
  return fromName && fromName.length <= 5 ? fromName : 'bin';
}

/** Validate MIME + size against the per-kind rules. Returns an error string, or null if OK. */
function validate(mime: string, size: number): string | null {
  const type = (mime || '').toLowerCase();
  if (VIDEO_MIME.has(type)) {
    if (size > VIDEO_CAP) return 'Video is over 30MB — please trim to 30s / 720p and try again.';
    return null;
  }
  if (IMAGE_MIME.has(type) || PDF_MIME.has(type)) {
    if (size > IMAGE_PDF_CAP) return 'File is over 15MB — please use a smaller photo or PDF.';
    return null;
  }
  return `Unsupported file type "${mime}". Use a photo (png/jpg/webp/heic), a PDF, or a short video (mp4/mov/webm).`;
}

/**
 * Upload bytes to the private bucket, file a family_uploads row, and trigger the
 * family-vision function. Fail-soft: returns { ok:false, error } on any failure.
 */
export async function uploadAndScan(input: {
  file: { bytes: Uint8Array | ArrayBuffer | Buffer; name: string; type: string };
  kind: FamilyUploadKind;
  hub?: string;
  uploadedBy?: string;
}): Promise<{ ok: boolean; uploadId?: string; error?: string }> {
  const hub = input.hub ?? 'demo';
  const uploadedBy = input.uploadedBy ?? null;

  try {
    const bytes = toBytes(input.file.bytes);
    const size = bytes.byteLength;
    const mime = input.file.type || 'application/octet-stream';

    const invalid = validate(mime, size);
    if (invalid) return { ok: false, error: invalid };

    const sb = getServiceClient();

    // Path: <hub>/<yyyymm>/<uuid>.<ext>
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const id = crypto.randomUUID();
    const path = `${hub}/${yyyymm}/${id}.${extFor(mime, input.file.name)}`;

    // 1. Upload the bytes.
    const { error: upErr } = await sb.storage.from(BUCKET).upload(path, bytes, {
      contentType: mime,
      upsert: false,
    });
    if (upErr) return { ok: false, error: `Upload failed: ${upErr.message}` };

    // 2. File the row ('processing').
    const { data: row, error: rowErr } = await sb
      .from('family_uploads')
      .insert({
        hub,
        kind: input.kind,
        storage_path: path,
        uploaded_by: uploadedBy,
        status: 'processing',
      })
      .select('id')
      .single();
    if (rowErr || !row) {
      return { ok: false, error: `Could not record the upload: ${rowErr?.message ?? 'no row'}` };
    }
    const uploadId = row.id as string;

    // 3. Kick the family-vision function (service-role auth). Errors here don't
    //    fail the upload — the row rests 'processing' and can be retried.
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (base && key) {
      try {
        await fetch(`${base}/functions/v1/family-vision`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            apikey: key,
          },
          body: JSON.stringify({ path, kind: input.kind, hub, uploadedBy, uploadId }),
          signal: AbortSignal.timeout(30_000),
        });
      } catch (e) {
        // Fail-soft: the upload succeeded; the scan can be retried.
        console.error('[family/uploads] family-vision trigger failed:', e);
      }
    }

    return { ok: true, uploadId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'upload failed' };
  }
}

/** Recent family_uploads rows for a hub. Fail-soft: returns []. */
export async function listUploads(hub = 'demo', limit = 50): Promise<FamilyUpload[]> {
  try {
    const sb = getServiceClient();
    const { data } = await sb
      .from('family_uploads')
      .select('*')
      .eq('hub', hub)
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data ?? []) as FamilyUpload[];
  } catch {
    return [];
  }
}
