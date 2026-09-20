import { MEDIA_RULES } from '../../core/config/api.config';

export interface FileRejection {
  fileName: string;
  reason: string;
}

/** Bytes to a human string, to one decimal — so a rejection can name the real size. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

/**
 * The browser-side half of the platform's upload rules. It runs before a byte goes out, in
 * the same order the Media service checks: declared type, size, then the real first bytes.
 * The service checks all of it again — this is a courtesy, not the enforcement.
 */
export async function validateImageFile(file: File): Promise<string | null> {
  const accepted = MEDIA_RULES.acceptedTypes as readonly string[];

  if (!file.type.startsWith('image/') || !accepted.includes(file.type)) {
    return `${file.name} isn't an image. Upload a JPEG, PNG or WebP.`;
  }
  if (file.size > MEDIA_RULES.maxBytes) {
    return `${file.name} is ${formatBytes(file.size)}. Images must be 2 MB or smaller.`;
  }
  if (!(await hasImageSignature(file))) {
    return `${file.name} doesn't look like a real image file.`;
  }
  return null;
}

/**
 * Reads the first twelve bytes and confirms the signature. A .pdf renamed to .jpg usually
 * reports the wrong MIME type anyway, but a crafted one does not — this catches it locally
 * instead of after a two-second upload.
 */
async function hasImageSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (bytes.length < 12) {
    return false;
  }

  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png =
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';

  return jpeg || png || webp;
}
