import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

export type UploadedTweetImage = {
  buffer: Buffer;
  mimetype: string;
};

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

export function ensureUploadsDir(): void {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

export function saveTweetImage(buffer: Buffer, mimetype: string): string {
  ensureUploadsDir();

  const ext = EXT_BY_MIME[mimetype] ?? '.jpg';
  const filename = `${randomUUID()}${ext}`;

  writeFileSync(join(UPLOADS_DIR, filename), buffer);

  return `/uploads/${filename}`;
}
