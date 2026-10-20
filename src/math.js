import { HtmlGenerator, parse } from 'webtex';

const cache = new Map();
const CACHE_LIMIT = 600;
const MAX_TEX = 1800;
const FORBIDDEN = /\\(?:href|url|includegraphics|input|include|openout|write|read|catcode|directlua|special|html|class|style|css|require|usepackage|documentclass)\b|\\begin\s*\{document\}|\\end\s*\{document\}/i;

function escapeXml(value = '') {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}

function cacheSet(key, value) {
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
  cache.set(key, value);
}

function sanitizeSvg(svg) {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s(?:href|xlink:href)\s*=\s*"[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

export function errorSvg(message = '公式渲染失败') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="34" viewBox="0 0 220 34" role="img" aria-label="${escapeXml(message)}">
    <rect width="220" height="34" rx="5" fill="#f8e6e3"/>
    <text x="10" y="22" font-family="monospace" font-size="11" fill="#a9433d">${escapeXml(message)}</text>
  </svg>`;
}

export function renderFormulaSvg(tex, display = false) {
  const source = String(tex || '').trim();
  if (!source) throw new Error('公式为空');
  if (source.length > MAX_TEX) throw new Error('公式过长');
  if (FORBIDDEN.test(source)) throw new Error('公式包含不允许的命令');
  const key = `${display ? 'D' : 'I'}:${source}`;
  if (cache.has(key)) return cache.get(key);
  const wrapped = `\\documentclass{article}\\begin{document}${display ? '\\[' : '$'}${source}${display ? '\\]' : '$'}\\end{document}`;
  const doc = parse(wrapped, { generator: new HtmlGenerator({ hyphenate: false }) }).htmlDocument();
  const body = doc.body.innerHTML;
  const match = body.match(/<svg[\s\S]*?<\/svg>/i);
  if (!match) throw new Error('未生成 SVG');
  let svg = sanitizeSvg(match[0]);
  if (!/\sxmlns=/.test(svg.slice(0, 200))) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  if (/\sstyle="/.test(svg)) svg = svg.replace(/\sstyle="/, ' style="color:#18242e;');
  else svg = svg.replace('<svg', '<svg style="color:#18242e"');
  // Keep intrinsic dimensions but cap oversized formulas; CSS also constrains.
  if (!/\srole=/.test(svg.slice(0, 300))) svg = svg.replace('<svg', '<svg role="img"');
  cacheSet(key, svg);
  return svg;
}

export function isMathExpression(tex = '') {
  const source = String(tex || '').trim();
  return !!source && source.length <= MAX_TEX && !FORBIDDEN.test(source);
}
