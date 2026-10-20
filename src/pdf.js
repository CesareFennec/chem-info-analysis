import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const require = createRequire(import.meta.url);
const PDFJS_ROOT = path.dirname(require.resolve('pdfjs-dist/package.json'));
const STANDARD_FONTS = path.join(PDFJS_ROOT, 'standard_fonts') + path.sep;

const LIGATURES = new Map([
  ['\ufb00', 'ff'],
  ['\ufb01', 'fi'],
  ['\ufb02', 'fl'],
  ['\ufb03', 'ffi'],
  ['\ufb04', 'ffl'],
  ['\u00ad', ''],
]);

export function cleanText(input = '') {
  let text = String(input)
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ')
    .replace(/[\ufb00-\ufb04\u00ad]/g, (c) => LIGATURES.get(c) ?? '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n');
  // Re-join words hyphenated across a line break: "reac-\ntion" -> "reaction"
  text = text.replace(/([A-Za-z]{2,})-\n([a-z]{2,})/g, '$1$2');
  return text.trim();
}

function lineFromItems(items) {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  let out = '';
  let prevEnd = null;
  for (const item of sorted) {
    if (prevEnd !== null && item.x - prevEnd > Math.max(1.2, item.height * 0.12) && !/\s$/.test(out) && !/^\s/.test(item.str)) {
      out += ' ';
    }
    out += item.str;
    prevEnd = item.x + (item.width || 0);
  }
  return out.replace(/\s+/g, ' ').trim();
}

function groupLines(items) {
  const rows = [];
  for (const item of items) {
    if (!item.str || !item.str.trim()) continue;
    let row = rows.find((r) => Math.abs(r.y - item.y) <= Math.max(1.5, item.height * 0.35));
    if (!row) {
      row = { y: item.y, items: [] };
      rows.push(row);
    }
    row.items.push(item);
  }
  const lines = [];
  for (const row of rows) {
    const sorted = [...row.items].sort((a, b) => a.x - b.x);
    const maxHeight = Math.max(...sorted.map((i) => i.height));
    const gapThreshold = Math.max(18, maxHeight * 2.2);
    let segment = [];
    let lastEnd = null;
    const flush = () => {
      if (!segment.length) return;
      const text = lineFromItems(segment);
      if (text) {
        const minX = Math.min(...segment.map((i) => i.x));
        const maxX = Math.max(...segment.map((i) => i.x + (i.width || 0)));
        lines.push({
          y: row.y,
          maxHeight: Math.max(...segment.map((i) => i.height)),
          minX,
          maxX,
          width: maxX - minX,
          text,
        });
      }
      segment = [];
    };
    for (const item of sorted) {
      if (lastEnd !== null && item.x - lastEnd > gapThreshold) flush();
      segment.push(item);
      lastEnd = item.x + (item.width || 0);
    }
    flush();
  }
  return lines.sort((a, b) => b.y - a.y || a.minX - b.minX);
}

function blockText(lines) {
  let out = '';
  let prevY = null;
  for (const line of lines) {
    if (prevY !== null && prevY - line.y > line.maxHeight * 2.2) out += '\n\n';
    else if (out) out += '\n';
    out += line.text;
    prevY = line.y;
  }
  return out;
}

function pageTextFromLines(lines, pageWidth, pageHeight) {
  const body = lines.filter((line) => {
    if (/^\d{1,4}$/.test(line.text) && (line.y < pageHeight * 0.08 || line.y > pageHeight * 0.92)) return false;
    return true;
  });
  if (!body.length) return '';
  const totalChars = body.reduce((n, l) => n + l.text.length, 0);
  const leftChars = body.filter((l) => l.maxX < pageWidth * 0.52).reduce((n, l) => n + l.text.length, 0);
  const rightChars = body.filter((l) => l.minX > pageWidth * 0.48).reduce((n, l) => n + l.text.length, 0);
  const leftLines = body.filter((l) => l.maxX < pageWidth * 0.52).length;
  const rightLines = body.filter((l) => l.minX > pageWidth * 0.48).length;
  const twoColumn = leftChars > totalChars * 0.12 && rightChars > totalChars * 0.12 && leftLines >= 4 && rightLines >= 4;
  if (!twoColumn) return blockText(body);

  const full = [];
  const left = [];
  const right = [];
  for (const line of body) {
    const spansBoth = line.minX < pageWidth * 0.3 && line.maxX > pageWidth * 0.7 && line.width > pageWidth * 0.5;
    const centeredWide = line.width > pageWidth * 0.35 && line.minX > pageWidth * 0.15 && line.maxX < pageWidth * 0.85;
    if (spansBoth || centeredWide) full.push(line);
    else if (line.maxX <= pageWidth * 0.5) left.push(line);
    else if (line.minX >= pageWidth * 0.5) right.push(line);
    else if ((line.minX + line.maxX) / 2 < pageWidth / 2) left.push(line);
    else right.push(line);
  }
  return [blockText(full), blockText(left), blockText(right)].filter(Boolean).join('\n\n');
}

function guessTitle(lines, metadataTitle = '') {
  const meta = String(metadataTitle || '').trim();
  if (meta && meta.length > 8 && !/^(untitled|microsoft word|document)/i.test(meta)) return meta;
  const candidates = lines
    .slice(0, 18)
    .filter((l) => l.text.length >= 18 && l.text.length <= 320)
    .filter((l) => !/^(abstract|keywords|doi|https?:|www\.|received|accepted|published|copyright|©)/i.test(l.text));
  if (!candidates.length) return '';
  const max = Math.max(...candidates.map((l) => l.maxHeight));
  const top = candidates.filter((l) => l.maxHeight >= max * 0.88);
  return top
    .slice(0, 3)
    .map((l) => l.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findDoi(text = '') {
  const match = String(text).match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  if (!match) return '';
  return match[0].replace(/[.,;:)]+$/, '');
}

export function findEmails(text = '') {
  const emails = String(text).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return [...new Set(emails.map((e) => e.toLowerCase()))];
}

export async function extractPdf(buffer) {
  const data = new Uint8Array(buffer);
  const loadingTask = getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
    disableFontFace: true,
    useWorkerFetch: false,
    standardFontDataUrl: STANDARD_FONTS,
  });
  const pdf = await loadingTask.promise;
  const allLines = [];
  const pageTexts = [];
  const pageCount = pdf.numPages;
  const maxPages = Math.min(pageCount, 120);

  for (let p = 1; p <= maxPages; p += 1) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const items = content.items
      .filter((item) => typeof item.str === 'string')
      .map((item) => ({
        str: item.str,
        x: item.transform?.[4] ?? 0,
        y: item.transform?.[5] ?? 0,
        height: Math.abs(item.transform?.[3] ?? item.height ?? 10),
        width: Math.abs(item.width ?? 0),
      }));
    const viewport = page.getViewport({ scale: 1 });
    const lines = groupLines(items);
    const pageText = pageTextFromLines(lines, viewport.width, viewport.height);
    pageTexts.push(pageText);
    allLines.push({ page: p, lines });
    page.cleanup();
  }

  let metadata = {};
  try {
    const meta = await pdf.getMetadata();
    metadata = {
      title: meta?.info?.Title || '',
      author: meta?.info?.Author || '',
      subject: meta?.info?.Subject || '',
      keywords: meta?.info?.Keywords || '',
      creationDate: meta?.info?.CreationDate || '',
    };
  } catch {
    metadata = {};
  }

  const text = cleanText(pageTexts.join('\n\n'));
  const firstPageLines = allLines[0]?.lines ?? [];
  const title = guessTitle(firstPageLines, metadata.title);
  const firstPage = pageTexts[0] || '';
  const doi = findDoi(firstPage) || findDoi(text.slice(0, 6000));
  const emails = findEmails(firstPage);
  await pdf.destroy();

  return { text, pageCount, metadata, title, doi, emails, firstPage };
}

export function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function safePdfName(name = 'paper.pdf') {
  const base = path.basename(String(name)).replace(/[^\w.\- ()\u4e00-\u9fff]/g, '_').slice(0, 120);
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}

export function isPdfBuffer(buffer) {
  return buffer?.length > 4 && buffer.subarray(0, 5).toString('latin1') === '%PDF-';
}

export function fileSizeLabel(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function removeFileQuiet(file) {
  try {
    if (file) fs.unlinkSync(file);
  } catch {
    /* already gone */
  }
}
