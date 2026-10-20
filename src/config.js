import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export function makeConfig(overrides = {}) {
  const dataDir = path.resolve(
    overrides.dataDir || process.env.CHEMINTEL_DATA_DIR || process.env.LIT_DATA_DIR || path.join(ROOT, 'data'),
  );
  const cfg = {
    root: ROOT,
    dataDir,
    pdfDir: path.join(dataDir, 'pdfs'),
    tmpDir: path.join(dataDir, 'tmp'),
    backupDir: path.join(dataDir, 'backups'),
    publicDir: path.join(ROOT, 'public'),
    host: overrides.host || process.env.HOST || '127.0.0.1',
    port: Number(overrides.port ?? process.env.PORT ?? 3088),
    maxUploadBytes: Number(process.env.CHEMINTEL_MAX_UPLOAD_MB || process.env.LIT_MAX_UPLOAD_MB || 100) * 1024 * 1024,
    offline: overrides.offline ?? (process.env.CHEMINTEL_OFFLINE ?? process.env.LIT_OFFLINE) === '1',
  };
  for (const dir of [cfg.dataDir, cfg.pdfDir, cfg.tmpDir, cfg.backupDir]) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return cfg;
}
