const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');
const toastRoot = document.getElementById('toast-root');
const sidebar = document.getElementById('sidebar');
const scrim = document.getElementById('sidebar-scrim');

const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2.5Z"/><path d="M4 17h14"/><path d="M8 7h6"/>',
  upload: '<path d="M12 16V4m0 0 4 4m-4-4L8 8"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  download: '<path d="M12 4v12m0 0 4-4m-4 4-4-4"/><path d="M4 19h16"/>',
  external: '<path d="M14 4h6v6"/><path d="m20 4-8 8"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14.5-4L3 10"/><path d="M3 4v6h6"/><path d="M4 13a8 8 0 0 0 14.5 4L21 14"/><path d="M21 20v-6h-6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  warn: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 17.5v.5"/>',
  spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M2.8 20c.4-3.5 2.8-5.5 6.2-5.5s5.8 2 6.2 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.8c3 0 4.9 1.7 5.2 4.4"/>',
  stack: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16.5 9 5 9-5"/>',
  chat: '<path d="M21 11.5a8.3 8.3 0 0 1-8.5 8.2 9 9 0 0 1-3.9-.9L3 20l1.3-4.8A8 8 0 0 1 3.2 11 8.3 8.3 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/><path d="M8 10h8M8 14h5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  pdf: '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5m6 6-6-6 6-6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  filter: '<path d="M3 5h18M7 12h10M10 19h4"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.7"/><path d="M20 4v7h-7"/>',
  folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  flask: '<path d="M9 3h6M10 3v5L5 19a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 19l-5-11V3"/><path d="M7.5 14h9"/>',
};
function icon(name, cls = '') {
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const MATH_PATTERN = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$(?![\s$])([^$\n]*?[A-Za-z\\^_={}][^$\n]*?)\$(?!\d)/g;
function hasMath(value = '') {
  const re = new RegExp(MATH_PATTERN.source, 'g');
  return re.test(String(value || ''));
}
function mathImage(tex, display = false) {
  const source = String(tex || '').trim();
  if (!source) return '';
  if (source.length > 1800) return `<code class="math-fallback">${esc(source)}</code>`;
  const src = `/api/math/svg?display=${display ? '1' : '0'}&amp;tex=${encodeURIComponent(source)}`;
  return `<span class="math-figure ${display ? 'block' : 'inline'}"><img class="math-img" src="${src}" alt="${esc(source)}" loading="lazy" decoding="async" /></span>`;
}
function renderMathText(value = '') {
  const text = String(value ?? '');
  const re = new RegExp(MATH_PATTERN.source, 'g');
  let out = '';
  let last = 0;
  let match;
  while ((match = re.exec(text)) !== null) {
    out += esc(text.slice(last, match.index)).replace(/\n/g, '<br>');
    const display = match[1] !== undefined || match[2] !== undefined;
    const tex = match[1] ?? match[2] ?? match[3] ?? match[4] ?? '';
    out += tex.trim() ? mathImage(tex, display) : esc(match[0]);
    last = re.lastIndex;
  }
  out += esc(text.slice(last)).replace(/\n/g, '<br>');
  return out;
}
function safeUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}
function doiUrl(doi) {
  if (!doi) return '';
  return `https://doi.org/${encodeURI(String(doi).replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, ''))}`;
}
function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
function localDateString() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function fmtDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
}
function timeAgo(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const min = Math.round(diff / 60000);
  if (Math.abs(min) < 1) return '刚刚';
  if (Math.abs(min) < 60) return `${min} 分钟前`;
  const hours = Math.round(min / 60);
  if (Math.abs(hours) < 24) return `${hours} 小时前`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return `${days} 天前`;
  return fmtDate(value);
}
function fmtBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (/[\u4e00-\u9fff]/.test(name)) return name.replace(/\s/g, '').slice(0, 2);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
const STATUS = {
  inbox: { label: '待读', cls: 'badge-muted' },
  reading: { label: '精读中', cls: 'badge-gold' },
  analyzed: { label: '已结构化', cls: 'badge-teal' },
  archived: { label: '已归档', cls: 'badge-navy' },
};
const CONF = { high: '高置信', medium: '中置信', low: '低置信' };
const STANCE = {
  challenge: { label: '质疑', cls: 'badge-danger' },
  question: { label: '存疑', cls: 'badge-gold' },
  support: { label: '支持', cls: 'badge-ok' },
  note: { label: '批注', cls: 'badge-muted' },
};
const DIMENSION = {
  method: '方法', data: '数据', conclusion: '结论', reproducibility: '可复现性',
  theory: '理论', writing: '表述', other: '其他',
};
const UPDATE_KIND = { paper: '论文', talk: '报告', news: '新闻', website: '主页', note: '笔记' };

let stacksCache = null;
let statsCache = null;
let viewState = {};
let dirty = false;
let renderSeq = 0;
let lastListParams = new URLSearchParams();
let currentHash = location.hash || '#/';

async function api(path, options = {}) {
  const opts = { ...options, headers: { ...(options.headers || {}) } };
  if (opts.body && !(opts.body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(`/api${path}`, opts);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text.slice(0, 300) };
  }
  if (!res.ok) {
    const err = new Error(data?.error || `请求失败（HTTP ${res.status}）`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function toast(message, type = '') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${icon(type === 'err' ? 'warn' : type === 'ok' ? 'check' : 'spark')}<span>${esc(message)}</span>`;
  toastRoot.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 220);
  }, type === 'err' ? 5500 : 3800);
}

function openModal({ title, subtitle = '', body = '', footer = '', wide = false, narrow = false }) {
  document.body.classList.add('modal-open');
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-modal-backdrop>
      <div class="modal ${wide ? 'wide' : ''} ${narrow ? 'narrow' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="modal-head">
          <div><h2>${esc(title)}</h2>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>
          <button class="modal-close" type="button" data-close-modal aria-label="关闭">${icon('close')}</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
      </div>
    </div>`;
  const close = () => {
    modalRoot.innerHTML = '';
    document.body.classList.remove('modal-open');
  };
  modalRoot.querySelectorAll('[data-close-modal]').forEach((b) => b.addEventListener('click', close));
  modalRoot.querySelector('[data-modal-backdrop]')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) close();
  });
  return { root: modalRoot, close };
}

function confirmDialog({ title = '确认操作', message, confirmText = '确认', danger = true }) {
  return new Promise((resolve) => {
    const m = openModal({
      title,
      narrow: true,
      body: `<div class="confirm-text">${message}</div>`,
      footer: `<button class="btn" type="button" data-confirm-no>取消</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" type="button" data-confirm-yes>${esc(confirmText)}</button>`,
    });
    m.root.querySelector('[data-confirm-no]').onclick = () => { m.close(); resolve(false); };
    m.root.querySelector('[data-confirm-yes]').onclick = () => { m.close(); resolve(true); };
  });
}

function loadingBlock(label = '正在加载…') {
  return `<div class="loading"><span class="spinner"></span><p>${esc(label)}</p></div>`;
}

function emptyBlock({ title, text, action = '', iconName = 'book' }) {
  return `<div class="empty"><div class="empty-icon">${icon(iconName)}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>${action}</div>`;
}

function closeSidebar() {
  sidebar.classList.remove('open');
  scrim.classList.remove('open');
}
function navigate(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}
function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [pathPart, query = ''] = raw.split('?');
  return { path: pathPart || '/', params: new URLSearchParams(query) };
}
function setActiveNav(name) {
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === name));
}

async function loadStacks(force = false) {
  if (stacksCache && !force) return stacksCache;
  const data = await api('/stacks');
  stacksCache = data.items;
  return stacksCache;
}
async function refreshShell() {
  try {
    const stats = await api('/stats');
    statsCache = stats;
    document.getElementById('server-dot').className = 'status-dot ok';
    document.getElementById('server-label').textContent = '本地服务 · 正常';
    document.getElementById('nav-count-articles').textContent = stats.articles.total || '';
    document.getElementById('nav-count-authors').textContent = stats.authors.total || '';
    document.getElementById('nav-count-critiques').textContent = stats.critiques.open || '';
    document.getElementById('nav-stat-articles').textContent = stats.articles.total || 0;
    document.getElementById('nav-stat-critiques').textContent = stats.critiques.total || 0;
    return stats;
  } catch {
    document.getElementById('server-dot').className = 'status-dot err';
    document.getElementById('server-label').textContent = '服务连接失败';
    return null;
  }
}

function authorsLine(article, limit = 5) {
  const authors = article.authors || [];
  if (!authors.length) return article.authors_text || '作者未录入';
  const shown = authors.slice(0, limit).map((a) => `${esc(a.name)}${a.corresponding ? '<span class="corr-star">*</span>' : ''}`);
  return shown.join(', ') + (authors.length > limit ? ` 等 ${authors.length} 人` : '');
}
function stackChips(stacks = []) {
  return stacks.map((s) => `<span class="chip stack" title="${esc(s.path || s.name)}"><span class="dot" style="background:${esc(s.color)}"></span>${esc(s.name)}</span>`).join('');
}
function stackRoots(stacks = []) {
  return stacks.filter((s) => !s.parent_id);
}
function stackChildren(stacks = [], parentId) {
  return stacks.filter((s) => s.parent_id === parentId);
}
function stackOptions(stacks, selectedId = '') {
  const rows = [];
  const walk = (nodes, depth) => {
    for (const s of nodes) {
      rows.push(`<option value="${s.id}" ${String(s.id) === String(selectedId) ? 'selected' : ''}>${'— '.repeat(depth)}${esc(s.name)}</option>`);
      walk(stackChildren(stacks, s.id), depth + 1);
    }
  };
  walk(stackRoots(stacks), 0);
  return rows.join('');
}
function stackPickerHtml(stacks, selectedIds = [], { name = 'stack', label = '' } = {}) {
  const selected = new Set([...selectedIds].map(Number));
  const parentById = new Map(stacks.map((s) => [s.id, s.parent_id]));
  const openIds = new Set();
  for (const id of selected) {
    let parent = parentById.get(id);
    while (parent) {
      openIds.add(parent);
      parent = parentById.get(parent);
    }
  }
  const byParent = new Map();
  for (const s of stacks) {
    const key = s.parent_id || 0;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(s);
  }
  const checkbox = (s) => `<input type="checkbox" name="${esc(name)}" value="${s.id}" ${selected.has(s.id) ? 'checked' : ''} />`;
  const node = (s) => {
    const kids = byParent.get(s.id) || [];
    const dot = `<span class="dot" style="width:6px;height:6px;border-radius:50%;background:${esc(s.color)}"></span>`;
    if (!kids.length) {
      return `<label class="stack-pick" data-stack-path="${esc((s.path || s.name).toLowerCase())}" title="${esc(s.path || s.name)}">${checkbox(s)}${dot}${esc(s.name)}</label>`;
    }
    return `<details class="stack-subgroup" ${openIds.has(s.id) || selected.has(s.id) ? 'open' : ''} data-stack-path="${esc((s.path || s.name).toLowerCase())}">
      <summary>${dot}${esc(s.name)}<span class="stack-sub-count">${kids.length}</span></summary>
      <div class="stack-subgroup-body">
        <label class="stack-pick parent" title="${esc(s.path || s.name)}">${checkbox(s)}${dot}${esc(s.name)}<span class="small muted">（父级）</span></label>
        ${kids.map(node).join('')}
      </div>
    </details>`;
  };
  return `<div class="stack-picker">
    ${label ? `<div class="stack-picker-label">${esc(label)}</div>` : ''}
    <input class="input stack-filter" data-stack-filter type="search" placeholder="筛选技术栈…" autocomplete="off" />
    <div class="stack-picker-list">${stackRoots(stacks).map(node).join('')}</div>
  </div>`;
}
function bindStackPickers(root = app) {
  root.querySelectorAll('.stack-picker').forEach((picker) => {
    const input = picker.querySelector('[data-stack-filter]');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      picker.querySelectorAll('.stack-pick, .stack-subgroup').forEach((node) => {
        if (!q) { node.classList.remove('filtered-out'); if (node.tagName === 'DETAILS') node.open = false; return; }
        const text = `${node.dataset.stackPath || ''} ${node.textContent || ''}`.toLowerCase();
        const hit = text.includes(q);
        node.classList.toggle('filtered-out', !hit);
        if (node.tagName === 'DETAILS' && hit) node.open = true;
      });
    });
  });
}
function statusBadge(status) {
  const m = STATUS[status] || STATUS.inbox;
  return `<span class="badge ${m.cls}">${m.label}</span>`;
}
function confBadge(conf) {
  return `<span class="badge badge-outline"><i class="conf-dot ${esc(conf)}"></i>${CONF[conf] || '低置信'}</span>`;
}

/* ============================== ROUTER ============================== */
async function route() {
  closeSidebar();
  const targetHash = location.hash || '#/';
  if (dirty && !confirm('当前情报有未保存的修改，确定离开吗？')) {
    history.replaceState(null, '', currentHash);
    return;
  }
  dirty = false;
  currentHash = targetHash;
  const seq = ++renderSeq;
  const { path, params } = parseHash();
  app.innerHTML = loadingBlock();
  app.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
  try {
    if (path === '/' || path === '') {
      setActiveNav('dashboard');
      await dashboardPage(seq);
    } else if (path === '/library') {
      setActiveNav('library');
      await libraryPage(params, seq);
    } else if (path === '/upload') {
      setActiveNav('library');
      await uploadPage(seq);
    } else if (path.startsWith('/articles/')) {
      setActiveNav('library');
      await articlePage(Number(path.split('/')[2]), params, seq);
    } else if (path === '/authors') {
      setActiveNav('authors');
      await authorsPage(params, seq);
    } else if (path.startsWith('/authors/')) {
      setActiveNav('authors');
      await authorDetailPage(Number(path.split('/')[2]), seq);
    } else if (path === '/stacks') {
      setActiveNav('stacks');
      await stacksPage(seq);
    } else if (path === '/critiques') {
      setActiveNav('critiques');
      await critiquesPage(params, seq);
    } else if (path === '/settings') {
      setActiveNav('settings');
      await settingsPage(seq);
    } else {
      setActiveNav('');
      app.innerHTML = `<div class="page">${emptyBlock({ title: '页面不存在', text: '这个地址没有对应的页面。', action: '<a class="btn btn-primary" href="#/">返回总览</a>', iconName: 'compass' })}</div>`;
    }
  } catch (err) {
    if (seq !== renderSeq) return;
    console.error(err);
    app.innerHTML = `<div class="page"><div class="card panel" style="max-width:620px;margin:10vh auto;text-align:center">
      <div class="empty-icon" style="margin:0 auto 14px">${icon('warn')}</div>
      <h1 style="font-family:var(--serif);font-weight:500;margin:0 0 6px">加载失败</h1>
      <p class="muted" style="font-size:12px">${esc(err.message || '未知错误')}</p>
      <div class="head-actions" style="justify-content:center;margin-top:14px"><button class="btn" onclick="location.reload()">刷新页面</button><a class="btn btn-primary" href="#/">返回总览</a></div>
    </div></div>`;
  }
}

/* ============================== DASHBOARD ============================== */
async function dashboardPage(seq) {
  const stats = statsCache || (await api('/stats'));
  statsCache = stats;
  if (seq !== renderSeq) return;
  const total = stats.articles.total || 0;
  const hero = `
    <section class="hero">
      <div class="hero-copy">
        <div class="eyebrow">Research intelligence console</div>
        <h1>让论文成为<br>可检索、可质疑的资产。</h1>
        <p>PDF 统一归档，自动抽取科学问题、方法、理论变量与结论；持续积累通讯作者画像和你的批判判断。</p>
        <div class="hero-actions">
          <a class="btn btn-accent" href="#/upload">${icon('upload')} 上传一篇 PDF</a>
          <a class="btn" href="#/library">${icon('book')} 进入文献库</a>
        </div>
      </div>
      <div class="hero-side">
        <div class="hero-numbers">
          <div class="hero-number"><strong>${total}</strong><span>文献资产</span></div>
          <div class="hero-number"><strong>${stats.articles.analyzed || 0}</strong><span>已结构化</span></div>
          <div class="hero-number"><strong>${stats.authors.total || 0}</strong><span>作者档案</span></div>
          <div class="hero-number"><strong>${stats.critiques.open || 0}</strong><span>开放批判</span></div>
        </div>
        <div class="hero-note"><span class="status-dot ok"></span> 本地优先 · PDF 与数据库不出本机</div>
      </div>
    </section>`;

  if (!total) {
    app.innerHTML = `<div class="page">${hero}<div class="card panel" style="margin-top:18px">${emptyBlock({
      title: '从第一篇论文开始',
      text: '上传 PDF 后，平台会保存原文并自动抽取五类核心情报。你可以逐条核对、编辑字段，并用批判记忆积累判断。',
      action: '<a class="btn btn-primary btn-lg" href="#/upload">上传 PDF</a>',
      iconName: 'upload',
    })}</div></div>`;
    return;
  }

  const statCards = [
    ['文献总数', total, `${stats.articles.with_pdf || 0} 篇含 PDF · ${fmtBytes(stats.articles.pdf_bytes)}`, 'book'],
    ['已结构化', stats.articles.analyzed || 0, `${stats.articles.kinetics || 0} 篇判定为动力学相关`, 'flask'],
    ['关注作者', stats.authors.total || 0, `${stats.topAuthors.length} 位近期活跃`, 'users'],
    ['开放批判', stats.critiques.open || 0, `累计 ${stats.critiques.total || 0} 条判断`, 'chat'],
  ];
  const maxStack = Math.max(1, ...stats.topStacks.map((s) => s.article_count));
  const maxYear = Math.max(1, ...stats.years.map((y) => y.n));

  const recentRows = stats.recent.map((a, i) => `
    <div class="list-row">
      <div class="list-index">${String(i + 1).padStart(2, '0')}</div>
      <div class="list-main">
        <h3><a href="#/articles/${a.id}">${esc(a.title || '未命名文献')}</a></h3>
        <div class="list-meta"><span>${authorsLine(a, 3)}</span><span class="dot">·</span><span>${esc(a.journal || '未注明期刊')}</span><span class="dot">·</span><span>${a.year || '年份未知'}</span></div>
        <div class="row-tags">${statusBadge(a.status)}${a.is_kinetics ? '<span class="badge badge-teal">动力学</span>' : ''}${stackChips(a.stacks.slice(0, 2))}</div>
      </div>
      <div class="list-side"><a class="icon-btn" href="#/articles/${a.id}" aria-label="打开">${icon('arrow')}</a></div>
    </div>`).join('');

  const attention = (stats.attention || []).slice(0, 5);
  const attentionRows = attention.length ? attention.map((a) => {
    const reasons = [];
    if (!a.corr_count) reasons.push('通讯作者待确认');
    if (a.open_critiques) reasons.push(`${a.open_critiques} 条开放批判`);
    if (a.analysis_confidence === 'low') reasons.push('自动抽取置信度低');
    return `<div class="list-row" style="padding:11px 0">
      <div class="list-main">
        <h3 style="font-size:14px"><a href="#/articles/${a.id}">${esc(a.title || '未命名文献')}</a></h3>
        <div class="row-tags">${reasons.map((r) => `<span class="badge badge-gold">${esc(r)}</span>`).join('')}</div>
      </div>
      <div class="list-side"><a class="icon-btn btn-sm" href="#/articles/${a.id}" aria-label="处理">${icon('chevron')}</a></div>
    </div>`;
  }).join('') : '<p class="muted small" style="padding:8px 0 3px">所有文献都已完成基本处置。继续保持。</p>';

  const critiqueRows = stats.recentCritiques.length ? stats.recentCritiques.map((c) => `
    <div class="list-row" style="padding:10px 0">
      <div class="list-main">
        <div class="row-tags" style="margin:0 0 4px"><span class="badge ${STANCE[c.stance]?.cls || 'badge-muted'}">${STANCE[c.stance]?.label || c.stance}</span><span class="badge badge-outline">${DIMENSION[c.dimension] || c.dimension}</span></div>
        <p style="margin:0;font-size:11.5px;line-height:1.6;color:var(--ink-2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(c.content)}</p>
        <a class="small link" href="#/articles/${c.article_id}?tab=critiques" style="display:inline-block;margin-top:4px">${esc(c.article_title)}</a>
      </div>
    </div>`).join('') : '<p class="muted small">还没有批判记录。阅读时随手留下你的判断。</p>';

  app.innerHTML = `<div class="page">
    ${hero}
    <div class="stat-grid">
      ${statCards.map(([label, value, sub, ic]) => `<div class="stat-card"><div class="stat-top"><span>${label}</span>${icon(ic)}</div><strong>${value}</strong><small>${sub}</small></div>`).join('')}
    </div>
    <div class="dashboard-grid">
      <div class="dash-col">
        <div class="card panel">
          <div class="panel-head"><div><h2>最近入库</h2><div class="sub">按创建时间</div></div><a class="btn btn-sm" href="#/library">全部文献 ${icon('arrow')}</a></div>
          <div class="list">${recentRows}</div>
        </div>
        <div class="card panel">
          <div class="panel-head"><div><h2>作者雷达</h2><div class="sub">按关联文献数</div></div><a class="btn btn-sm" href="#/authors">全部作者 ${icon('arrow')}</a></div>
          <div class="list">${stats.topAuthors.slice(0, 6).map((a) => `<div class="list-row" style="padding:10px 0;align-items:center">
            <div class="avatar sm">${esc(initials(a.name))}</div>
            <div class="list-main"><h3 style="font-size:14px;margin:0"><a href="#/authors/${a.id}">${esc(a.name)}</a></h3><div class="list-meta"><span>${esc(a.affiliation || '机构未录入')}</span><span class="dot">·</span><span>${a.article_count} 篇关联</span>${a.corresponding_count ? `<span class="dot">·</span><span>${a.corresponding_count} 次通讯</span>` : ''}</div></div>
            <div class="list-side">${icon('chevron')}</div>
          </div>`).join('')}</div>
        </div>
      </div>
      <div class="dash-col">
        <div class="card panel">
          <div class="panel-head"><div><h2>需要你的判断</h2><div class="sub">低置信 / 通讯作者待确认 / 开放批判</div></div></div>
          ${attentionRows}
        </div>
        <div class="card panel">
          <div class="panel-head"><div><h2>技术栈分布</h2><div class="sub">按已归类文献</div></div><a class="btn btn-sm" href="#/stacks">管理</a></div>
          <div class="stack-bars">${stats.topStacks.map((s) => `<div class="stack-bar-row"><span title="${esc(s.name)}">${esc(s.name)}</span><div class="bar"><i style="width:${Math.round((s.article_count / maxStack) * 100)}%;background:${esc(s.color)}"></i></div><em>${s.article_count}</em></div>`).join('')}</div>
        </div>
        <div class="card panel">
          <div class="panel-head"><div><h2>年份分布</h2><div class="sub">最近 12 年</div></div></div>
          ${stats.years.length ? `<div class="year-bars">${[...stats.years].reverse().map((y) => `<div class="year-bar"><b>${y.n}</b><i style="height:${Math.max(3, Math.round((y.n / maxYear) * 66))}px"></i><span>${String(y.year).slice(2)}</span></div>`).join('')}</div>` : '<p class="muted small">尚无年份数据。</p>'}
        </div>
        <div class="card panel">
          <div class="panel-head"><div><h2>最新批判</h2><div class="sub">你的持续判断</div></div><a class="btn btn-sm" href="#/critiques">全部</a></div>
          ${critiqueRows}
        </div>
      </div>
    </div>
  </div>`;
}

/* ============================== LIBRARY ============================== */
async function libraryPage(params, seq) {
  lastListParams = params;
  const stacks = await loadStacks();
  const q = params.get('q') || '';
  const stack = params.get('stack') || '';
  const status = params.get('status') || '';
  const kinetics = params.get('kinetics') || '';
  const sort = params.get('sort') || 'updated';
  const page = Number(params.get('page') || 1);
  const query = new URLSearchParams({ page: String(page), limit: '20', sort });
  if (q) query.set('q', q);
  if (stack) query.set('stack', stack);
  if (status) query.set('status', status);
  if (kinetics) query.set('kinetics', kinetics);
  const data = await api(`/articles?${query}`);
  if (seq !== renderSeq) return;

  const rows = data.items.map((a) => {
    const corr = (a.authors || []).filter((x) => x.corresponding).map((x) => x.name);
    return `<div class="library-row">
      <div class="library-title">
        <h3><a href="#/articles/${a.id}">${esc(a.title || '未命名文献')}</a></h3>
        <div class="authors">${authorsLine(a, 5)}</div>
        <div class="row-tags">${a.is_kinetics ? '<span class="badge badge-teal">动力学</span>' : ''}${stackChips(a.stacks.slice(0, 2))}${a.tags?.slice(0, 2).map((t) => `<span class="chip">${esc(t)}</span>`).join('') || ''}</div>
      </div>
      <div class="library-cell journal"><strong>${esc(a.journal || '—')}</strong><span>${a.year || '年份未知'}</span><div class="conf">${confBadge(a.analysis_confidence)}</div></div>
      <div class="library-cell"><strong>${corr.length ? `${esc(corr.join('; '))}${(a.authors || []).some((x) => x.corresponding && x.corresponding_source && !['manual', 'confirmed'].includes(x.corresponding_source)) ? '（推断）' : ''}` : '通讯作者待确认'}</strong><span>${a.critique_count ? `${a.critique_count} 条批判` : '暂无批判'}</span></div>
      <div class="library-cell year" style="text-align:right">${statusBadge(a.status)}<div class="small" style="margin-top:4px">${timeAgo(a.updated_at)}</div></div>
    </div>`;
  }).join('');

  const pages = data.pages || 1;
  const pager = pages > 1 ? `<div class="pager">
    <button data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>上一页</button>
    <span>${page} / ${pages} · 共 ${data.total} 篇</span>
    <button data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}>下一页</button>
  </div>` : '';

  app.innerHTML = `<div class="page">
    <div class="page-head">
      <div><div class="eyebrow">Library</div><h1>文献库</h1><p>全文检索、技术栈筛选与结构化状态管理。共 ${data.total} 篇匹配文献。</p></div>
      <div class="head-actions"><a class="btn btn-primary" href="#/upload">${icon('upload')} 上传 PDF</a></div>
    </div>
    <div class="toolbar">
      <div class="search-box">${icon('search')}<input class="input" id="lib-search" type="search" placeholder="搜索标题、作者、摘要、全文、情报…" value="${esc(q)}" /></div>
      <select class="select" id="filter-stack"><option value="">全部技术栈</option>${stackOptions(stacks, stack)}</select>
      <select class="select" id="filter-status"><option value="">全部状态</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === status ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
      <select class="select" id="filter-kinetics"><option value="">全部类型</option><option value="1" ${kinetics === '1' ? 'selected' : ''}>动力学理论</option><option value="0" ${kinetics === '0' ? 'selected' : ''}>其他</option></select>
      <select class="select" id="filter-sort"><option value="updated" ${sort === 'updated' ? 'selected' : ''}>最近更新</option><option value="created" ${sort === 'created' ? 'selected' : ''}>最近入库</option><option value="year" ${sort === 'year' ? 'selected' : ''}>年份</option><option value="title" ${sort === 'title' ? 'selected' : ''}>标题</option><option value="confidence" ${sort === 'confidence' ? 'selected' : ''}>置信度</option></select>
    </div>
    <div class="result-meta"><span>${q ? `“${esc(q)}” 的搜索结果` : '全部文献'}${stack ? ` · 技术栈筛选` : ''}</span><span>${data.total} 篇</span></div>
    ${data.items.length ? `<div class="library-list">${rows}</div>${pager}` : `<div class="card panel">${emptyBlock({
      title: q || stack || status ? '没有匹配的文献' : '文献库还是空的',
      text: q || stack || status ? '试试放宽筛选条件，或清空搜索词。' : '上传第一篇 PDF，平台会自动抽取情报并归档原文。',
      action: q || stack || status ? '<a class="btn" href="#/library">清空筛选</a>' : '<a class="btn btn-primary" href="#/upload">上传 PDF</a>',
      iconName: q ? 'search' : 'book',
    })}</div>`}
  </div>`;

  const apply = (patch) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === '' || v == null) next.delete(k); else next.set(k, String(v));
    }
    next.delete('_back');
    navigate(`#/library?${next.toString()}`);
  };
  const search = document.getElementById('lib-search');
  let timer;
  search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => apply({ q: search.value.trim(), page: 1 }), 350);
  });
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { clearTimeout(timer); apply({ q: search.value.trim(), page: 1 }); }
  });
  document.getElementById('filter-stack').onchange = (e) => apply({ stack: e.target.value, page: 1 });
  document.getElementById('filter-status').onchange = (e) => apply({ status: e.target.value, page: 1 });
  document.getElementById('filter-kinetics').onchange = (e) => apply({ kinetics: e.target.value, page: 1 });
  document.getElementById('filter-sort').onchange = (e) => apply({ sort: e.target.value, page: 1 });
  document.querySelectorAll('[data-page]').forEach((b) => {
    b.onclick = () => apply({ page: b.dataset.page });
  });
}

/* ============================== UPLOAD ============================== */
async function uploadPage(seq) {
  const stacks = await loadStacks();
  if (seq !== renderSeq) return;
  let picked = null;
  app.innerHTML = `<div class="page page-narrow">
    <div class="page-head">
      <div><div class="eyebrow">Ingest</div><h1>上传 PDF</h1><p>原文归档、元数据补全、结构化抽取一次完成。上传后仍可逐字段修改。</p></div>
      <div class="head-actions"><a class="btn" href="#/library">${icon('arrowLeft')} 返回文献库</a></div>
    </div>
    <form id="upload-form">
      <div class="dropzone" id="dropzone">
        <input type="file" id="pdf-input" accept="application/pdf,.pdf" />
        <div class="dz-icon">${icon('upload')}</div>
        <h3>拖入论文 PDF，或点击选择</h3>
        <p>单篇最大 100 MB · 只在本地解析与保存</p>
        <div id="file-slot"></div>
      </div>
      <div class="upload-progress hidden" id="upload-progress">
        <div class="loading-inline"><span class="spinner"></span><span id="progress-label">正在上传并解析 PDF…</span></div>
        <div class="bar"><i id="progress-bar" style="width:8%"></i></div>
        <div class="progress-steps"><span>1 / 3 保存原文与校验</span><span>2 / 3 抽取全文与元数据</span><span>3 / 3 生成结构化情报</span></div>
      </div>
      <div class="card panel" style="margin-top:16px">
        <div class="panel-head"><div><h2>元数据</h2><div class="sub">留空时会尝试从 PDF 或 Crossref 自动补全</div></div><span class="badge badge-outline">可选</span></div>
        <div class="form-grid">
          <div class="field span-2"><label for="up-title">标题</label><input class="input" id="up-title" name="title" placeholder="留空则自动识别" /></div>
          <div class="field"><label for="up-doi">DOI</label><input class="input" id="up-doi" name="doi" placeholder="10.xxxx/xxxxx" /><small>有 DOI 时会自动查询 Crossref 补全作者、期刊与摘要。</small></div>
          <div class="field"><label for="up-journal">期刊</label><input class="input" id="up-journal" name="journal" placeholder="例如 J. Chem. Phys." /></div>
          <div class="field"><label for="up-year">年份</label><input class="input" id="up-year" name="year" type="number" min="1800" max="2100" placeholder="2026" /></div>
          <div class="field"><label for="up-tags">自定义标签</label><input class="input" id="up-tags" name="tags" placeholder="用逗号分隔，例如 综述, 待读" /></div>
          <div class="field span-2"><label>技术栈</label>${stackPickerHtml(stacks, [], { name: 'stack' })}<small>不选时，平台会优先按关键词建议叶子分类，必要时归入父级；最多四个。</small></div>
          <div class="field"><label for="up-kinetics">化学动力学判定</label><select class="select" id="up-kinetics" name="is_kinetics"><option value="auto">自动判断</option><option value="1">是，动力学理论文献</option><option value="0">否</option></select></div>
          <div class="field"><label>自动归类</label><label class="check" style="margin-top:8px"><input type="checkbox" name="auto_stack" checked /> 无手动选择时自动关联技术栈</label></div>
        </div>
        <div class="settings-actions">
          <button class="btn btn-primary btn-lg" type="submit" id="upload-submit">${icon('upload')} 上传并分析</button>
          <a class="btn btn-lg" href="#/library">取消</a>
        </div>
      </div>
    </form>
    <div class="card panel" style="margin-top:16px">
      <div class="panel-head"><div><h2>结构化流水线</h2><div class="sub">每一步都可人工复核</div></div></div>
      <div class="upload-steps">
        <div class="upload-step"><div class="num">01</div><div><strong>原文与指纹</strong><p>计算 SHA-256 去重，PDF 存入本地 data/pdfs，数据库记录文件信息。</p></div></div>
        <div class="upload-step"><div class="num">02</div><div><strong>文本与书目信息</strong><p>PDF.js 抽取全文和首页 DOI；Crossref 补全作者、期刊、年份和摘要。</p></div></div>
        <div class="upload-step"><div class="num">03</div><div><strong>情报卡与作者档案</strong><p>抽取科学问题、方法、哈密顿量/泛函/势函数、动力学方法、可观测量与结论，并生成作者关联。</p></div></div>
        <div class="upload-step"><div class="num">04</div><div><strong>持续分析</strong><p>之后可同步通讯作者 OpenAlex 动态、手动修订情报，并记录你的批判判断。</p></div></div>
      </div>
    </div>
    <div class="upload-note" style="margin-top:16px">${icon('warn')}<div>平台不会把 PDF 发送到外部。只有在你主动查询 Crossref、同步 OpenAlex 或抓取主页时，才会把必要的元数据或作者姓名发送到对应服务。请勿上传无权处理的文件。</div></div>
  </div>`;

  bindStackPickers(app);
  const input = document.getElementById('pdf-input');
  const dropzone = document.getElementById('dropzone');
  const slot = document.getElementById('file-slot');
  const setFile = (file) => {
    if (!file) return;
    const ok = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!ok) { toast('请选择 PDF 文件', 'err'); return; }
    if (file.size > 100 * 1024 * 1024) { toast('文件超过 100 MB 限制', 'err'); return; }
    picked = file;
    slot.innerHTML = `<div class="file-picked"><div class="pdf-badge">PDF</div><div style="min-width:0"><strong>${esc(file.name)}</strong><small>${fmtBytes(file.size)} · 已就绪</small></div><button class="icon-btn" type="button" id="clear-file" aria-label="移除">${icon('close')}</button></div>`;
    document.getElementById('clear-file').onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      picked = null; input.value = ''; slot.innerHTML = '';
    };
  };
  input.addEventListener('change', () => setFile(input.files?.[0]));
  ['dragenter', 'dragover'].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', (e) => {
    const files = [...(e.dataTransfer?.files || [])];
    if (files.length > 1) toast('当前一次上传一篇；已选择第一个文件', '');
    setFile(files[0]);
  });

  const form = document.getElementById('upload-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!picked) { toast('请先选择一个 PDF 文件', 'err'); return; }
    const fd = new FormData();
    fd.append('file', picked);
    fd.append('title', document.getElementById('up-title').value.trim());
    fd.append('doi', document.getElementById('up-doi').value.trim());
    fd.append('journal', document.getElementById('up-journal').value.trim());
    fd.append('year', document.getElementById('up-year').value.trim());
    fd.append('tags', document.getElementById('up-tags').value.trim());
    fd.append('is_kinetics', document.getElementById('up-kinetics').value);
    fd.append('auto_stack', document.querySelector('[name=auto_stack]').checked ? '1' : '0');
    const checked = [...document.querySelectorAll('[name=stack]:checked')].map((x) => Number(x.value));
    if (checked.length) fd.append('stack_ids', JSON.stringify(checked));
    const btn = document.getElementById('upload-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px"></span> 处理中…';
    const progress = document.getElementById('upload-progress');
    progress.classList.remove('hidden');
    let pct = 12;
    const timer = setInterval(() => {
      pct = Math.min(88, pct + Math.max(1, Math.round((90 - pct) / 8)));
      document.getElementById('progress-bar').style.width = `${pct}%`;
      document.getElementById('progress-label').textContent = pct < 40 ? '正在保存原文并抽取全文…' : pct < 70 ? '正在解析元数据与结构…' : '正在生成情报卡…';
    }, 650);
    try {
      const res = await fetch('/api/articles/upload', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      clearInterval(timer);
      if (!res.ok) {
        const err = new Error(data.error || `上传失败（HTTP ${res.status}）`);
        err.status = res.status;
        throw err;
      }
      document.getElementById('progress-bar').style.width = '100%';
      document.getElementById('progress-label').textContent = '完成，正在打开情报卡…';
      await refreshShell();
      toast('上传完成，已生成结构化情报', 'ok');
      setTimeout(() => navigate(`#/articles/${data.article.id}`), 350);
    } catch (err) {
      clearInterval(timer);
      progress.classList.add('hidden');
      btn.disabled = false;
      btn.innerHTML = `${icon('upload')} 上传并分析`;
      toast(err.message, 'err');
      if (err.status === 409) {
        const match = String(err.message).match(/#(\d+)/);
        if (match) {
          const go = await confirmDialog({ title: 'PDF 已存在', message: `这篇论文已经入库（#${match[1]}）。要打开已有文献吗？`, confirmText: '打开文献', danger: false });
          if (go) navigate(`#/articles/${match[1]}`);
        }
      }
    }
  });
}

/* ============================== ARTICLE DETAIL ============================== */
const INTEL_FIELDS = [
  ['scientific_question', '科学问题', '论文试图填补的缺口与要回答的问题', true],
  ['methods', '方法与技术路线', '理论框架、计算/实验流程、关键近似', true],
  ['conclusions', '结论与证据', '定量结果、机理判断、与已有工作的关系', true],
  ['limitations', '局限与未来工作', '作者承认的局限、近似与后续方向', true],
];
const THEORY_FIELDS = [
  ['hamiltonian', '哈密顿量', '模型形式、参数、基组/自由度；不适用时说明原因'],
  ['functional', '泛函', '交换关联泛函、自由能泛函或其等价泛函；注明版本'],
  ['potential', '势函数 / 势能面', '来源（从头算/ML/经验力场）、拟合、验证与适用域'],
  ['dynamics_methods', '动力学方法', '传播/采样/统计方法、系综、时间步长、边界条件'],
  ['observables', '可观测量', '速率常数、截面、分支比、光谱、寿命等及其提取方式'],
];
const ALL_INTEL_KEYS = [...INTEL_FIELDS, ...THEORY_FIELDS].map(([k]) => k);

async function articlePage(id, params, seq) {
  if (!Number.isFinite(id) || id <= 0) throw new Error('无效的文献编号');
  const [article, stacks] = await Promise.all([
    api(`/articles/${id}`),
    loadStacks(),
  ]);
  if (seq !== renderSeq) return;
  viewState = { article, stacks };
  const tab = ['intel', 'authors', 'critiques', 'pdf', 'history'].includes(params.get('tab')) ? params.get('tab') : 'intel';
  const modeParam = params.get('mode');
  const intelHasMath = tab === 'intel' && hasMath(JSON.stringify(article.intel || {}));
  const readMode = tab === 'intel' && (modeParam === 'read' || (modeParam !== 'edit' && intelHasMath));
  const corr = (article.authors || []).filter((a) => a.corresponding);
  const inferredCorr = corr.filter((a) => a.corresponding_source && !['manual', 'confirmed'].includes(a.corresponding_source));
  const source = article.intel?.generated_by || article.analysis_source;
  const sourceLabel = source === 'manual' ? '人工编辑' : source === 'heuristic' ? '规则抽取' : '未分析';
  const doi = article.doi ? `<a href="${esc(doiUrl(article.doi))}" target="_blank" rel="noopener" class="link">${esc(article.doi)} ${icon('external')}</a>` : '<span class="muted">DOI 未录入</span>';

  app.innerHTML = `<div class="page detail">
    <div class="breadcrumb"><a href="#/library">文献库</a>${icon('chevron')}<span>#${article.id}</span>${article.is_kinetics ? '<span class="badge badge-teal">化学动力学</span>' : ''}</div>
    <div class="detail-head">
      <div class="detail-title">
        <h1>${esc(article.title || '未命名文献')}</h1>
        <div class="detail-sub">
          <span class="authors-line">${authorsLine(article, 12)}</span>
          <span>${esc(article.journal || '期刊未录入')}${article.year ? ` · ${article.year}` : ''}</span>
          ${doi}
          ${corr.length ? `<span class="badge badge-accent" title="${esc(inferredCorr.map((a) => a.corresponding_reason).filter(Boolean).join('；'))}">通讯：${esc(corr.map((a) => a.name).join(' / '))}${inferredCorr.length ? ' · 自动推断' : ''}</span>` : '<a href="#/articles/' + article.id + '?tab=authors" class="badge badge-gold">通讯作者待确认</a>'}
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn" data-action="analyze">${icon('refresh')} 重新抽取</button>
        <button class="btn" data-action="edit-meta">${icon('edit')} 编辑信息</button>
      </div>
    </div>
    <div class="detail-toolbar">
      <select class="select" id="status-select" aria-label="文献状态">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${article.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
      <span class="badge badge-outline"><i class="conf-dot ${esc(article.analysis_confidence)}"></i>${CONF[article.analysis_confidence] || '低置信'}</span>
      <span class="small muted">来源：${sourceLabel}</span>
      <span class="spacer"></span>
      ${stackChips(article.stacks)}
      <button class="btn btn-sm" data-action="manage-stacks">${icon('stack')} 技术栈</button>
    </div>
    <div class="tabs">
      <a class="tab ${tab === 'intel' ? 'active' : ''}" href="#/articles/${article.id}?tab=intel">情报卡</a>
      <a class="tab ${tab === 'authors' ? 'active' : ''}" href="#/articles/${article.id}?tab=authors">作者与通讯 <em>${article.authors.length}</em></a>
      <a class="tab ${tab === 'critiques' ? 'active' : ''}" href="#/articles/${article.id}?tab=critiques">批判记忆 <em>${article.critiques.length}</em></a>
      <a class="tab ${tab === 'pdf' ? 'active' : ''}" href="#/articles/${article.id}?tab=pdf">原文 PDF</a>
      <a class="tab ${tab === 'history' ? 'active' : ''}" href="#/articles/${article.id}?tab=history">历史 <em>${article.revisions.length}</em></a>
    </div>
    <div class="detail-layout">
      <div class="detail-main">${tab === 'intel' ? intelTab(article, readMode)
        : tab === 'authors' ? authorsTab(article)
        : tab === 'critiques' ? critiquesTab(article)
        : tab === 'pdf' ? pdfTab(article)
        : historyTab(article)}</div>
      <aside class="detail-rail">
        <div class="rail-card">
          <h4>文献信息</h4>
          <div class="rail-list">
            <div><span>期刊</span><span>${esc(article.journal || '—')}</span></div>
            <div><span>年份</span><span>${article.year || '—'}</span></div>
            <div><span>页数</span><span>${article.page_count || '—'}</span></div>
            <div><span>文件</span><span>${article.pdf_filename ? esc(article.pdf_filename) : '—'}</span></div>
            <div><span>大小</span><span>${fmtBytes(article.pdf_size)}</span></div>
            <div><span>入库</span><span>${fmtDate(article.created_at)}</span></div>
            <div><span>更新</span><span>${timeAgo(article.updated_at)}</span></div>
            <div><span>全文</span><span>${article.text_status === 'ok' ? `${article.full_text.length.toLocaleString()} 字符` : '<span class="warn-text">未抽取</span>'}</span></div>
          </div>
        </div>
        <div class="rail-card">
          <h4>快捷操作</h4>
          <div class="rail-actions">
            <a class="btn btn-sm" href="/api/articles/${article.id}/pdf?download=1">${icon('download')} 下载 PDF</a>
            <button class="btn btn-sm" data-action="copy-markdown">${icon('copy')} 复制 Markdown 摘要</button>
            <a class="btn btn-sm" href="#/articles/${article.id}?tab=pdf">${icon('pdf')} 对照原文</a>
            <button class="btn btn-sm btn-danger" data-action="delete-article">${icon('trash')} 删除文献</button>
          </div>
        </div>
        <div class="rail-card">
          <h4>技术栈</h4>
          <div class="tag-line">${article.stacks.length ? stackChips(article.stacks) : '<span class="muted small">尚未归类</span>'}</div>
          <button class="btn btn-sm mt-12" data-action="manage-stacks">管理分类</button>
        </div>
        ${article.tags.length ? `<div class="rail-card"><h4>标签</h4><div class="tag-line">${article.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div></div>` : ''}
        ${article.keywords?.length ? `<div class="rail-card"><h4>关键词</h4><div class="tag-line">${article.keywords.slice(0, 14).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div></div>` : ''}
        <p class="rail-note">此页面所有判断均保存在本地数据库。PDF 由本地服务直接提供，不经过第三方。</p>
      </aside>
    </div>
    <div class="savebar" id="intel-savebar" hidden><span>情报卡有未保存修改</span><span class="spacer"></span><button class="btn btn-ghost" type="button" id="intel-reset">放弃</button><button class="btn btn-accent" type="button" id="intel-save">${icon('check')} 保存修改</button></div>
  </div>`;

  document.getElementById('status-select').addEventListener('change', async (e) => {
    const value = e.target.value;
    try {
      await api(`/articles/${article.id}`, { method: 'PATCH', body: { status: value } });
      article.status = value;
      toast(`状态已更新为「${STATUS[value].label}」`, 'ok');
      refreshShell();
    } catch (err) { toast(err.message, 'err'); e.target.value = article.status; }
  });

  if (tab === 'intel' && !readMode) bindIntelTab(article);
  if (tab === 'authors') bindAuthorsTab(article);
  if (tab === 'critiques') bindCritiquesTab(article);
  if (tab === 'pdf') bindPdfTab(article);
}

function intelTab(article, readMode = false) {
  const intel = article.intel || {};
  const showTheory = article.is_kinetics || THEORY_FIELDS.some(([k]) => String(intel[k] || '').trim());
  const source = intel.generated_by || article.analysis_source;
  const sourceText = source === 'manual' ? '人工编辑版本' : '规则自动抽取结果';
  let banner = '';
  if (!article.full_text) {
    banner = `<div class="analysis-banner">${icon('warn')}<div><strong>尚未抽取到全文</strong>当前情报可能为空。请在“原文 PDF”页签上传可解析的 PDF，或手工编辑字段。</div><a class="btn btn-sm" href="#/articles/${article.id}?tab=pdf">去处理</a></div>`;
  } else if (source === 'heuristic') {
    banner = `<div class="analysis-banner">${icon('spark')}<div><strong>当前是规则抽取的初稿</strong>建议逐条核对证据，并直接用下方字段修正；公式可用 LaTeX 书写。</div><button class="btn btn-sm" data-action="analyze">${icon('refresh')} 重新抽取</button></div>`;
  } else if (source === 'manual') {
    banner = `<div class="analysis-banner" style="background:#eef1f4;border-color:#d9e0e5;color:#435a69">${icon('edit')}<div><strong>${sourceText}</strong>以人工判断为准；重新分析时默认保留已有字段。</div></div>`;
  }
  const renderField = ([key, label, hint], idx, full = false) => {
    const value = intel[key] || '';
    const ev = Array.isArray(intel.evidence?.[key]) ? intel.evidence[key].filter(Boolean) : [];
    const conf = intel.confidence?.[key] || (value ? 'medium' : 'low');
    const canPreview = !readMode && value && hasMath(value);
    return `<div class="intel-field ${full ? 'full' : ''}">
      <div class="intel-label"><span class="idx">${String(idx).padStart(2, '0')}</span>${label}<span class="conf"><i class="conf-dot ${conf}"></i>${CONF[conf]}</span></div>
      ${readMode
        ? `<div class="math-content">${value ? renderMathText(value) : '<span class="muted">未填写</span>'}</div>`
        : `<textarea class="intel-textarea ${hasMath(value) ? 'math-source' : ''}" data-intel-field="${key}" rows="2" placeholder="${esc(hint)}">${esc(value)}</textarea>${canPreview ? `<div class="formula-preview"><div class="formula-preview-label">WebTeX 预览 · 源码为上方 LaTeX</div><div class="math-content">${renderMathText(value)}</div></div>` : ''}`}
      ${ev.length ? `<details class="evidence"><summary>原文证据 ${ev.length}</summary>${ev.map((q) => `<blockquote>${renderMathText(q)}</blockquote>`).join('')}</details>` : ''}
    </div>`;
  };
  const modeBar = `<div class="intel-modebar">
    <span>${readMode ? '阅读模式 · 公式由 WebTeX 本地渲染' : '编辑模式 · 行内公式写 $...$，独立公式写 $$...$$'}</span>
    <div class="head-actions">
      ${readMode ? '' : `<button class="btn btn-sm" type="button" id="intel-preview-btn">${icon('spark')} 预览当前编辑</button>`}
      <a class="btn btn-sm ${readMode ? 'btn-primary' : 'btn-accent'}" href="#/articles/${article.id}?tab=intel&mode=${readMode ? 'edit' : 'read'}">${readMode ? `${icon('edit')} 编辑情报` : `${icon('spark')} 公式阅读`}</a>
    </div>
  </div>`;
  return `
    ${banner}
    ${modeBar}
    <div class="kinetics-panel">
      <div class="kinetics-head">
        <div><h2>${article.is_kinetics ? '化学动力学变量' : '理论变量'}</h2><p>${article.is_kinetics ? '哈密顿量 / 泛函 / 势函数 · 动力学方法 · 可观测量' : '本文未判定为动力学文献；以下字段可留空'}</p></div>
        <span class="badge ${article.is_kinetics ? 'badge-teal' : 'badge-muted'}">${article.is_kinetics ? '动力学理论' : '非动力学'}</span>
      </div>
      <div class="intel-vars">
        ${THEORY_FIELDS.map((f, i) => renderField(f, i + 3, f[0] === 'observables')).join('')}
      </div>
    </div>
    <div class="card panel">
      <div class="panel-head"><div><h2>核心情报</h2><div class="sub">每个字段均可直接编辑；带“原文证据”的引文来自 PDF 正文</div></div><span class="badge badge-outline">${sourceText}</span></div>
      ${INTEL_FIELDS.map((f, i) => `<div class="summary-card">${renderField(f, i + 1, true)}</div>`).join('')}
    </div>
    <div class="assessment">
      <h3>${icon('target')} 独立评估与可复现性</h3>
      <div class="intel-label" style="margin-bottom:4px">审稿式判断 <span class="conf"><i class="conf-dot ${intel.confidence?.conclusions || 'low'}"></i>证据基础</span></div>
      ${readMode
        ? `<div class="math-content">${intel.critical_assessment ? renderMathText(intel.critical_assessment) : '<span class="muted">未填写</span>'}</div>`
        : `<textarea class="intel-textarea" data-intel-field="critical_assessment" rows="3" placeholder="最强证据、最弱环节、可复现性风险、与已有工作的冲突…">${esc(intel.critical_assessment || '')}</textarea>`}
      <div class="divider"></div>
      <div class="form-grid">
        <div class="field"><label>理论框架</label>${readMode ? `<div class="math-content">${intel.theory_framework ? renderMathText(intel.theory_framework) : '<span class="muted">未填写</span>'}</div>` : `<textarea class="intel-textarea" data-intel-field="theory_framework" rows="2" placeholder="量子 / 经典 / 半经典 / 统计 / 开放体系…">${esc(intel.theory_framework || '')}</textarea>`}</div>
        <div class="field"><label>关键近似</label>${readMode ? `<div class="math-content">${intel.approximations ? renderMathText(intel.approximations) : '<span class="muted">未填写</span>'}</div>` : `<textarea class="intel-textarea" data-intel-field="approximations" rows="2" placeholder="BO 近似、谐波近似、Markov 近似…">${esc(intel.approximations || '')}</textarea>`}</div>
        <div class="field span-2"><label>软件 / 程序</label>${readMode ? `<div class="math-content">${intel.software ? renderMathText(intel.software) : '<span class="muted">未填写</span>'}</div>` : `<textarea class="intel-textarea" data-intel-field="software" rows="1" placeholder="VASP、Gaussian、LAMMPS、i-PI…">${esc(intel.software || '')}</textarea>`}</div>
      </div>
    </div>
    ${!showTheory ? `<p class="small muted" style="margin-top:8px">提示：若这其实是一篇动力学理论文章，可在“编辑信息”中把“化学动力学”设为“是”，字段将保持展开。</p>` : ''}`;
}

function bindIntelTab(article) {
  const savebar = document.getElementById('intel-savebar');
  const markDirty = () => {
    dirty = true;
    savebar.hidden = false;
  };
  const grow = (el) => {
    el.style.height = 'auto';
    el.style.height = `${Math.max(44, el.scrollHeight + 2)}px`;
  };
  app.querySelectorAll('.intel-textarea').forEach((el) => {
    grow(el);
    el.addEventListener('input', () => { grow(el); markDirty(); });
  });
  document.getElementById('intel-preview-btn')?.addEventListener('click', () => {
    const values = {};
    app.querySelectorAll('[data-intel-field]').forEach((el) => { values[el.dataset.intelField] = el.value; });
    const labels = [
      ...INTEL_FIELDS.map(([key, label]) => [key, label]),
      ...THEORY_FIELDS.map(([key, label]) => [key, label]),
      ['critical_assessment', '独立评估'],
      ['theory_framework', '理论框架'],
      ['approximations', '关键近似'],
      ['software', '软件 / 程序'],
    ];
    const body = `<p class="small muted" style="margin:0 0 14px">这是当前编辑框中的未保存内容；公式由本地 WebTeX 渲染。</p>
      ${labels.map(([key, label]) => `<div class="formula-preview" style="margin-bottom:10px"><div class="formula-preview-label">${esc(label)}</div><div class="math-content">${values[key]?.trim() ? renderMathText(values[key]) : '<span class="muted">未填写</span>'}</div></div>`).join('')}`;
    openModal({ title: '情报公式预览', subtitle: '未保存内容 · WebTeX 本地渲染', wide: true, body });
  });
  document.getElementById('intel-save').onclick = async () => {
    const intel = { ...(article.intel || {}) };
    app.querySelectorAll('[data-intel-field]').forEach((el) => { intel[el.dataset.intelField] = el.value.trim(); });
    try {
      await api(`/articles/${article.id}`, { method: 'PATCH', body: { intel } });
      dirty = false;
      savebar.hidden = true;
      toast('情报卡已保存', 'ok');
      await refreshShell();
      route();
    } catch (err) { toast(err.message, 'err'); }
  };
  document.getElementById('intel-reset').onclick = () => { dirty = false; savebar.hidden = true; route(); };

  if (article.critiques.length) {
    // Keep the question mark visible: critique memory is deliberately surfaced in the rail.
  }
}

function authorsTab(article) {
  const authors = article.authors || [];
  const corr = authors.filter((a) => a.corresponding);
  return `<div class="card panel">
    <div class="panel-head"><div><h2>作者与通讯作者</h2><div class="sub">通讯作者决定后续追踪重点；自动推断结果请对照 PDF 首页或投稿系统确认</div></div><div class="head-actions"><button class="btn btn-sm" data-action="infer-corresponding">${icon('spark')} 重新识别通讯作者</button><button class="btn btn-sm" type="button" id="add-author">${icon('plus')} 添加作者</button></div></div>
    ${corr.length ? `<div class="author-profile-grid" style="margin-bottom:16px">${corr.map((a) => `<div class="author-corr-card">
      <div class="avatar">${esc(initials(a.name))}</div>
      <div style="min-width:0;flex:1"><h4>${a.id ? `<a href="#/authors/${a.id}" class="link">${esc(a.name)}</a>` : esc(a.name)} <span class="badge badge-accent">通讯</span>${a.corresponding_source && !['manual', 'confirmed'].includes(a.corresponding_source) ? `<span class="badge badge-gold" title="${esc(a.corresponding_reason || '')}">自动推断 · ${a.corresponding_confidence === 'high' ? '高' : a.corresponding_confidence === 'medium' ? '中' : '低'}置信</span>` : ''}</h4>
        <p>${esc(a.affiliation || a.profile_affiliation || '机构未录入')}${a.email ? `<br>${esc(a.email)}` : ''}${a.corresponding_reason ? `<br><span class="small">${esc(a.corresponding_reason)}</span>` : ''}</p>
        <div class="links">${a.website ? `<a href="${esc(safeUrl(a.website))}" target="_blank" rel="noopener">个人主页 ${icon('external')}</a>` : ''}${a.id ? `<a href="#/authors/${a.id}">作者雷达 ${icon('arrow')}</a>` : ''}</div>
      </div></div>`).join('')}</div>` : `<div class="analysis-banner">${icon('warn')}<div><strong>还没有标记通讯作者</strong>在下方勾选“通讯”，保存后即可在作者雷达中持续追踪其方向与最新动态。</div></div>`}
    <table class="author-table"><thead><tr><th></th><th>姓名</th><th>机构</th><th>通讯</th><th></th></tr></thead>
      <tbody id="author-rows">${authors.map((a) => authorRow(a)).join('')}</tbody></table>
    <div class="settings-actions"><button class="btn btn-primary" type="button" id="save-authors">${icon('check')} 保存作者信息</button><a class="btn" href="#/authors">打开作者雷达</a></div>
    <p class="small muted" style="margin-top:10px">保存后，同名作者会自动合并到同一条作者档案；机构、主页与研究方向在作者详情页维护。</p>
  </div>`;
}
function authorRow(a = {}) {
  return `<tr>
    <td class="drag">${a.id ? `<a href="#/authors/${a.id}" title="打开作者档案">${icon('user')}</a>` : icon('plus')}</td>
    <td><input class="input" data-author-name value="${esc(a.name || '')}" placeholder="作者姓名" /></td>
    <td><input class="input" data-author-aff value="${esc(a.affiliation || a.profile_affiliation || '')}" placeholder="机构（可选）" /></td>
    <td><label class="check"><input type="checkbox" data-author-corr ${a.corresponding ? 'checked' : ''} /> 通讯</label>${a.corresponding && a.corresponding_source && !['manual', 'confirmed'].includes(a.corresponding_source) ? `<span class="badge badge-gold" style="margin-left:4px" title="${esc(a.corresponding_reason || '')}">推断</span>` : ''}</td>
    <td class="row-actions"><button class="icon-btn" type="button" data-remove-author title="移除" style="width:28px;height:28px">${icon('close')}</button></td>
  </tr>`;
}
function bindAuthorsTab(article) {
  const bindRemove = (btn) => { btn.onclick = () => btn.closest('tr').remove(); };
  app.querySelectorAll('[data-remove-author]').forEach(bindRemove);
  document.getElementById('add-author').onclick = () => {
    const tbody = document.getElementById('author-rows');
    tbody.insertAdjacentHTML('beforeend', authorRow({}));
    const row = tbody.querySelector('tr:last-child');
    bindRemove(row.querySelector('[data-remove-author]'));
    row.querySelector('[data-author-name]').focus();
  };
  document.getElementById('save-authors').onclick = async () => {
    const authors = [...document.querySelectorAll('#author-rows tr')].map((tr, i) => ({
      name: tr.querySelector('[data-author-name]').value.trim(),
      affiliation: tr.querySelector('[data-author-aff]').value.trim(),
      corresponding: tr.querySelector('[data-author-corr]').checked,
      position: i,
    })).filter((a) => a.name);
    if (!authors.length) return toast('至少需要一位作者', 'err');
    try {
      await api(`/articles/${article.id}`, { method: 'PATCH', body: { authors } });
      toast('作者信息已保存', 'ok');
      await refreshShell();
      route();
    } catch (err) { toast(err.message, 'err'); }
  };
}

function critiquesTab(article) {
  const list = article.critiques || [];
  const summary = {
    total: list.length,
    open: list.filter((c) => c.status === 'open').length,
    challenge: list.filter((c) => c.stance === 'challenge').length,
    question: list.filter((c) => c.stance === 'question').length,
  };
  const assessment = article.intel?.critical_assessment;
  return `<div class="critique-summary">
    <div class="crit-mini"><strong>${summary.total}</strong><span>累计判断</span></div>
    <div class="crit-mini"><strong>${summary.open}</strong><span>开放中</span></div>
    <div class="crit-mini"><strong>${summary.challenge}</strong><span>明确质疑</span></div>
    <div class="crit-mini"><strong>${summary.question}</strong><span>存疑</span></div>
  </div>
  ${assessment ? `<div class="assessment"><h3>${icon('target')} 当前独立评估</h3><div class="summary-text math-content">${renderMathText(assessment)}</div><p class="small muted" style="margin:8px 0 0">这段评估由平台抽取或人工填写，可回到情报卡编辑。</p></div>` : ''}
  <div class="critique-form">
    <div class="panel-head" style="margin-bottom:10px"><div><h2 style="font-size:17px">记录一条批判</h2><div class="sub">批判会永久保留，并进入作者页面的“批判记忆”</div></div></div>
    <form id="critique-form">
      <div class="form-row" style="margin-bottom:10px">
        <div class="field" style="max-width:140px"><label>立场</label><select class="select" name="stance"><option value="challenge">质疑</option><option value="question" selected>存疑</option><option value="support">支持</option><option value="note">批注</option></select></div>
        <div class="field" style="max-width:140px"><label>维度</label><select class="select" name="dimension">${Object.entries(DIMENSION).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
        <div class="field" style="max-width:150px"><label>严重度 <span id="sev-val" class="muted">3</span>/5</label><input type="range" name="severity" min="1" max="5" value="3" style="accent-color:var(--accent)" /></div>
        <div class="field" style="max-width:110px"><label>署名</label><input class="input" name="critic" value="我" /></div>
      </div>
      <div class="field"><label>批判内容 <span class="warn-text">*</span></label><textarea class="textarea" name="content" required placeholder="例如：作者用谐波近似处理低频模式，但 300 K 下量子核效应不可忽略；速率常数可能被高估。"></textarea></div>
      <div class="field" style="margin-top:10px"><label>证据 / 原文位置</label><input class="input" name="evidence" placeholder="页码、公式号、图中数据，或你掌握的对照文献" /></div>
      <div class="settings-actions"><button class="btn btn-primary" type="submit">${icon('plus')} 保存批判</button></div>
    </form>
  </div>
  <div id="critique-list">${list.length ? list.map(critiqueItem).join('') : emptyBlock({ title: '还没有批判记录', text: '读完方法或结论后，把“为什么不信/为什么重要”写下来。它会成为下一篇论文的对照。', iconName: 'chat' })}</div>`;
}
function critiqueItem(c) {
  return `<div class="critique-item" data-critique="${c.id}">
    <div class="critique-head">
      <span class="badge ${STANCE[c.stance]?.cls || 'badge-muted'}">${STANCE[c.stance]?.label || esc(c.stance)}</span>
      <span class="badge badge-outline">${DIMENSION[c.dimension] || esc(c.dimension)}</span>
      <span class="severity">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= c.severity ? 'on' : ''}"></i>`).join('')}</span>
      <span class="small muted">${esc(c.critic || '我')}</span>
      <span class="when">${fmtDateTime(c.created_at)}</span>
    </div>
    <div class="critique-body math-content">${renderMathText(c.content)}</div>
    ${c.evidence ? `<div class="critique-evidence math-content">${renderMathText(c.evidence)}</div>` : ''}
    <div class="critique-foot">
      <select class="status-select" data-critique-status="${c.id}"><option value="open" ${c.status === 'open' ? 'selected' : ''}>开放</option><option value="addressed" ${c.status === 'addressed' ? 'selected' : ''}>已回应</option><option value="dismissed" ${c.status === 'dismissed' ? 'selected' : ''}>已搁置</option></select>
      <span class="spacer"></span>
      <button class="btn btn-sm" data-action="critique-edit" data-id="${c.id}">${icon('edit')} 编辑</button>
      <button class="btn btn-sm btn-danger" data-action="critique-delete" data-id="${c.id}">${icon('trash')} 删除</button>
    </div>
  </div>`;
}
function bindCritiquesTab(article) {
  const sev = app.querySelector('[name=severity]');
  sev.addEventListener('input', () => { document.getElementById('sev-val').textContent = sev.value; });
  document.getElementById('critique-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      article_id: article.id,
      stance: fd.get('stance'),
      dimension: fd.get('dimension'),
      severity: Number(fd.get('severity')),
      critic: fd.get('critic'),
      content: fd.get('content'),
      evidence: fd.get('evidence'),
    };
    try {
      await api('/critiques', { method: 'POST', body });
      toast('批判已记录', 'ok');
      await refreshShell();
      route();
    } catch (err) { toast(err.message, 'err'); }
  });
  app.querySelectorAll('[data-critique-status]').forEach((sel) => {
    sel.onchange = async () => {
      try {
        await api(`/critiques/${sel.dataset.critiqueStatus}`, { method: 'PATCH', body: { status: sel.value } });
        toast('批判状态已更新', 'ok');
      } catch (err) { toast(err.message, 'err'); }
    };
  });
}

function pdfTab(article) {
  return `<div class="card panel">
    <div class="panel-head"><div><h2>原文 PDF</h2><div class="sub">${article.pdf_exists ? '浏览器内嵌阅读；也可下载后用批注工具精读' : '当前没有可用的 PDF 文件'}</div></div>
      ${article.pdf_exists ? `<div class="head-actions"><a class="btn btn-sm" href="/api/articles/${article.id}/pdf?download=1">${icon('download')} 下载</a><a class="btn btn-sm" target="_blank" rel="noopener" href="/api/articles/${article.id}/pdf">${icon('external')} 新窗口</a></div>` : ''}
    </div>
    ${article.pdf_exists ? `<iframe class="pdf-frame" src="/api/articles/${article.id}/pdf#view=FitH" title="PDF 原文"></iframe>
      <div class="pdf-meta"><span>${esc(article.pdf_filename || 'paper.pdf')}</span><span>${article.page_count || '—'} 页</span><span>${fmtBytes(article.pdf_size)}</span><span>全文抽取：${article.text_status === 'ok' ? '成功' : '失败'}</span><span>SHA-256：${esc((article.pdf_sha256 || '').slice(0, 16))}…</span></div>
      <p class="small muted">若浏览器内嵌阅读器空白（部分企业策略或 PDF 插件限制），请用“新窗口”或“下载”打开。</p>` : `<div class="pdf-missing">${emptyBlock({ title: '没有 PDF', text: '上传 PDF 后即可在线阅读，并会自动重新抽取全文与情报。', iconName: 'pdf' })}</div>`}
    <div class="divider"></div>
    <h3 style="font-family:var(--serif);font-weight:550;font-size:16px;margin:0 0 8px">${article.pdf_exists ? '替换 PDF' : '上传 PDF'}</h3>
    <form id="pdf-form" class="form-row"><div class="field" style="flex:1;min-width:220px"><input class="input" type="file" name="file" accept="application/pdf,.pdf" required /><small>替换后会重新抽取全文与情报；已有手工字段在自动分析时保留。</small></div><button class="btn btn-primary" type="submit">${icon('upload')} 上传并重新抽取</button></form>
    ${article.text_error ? `<div class="notice" style="margin-top:12px">上次抽取错误：${esc(article.text_error)}</div>` : ''}
  </div>`;
}
function bindPdfTab(article) {
  const form = document.getElementById('pdf-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = form.querySelector('input[type=file]').files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px"></span> 处理中…';
    try {
      await api(`/articles/${article.id}/pdf`, { method: 'POST', body: fd });
      toast('PDF 已替换并重新抽取', 'ok');
      route();
    } catch (err) {
      toast(err.message, 'err');
      btn.disabled = false;
      btn.innerHTML = `${icon('upload')} 上传并重新抽取`;
    }
  });
}

function historyTab(article) {
  return `<div class="card panel">
    <div class="panel-head"><div><h2>分析历史</h2><div class="sub">每次自动/人工保存都会留下版本；当前保留最近 50 次</div></div><span class="badge badge-outline">${article.revisions.length} 个版本</span></div>
    ${article.revisions.length ? `<div class="timeline">${article.revisions.map((r) => `<div class="timeline-item">
      <div class="date">${fmtDateTime(r.created_at)} · ${esc(r.source)}</div>
      <h4>${esc(r.note || '情报更新')}</h4>
    </div>`).join('')}</div>` : '<p class="muted small">尚无历史版本。</p>'}
    <div class="notice">版本快照保存在数据库中，可用于回溯；暂未提供一键回滚，避免覆盖后续人工判断。</div>
  </div>`;
}

function openMetaModal(article, stacks) {
  const selected = new Set(article.stacks.map((s) => s.id));
  const m = openModal({
    title: '编辑文献信息',
    subtitle: '元数据、技术栈与动力学判定',
    wide: true,
    body: `<form id="meta-form">
      <div class="form-grid">
        <div class="field span-2"><label>标题</label><input class="input" name="title" value="${esc(article.title)}" required /></div>
        <div class="field"><label>期刊</label><input class="input" name="journal" value="${esc(article.journal)}" /></div>
        <div class="field"><label>年份</label><input class="input" type="number" name="year" value="${article.year || ''}" min="1800" max="2100" /></div>
        <div class="field"><label>DOI</label><input class="input" name="doi" value="${esc(article.doi)}" placeholder="10.xxxx/xxxxx" /></div>
        <div class="field"><label>标签</label><input class="input" name="tags" value="${esc(article.tags.join(', '))}" placeholder="逗号分隔" /></div>
        <div class="field span-2"><label>技术栈</label>${stackPickerHtml(stacks, selected, { name: 'stack' })}</div>
        <div class="field"><label>状态</label><select class="select" name="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${article.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
        <div class="field"><label>化学动力学</label><label class="check" style="margin-top:8px"><input type="checkbox" name="is_kinetics" ${article.is_kinetics ? 'checked' : ''} /> 这是化学动力学/反应动力学理论文献</label></div>
      </div>
    </form>`,
    footer: `<button class="btn left" type="button" id="doi-fill">${icon('sync')} 从 DOI 补全</button><button class="btn" type="button" data-close-modal>取消</button><button class="btn btn-primary" type="button" id="meta-save">${icon('check')} 保存</button>`,
  });
  bindStackPickers(m.root);
  m.root.querySelector('#doi-fill').onclick = async () => {
    const doi = m.root.querySelector('[name=doi]').value.trim();
    if (!doi) return toast('请先填写 DOI', 'err');
    const btn = m.root.querySelector('#doi-fill');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px"></span> 查询中…';
    try {
      await api(`/articles/${article.id}/doi`, { method: 'POST', body: { doi } });
      toast('Crossref 信息已补全', 'ok');
      m.close();
      route();
    } catch (err) {
      toast(err.message, 'err');
      btn.disabled = false;
      btn.innerHTML = `${icon('sync')} 从 DOI 补全`;
    }
  };
  m.root.querySelector('#meta-save').onclick = async () => {
    const form = m.root.querySelector('#meta-form');
    const fd = new FormData(form);
    const body = {
      title: String(fd.get('title') || '').trim(),
      journal: fd.get('journal'),
      year: fd.get('year') || null,
      doi: fd.get('doi'),
      tags: fd.get('tags'),
      status: fd.get('status'),
      is_kinetics: !!fd.get('is_kinetics'),
      stack_ids: [...form.querySelectorAll('[name=stack]:checked')].map((x) => Number(x.value)),
    };
    if (!body.title) return toast('标题不能为空', 'err');
    try {
      await api(`/articles/${article.id}`, { method: 'PATCH', body });
      toast('文献信息已保存', 'ok');
      m.close();
      await refreshShell();
      route();
    } catch (err) { toast(err.message, 'err'); }
  };
}

function openStackModal(article, stacks) {
  const selected = new Set(article.stacks.map((s) => s.id));
  const m = openModal({
    title: '文献技术栈',
    subtitle: '可多选；技术栈本身可在“技术栈”页维护',
    body: `${stackPickerHtml(stacks, selected, { name: 'picked-stack', label: '选择技术栈（可多选，父级与子级都可归类）' })}
      <p class="small muted" style="margin-top:12px">方法线索（来自情报抽取）：${suggestHint(article)}</p>`,
    footer: `<a class="btn left" href="#/stacks">管理技术栈</a><button class="btn" type="button" id="stack-auto">${icon('spark')} 按关键词重新归类</button><button class="btn" type="button" data-close-modal>取消</button><button class="btn btn-primary" type="button" id="stack-save">保存分类</button>`,
  });
  bindStackPickers(m.root);
  m.root.querySelector('#stack-auto').onclick = async () => {
    const ok = await confirmDialog({ title: '重新自动归类', message: '将根据标题、摘要与全文重新匹配技术栈，只替换“自动”来源的分类，保留手工分类。继续吗？', confirmText: '重新归类', danger: false });
    if (!ok) return;
    try {
      const res = await api(`/articles/${article.id}/reclassify-stacks`, { method: 'POST', body: {} });
      toast(`已自动归类：${(res.suggestions || []).map((x) => x.path).join('、') || '未命中关键词'}`, 'ok');
      m.close();
      route();
    } catch (err) { toast(err.message, 'err'); }
  };
  m.root.querySelector('#stack-save').onclick = async () => {
    const ids = [...m.root.querySelectorAll('input[type=checkbox]:checked')].map((x) => Number(x.value));
    try {
      await api(`/articles/${article.id}`, { method: 'PATCH', body: { stack_ids: ids } });
      toast('技术栈已更新', 'ok');
      m.close();
      stacksCache = null;
      route();
    } catch (err) { toast(err.message, 'err'); }
  };
}
function suggestHint(article) {
  const labels = article.intel?.method_labels;
  return labels?.length ? labels.slice(0, 5).join('、') : '暂未识别到明显方法关键词';
}

function articleMarkdown(a) {
  const i = a.intel || {};
  const section = (title, value) => `## ${title}\n${String(value || '（未填写）').trim()}\n`;
  return `# ${a.title || '未命名文献'}\n\n- 作者：${(a.authors || []).map((x) => x.name + (x.corresponding ? '（通讯）' : '')).join(', ') || a.authors_text || '未录入'}\n- 期刊：${a.journal || '—'}\n- 年份：${a.year || '—'}\n- DOI：${a.doi || '—'}\n- 技术栈：${(a.stacks || []).map((s) => s.name).join('、') || '—'}\n- 情报来源：${i.generated_by || a.analysis_source || '—'}\n\n${section('1. 解决了什么科学问题', i.scientific_question)}${section('2. 采用什么方法', i.methods)}## 3. 理论变量与动力学\n- 哈密顿量：${(i.hamiltonian || '—').replace(/\n/g, ' ')}\n- 泛函：${(i.functional || '—').replace(/\n/g, ' ')}\n- 势函数：${(i.potential || '—').replace(/\n/g, ' ')}\n- 动力学方法：${(i.dynamics_methods || '—').replace(/\n/g, ' ')}\n- 可观测量：${(i.observables || '—').replace(/\n/g, ' ')}\n\n${section('4. 达成了什么结论', i.conclusions)}${section('5. 局限与独立评估', [i.limitations, i.critical_assessment].filter(Boolean).join('\n\n'))}\n## 批判记忆\n${a.critiques?.length ? a.critiques.map((c) => `- [${STANCE[c.stance]?.label || c.stance}/${DIMENSION[c.dimension] || c.dimension}] ${c.content}`).join('\n') : '（暂无）'}\n`;
}

/* ============================== AUTHORS ============================== */
async function authorsPage(params, seq) {
  const q = params.get('q') || '';
  const sort = params.get('sort') || 'articles';
  const data = await api(`/authors?q=${encodeURIComponent(q)}&sort=${encodeURIComponent(sort)}`);
  if (seq !== renderSeq) return;
  const cards = data.items.map((a) => {
    const topics = (a.research?.topics || []).slice(0, 3);
    return `<a class="author-card" href="#/authors/${a.id}">
      <div class="author-card-head"><div class="avatar">${esc(initials(a.name))}</div><div style="min-width:0"><h3>${esc(a.name)}</h3><div class="small muted">${esc(a.affiliation || '机构未录入')}</div></div>${a.corresponding_count ? `<span class="badge badge-accent" style="margin-left:auto">通讯 ${a.corresponding_count}</span>` : ''}</div>
      <div class="direction">${esc(a.research_direction || (topics.length ? topics.map((t) => t.name).join(' · ') : '研究方向待补充'))}</div>
      <div class="mini-row"><span><b>${a.article_count}</b> 篇关联</span><span><b>${a.latest_year || '—'}</b> 最近年份</span><span>${a.latest_update ? `动态 ${fmtDate(a.latest_update)}` : '暂无动态'}</span></div>
    </a>`;
  }).join('');
  app.innerHTML = `<div class="page">
    <div class="page-head">
      <div><div class="eyebrow">Author radar</div><h1>作者雷达</h1><p>围绕通讯作者积累机构、方向、主页与最新动向；同名作者会自动合并为同一档案。</p></div>
      <div class="head-actions"><button class="btn" data-action="new-author">${icon('plus')} 新增关注作者</button><a class="btn btn-primary" href="#/upload">${icon('upload')} 从 PDF 导入</a></div>
    </div>
    <div class="toolbar">
      <div class="search-box">${icon('search')}<input class="input" id="author-search" type="search" placeholder="搜索姓名、机构、研究方向…" value="${esc(q)}" /></div>
      <select class="select" id="author-sort"><option value="articles" ${sort === 'articles' ? 'selected' : ''}>按关联文献</option><option value="recent" ${sort === 'recent' ? 'selected' : ''}>按最近更新</option><option value="name" ${sort === 'name' ? 'selected' : ''}>按姓名</option></select>
      <span class="small muted" style="margin-left:auto">${data.items.length} 位作者</span>
    </div>
    ${data.items.length ? `<div class="author-grid">${cards}</div>` : `<div class="card panel">${emptyBlock({ title: q ? '没有匹配的作者' : '作者雷达尚未建立', text: q ? '尝试更短的关键词。' : '上传文献并标记通讯作者后，这里会自动生成作者档案。', action: q ? '<a class="btn" href="#/authors">清空搜索</a>' : '<a class="btn btn-primary" href="#/upload">上传 PDF</a>', iconName: 'users' })}</div>`}
  </div>`;
  const search = document.getElementById('author-search');
  let timer;
  const apply = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => { if (!v) next.delete(k); else next.set(k, v); });
    navigate(`#/authors?${next.toString()}`);
  };
  search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => apply({ q: search.value.trim() }), 350); });
  document.getElementById('author-sort').onchange = (e) => apply({ sort: e.target.value });
}

function openAuthorModal(author) {
  const editing = !!author;
  const a = author || {};
  const m = openModal({
    title: editing ? '编辑作者档案' : '新增关注作者',
    subtitle: editing ? '这些信息只保存在本地' : '先建立档案，后续可从文献中自动关联',
    body: `<form id="author-form"><div class="form-grid">
      <div class="field"><label>姓名 *</label><input class="input" name="name" value="${esc(a.name || '')}" required /></div>
      <div class="field"><label>机构</label><input class="input" name="affiliation" value="${esc(a.affiliation || '')}" /></div>
      <div class="field"><label>邮箱</label><input class="input" name="email" value="${esc(a.email || '')}" /></div>
      <div class="field"><label>个人主页</label><input class="input" name="website" value="${esc(a.website || '')}" placeholder="https://…" /></div>
      <div class="field"><label>ORCID</label><input class="input" name="orcid" value="${esc(a.orcid || '')}" placeholder="0000-0000-0000-0000" /></div>
      <div class="field"><label>OpenAlex ID</label><input class="input" name="openalex_id" value="${esc(a.openalex_id || '')}" placeholder="A…（可留空自动匹配）" /></div>
      <div class="field span-2"><label>研究方向</label><textarea class="textarea" name="research_direction" rows="3">${esc(a.research_direction || '')}</textarea></div>
      <div class="field span-2"><label>备注</label><textarea class="textarea" name="notes" rows="2">${esc(a.notes || '')}</textarea></div>
    </div></form>`,
    footer: `<button class="btn" type="button" data-close-modal>取消</button><button class="btn btn-primary" type="button" id="author-save">${icon('check')} ${editing ? '保存' : '创建'}</button>`,
  });
  m.root.querySelector('#author-save').onclick = async () => {
    const form = m.root.querySelector('#author-form');
    const fd = new FormData(form);
    const body = Object.fromEntries(fd.entries());
    if (!String(body.name).trim()) return toast('姓名不能为空', 'err');
    try {
      const result = await api(editing ? `/authors/${a.id}` : '/authors', { method: editing ? 'PATCH' : 'POST', body });
      toast(editing ? '作者档案已保存' : '作者已创建', 'ok');
      m.close();
      if (!editing) navigate(`#/authors/${result.id}`); else route();
    } catch (err) { toast(err.message, 'err'); }
  };
}

async function authorDetailPage(id, seq) {
  if (!Number.isFinite(id) || id <= 0) throw new Error('无效的作者编号');
  const [author, critiques] = await Promise.all([
    api(`/authors/${id}`),
    api(`/critiques?author_id=${id}`).catch(() => ({ items: [] })),
  ]);
  const articleDetails = await Promise.allSettled((author.articles || []).slice(0, 8).map((a) => api(`/articles/${a.id}`)));
  if (seq !== renderSeq) return;
  viewState = { author, critiques: critiques.items || [] };
  const detailMap = new Map();
  articleDetails.forEach((r) => { if (r.status === 'fulfilled') detailMap.set(r.value.id, r.value); });
  const research = author.research || {};
  const topics = (research.topics || []).slice(0, 10);
  const website = author.website_summary;
  const scholar = `https://scholar.google.com/scholar?q=${encodeURIComponent(`"${author.name}"`)}`;
  const gsearch = `https://www.google.com/search?q=${encodeURIComponent(`"${author.name}" ${author.affiliation || ''} homepage`)}`;
  const corrArticles = author.articles.filter((a) => a.corresponding).length;

  app.innerHTML = `<div class="page detail">
    <div class="breadcrumb"><a href="#/authors">作者雷达</a>${icon('chevron')}<span>${esc(author.name)}</span></div>
    <section class="author-hero">
      <div class="avatar">${esc(initials(author.name))}</div>
      <div style="min-width:0;flex:1">
        <h1>${esc(author.name)}</h1>
        <div class="aff">${esc(author.affiliation || '机构未录入')}${corrArticles ? ` · ${corrArticles} 篇通讯作者` : ''}</div>
        <div class="links">
          ${author.website ? `<a href="${esc(safeUrl(author.website))}" target="_blank" rel="noopener">个人主页 ${icon('external')}</a>` : `<a href="${esc(gsearch)}" target="_blank" rel="noopener">查找主页 ${icon('external')}</a>`}
          <a href="${esc(scholar)}" target="_blank" rel="noopener">Google Scholar ${icon('external')}</a>
          ${author.orcid ? `<a href="https://orcid.org/${esc(encodeURIComponent(author.orcid))}" target="_blank" rel="noopener">ORCID ${icon('external')}</a>` : ''}
          ${author.openalex_id ? `<a href="https://openalex.org/${esc(encodeURIComponent(author.openalex_id))}" target="_blank" rel="noopener">OpenAlex ${icon('external')}</a>` : ''}
          ${author.email ? `<span>${esc(author.email)}</span>` : ''}
        </div>
      </div>
      <div class="hero-actions">
        <button class="btn btn-accent" data-action="author-sync">${icon('sync')} 同步 OpenAlex</button>
        <button class="btn" data-action="author-website">${icon('link')} 抓取主页</button>
        <button class="btn" data-action="author-edit">${icon('edit')} 编辑资料</button>
      </div>
    </section>
    <div class="metric-row">
      <div class="metric"><strong>${author.articles.length}</strong><span>关联文献</span></div>
      <div class="metric"><strong>${corrArticles}</strong><span>通讯作者身份</span></div>
      <div class="metric"><strong>${research.works_count ?? '—'}</strong><span>OpenAlex 论文数</span></div>
      <div class="metric"><strong>${research.h_index ?? '—'}</strong><span>h-index</span></div>
    </div>
    <div class="author-cols">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card panel">
          <div class="panel-head"><div><h2>研究方向</h2><div class="sub">${author.last_synced_at ? `OpenAlex 同步于 ${fmtDateTime(author.last_synced_at)}` : '可手动维护，或同步 OpenAlex 自动提取'}</div></div></div>
          <form id="research-form"><textarea class="textarea" name="research_direction" rows="3" placeholder="例如：气相反应速率理论、非绝热动力学、机器学习势函数…">${esc(author.research_direction || '')}</textarea><div class="settings-actions"><button class="btn btn-sm btn-primary" type="submit">${icon('check')} 保存方向</button></div></form>
          ${topics.length ? `<div class="topic-cloud" style="margin-top:12px">${topics.map((t) => `<span class="topic">${esc(t.name)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="card panel">
          <div class="panel-head"><div><h2>关联文献</h2><div class="sub">平台内已归档的论文与情报摘要</div></div><span class="badge badge-outline">${author.articles.length}</span></div>
          ${author.articles.length ? author.articles.map((a) => {
            const d = detailMap.get(a.id);
            return `<div class="author-article">
              <h4><a href="#/articles/${a.id}">${esc(a.title || '未命名文献')}</a> ${a.corresponding ? '<span class="badge badge-accent">通讯</span>' : ''}</h4>
              <p>${esc(a.journal || '—')} · ${a.year || '年份未知'} · ${statusBadge(a.status)} ${a.is_kinetics ? '<span class="badge badge-teal">动力学</span>' : ''}</p>
              ${d?.intel?.scientific_question ? `<div class="mini-q math-content">${renderMathText(d.intel.scientific_question)}</div>` : ''}
            </div>`;
          }).join('') : emptyBlock({ title: '尚无关联文献', text: '上传 PDF 并在作者列表中标记此作者。', action: '<a class="btn btn-sm" href="#/upload">上传 PDF</a>', iconName: 'book' })}
        </div>
        <div class="card panel">
          <div class="panel-head"><div><h2>批判记忆</h2><div class="sub">针对该作者论文的累计判断</div></div><a class="btn btn-sm" href="#/critiques?author_id=${author.id}">全部批判</a></div>
          ${(critiques.items || []).length ? (critiques.items || []).slice(0, 6).map((c) => `<div class="author-article">
            <div class="row-tags" style="margin:0 0 3px"><span class="badge ${STANCE[c.stance]?.cls || 'badge-muted'}">${STANCE[c.stance]?.label || esc(c.stance)}</span><span class="badge badge-outline">${DIMENSION[c.dimension] || esc(c.dimension)}</span></div>
            <p class="math-content" style="color:var(--ink-2);font-size:11.5px;line-height:1.65">${renderMathText(c.content)}</p>
            <a class="small link" href="#/articles/${c.article_id}?tab=critiques">${esc(c.article_title)}</a>
          </div>`).join('') : '<p class="muted small">还没有针对此作者论文的批判记录。</p>'}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card panel">
          <div class="panel-head"><div><h2>最新动向</h2><div class="sub">OpenAlex 论文与手动记录</div></div><button class="btn btn-sm" data-action="author-update-add">${icon('plus')} 记录</button></div>
          ${author.updates.length ? `<div class="timeline">${author.updates.slice(0, 15).map((u) => `<div class="timeline-item">
            <div class="date">${esc(u.occurred_on || fmtDate(u.created_at))} · ${UPDATE_KIND[u.kind] || esc(u.kind)}</div>
            <h4>${u.url ? `<a href="${esc(safeUrl(u.url))}" target="_blank" rel="noopener">${esc(u.title)}</a>` : esc(u.title)}</h4>
            ${u.detail ? `<p>${esc(u.detail)}</p>` : ''}
            <div class="actions"><button data-action="author-update-delete" data-id="${u.id}">删除</button></div>
          </div>`).join('')}</div>` : emptyBlock({ title: '暂无动态', text: '同步 OpenAlex 可拉取最近论文；也可以手动记录报告、新闻或主页变化。', action: '<button class="btn btn-sm" data-action="author-sync">同步 OpenAlex</button>', iconName: 'clock' })}
        </div>
        <div class="card panel">
          <div class="panel-head"><div><h2>主页快照</h2><div class="sub">从个人主页提取的标题与简介</div></div></div>
          ${website ? `<div class="website-box"><strong>${esc(website.title || author.website || '个人主页')}</strong><div>${esc(website.description || '')}</div>${website.text ? `<details class="evidence" style="margin-top:7px"><summary>页面文本摘录</summary><blockquote>${esc(String(website.text).slice(0, 900))}</blockquote></details>` : ''}<div class="small" style="margin-top:6px">抓取于 ${fmtDateTime(website.fetched_at)}</div></div>` : `<p class="muted small">还没有主页快照。填写主页地址后点击“抓取主页”，平台会提取页面标题与简介（不会访问内网地址）。</p>`}
        </div>
        <div class="card panel">
          <div class="panel-head"><div><h2>研究画像</h2><div class="sub">来自 OpenAlex</div></div></div>
          <div class="kv"><span>论文数</span><span>${research.works_count ?? '—'}</span></div>
          <div class="kv"><span>总被引</span><span>${research.cited_by_count ?? '—'}</span></div>
          <div class="kv"><span>h-index</span><span>${research.h_index ?? '—'}</span></div>
          <div class="kv"><span>i10-index</span><span>${research.i10_index ?? '—'}</span></div>
          <div class="kv"><span>机构</span><span>${esc((research.institutions || []).join('; ') || author.affiliation || '—')}</span></div>
          ${topics.length ? `<div class="tag-line" style="margin-top:10px">${topics.map((t) => `<span class="chip">${esc(t.name)}</span>`).join('')}</div>` : ''}
          ${author.notes ? `<div class="notice" style="margin-top:10px">${esc(author.notes)}</div>` : ''}
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById('research-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = new FormData(e.target).get('research_direction');
    try {
      await api(`/authors/${author.id}`, { method: 'PATCH', body: { research_direction: value } });
      toast('研究方向已保存', 'ok');
    } catch (err) { toast(err.message, 'err'); }
  });
}

function openAuthorUpdateModal(author) {
  const m = openModal({
    title: '记录作者动态',
    subtitle: '报告、新闻、新论文、主页变化或你的观察',
    body: `<form id="update-form"><div class="form-grid">
      <div class="field"><label>类型</label><select class="select" name="kind">${Object.entries(UPDATE_KIND).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
      <div class="field"><label>日期</label><input class="input" type="date" name="occurred_on" value="${localDateString()}" /></div>
      <div class="field span-2"><label>标题 *</label><input class="input" name="title" required placeholder="例如：新任 J. Chem. Phys. 副主编 / 新预印本" /></div>
      <div class="field span-2"><label>链接</label><input class="input" name="url" placeholder="https://…" /></div>
      <div class="field span-2"><label>详情</label><textarea class="textarea" name="detail" rows="3" placeholder="为什么值得关注？与你的研究有什么关系？"></textarea></div>
    </div></form>`,
    footer: `<button class="btn" type="button" data-close-modal>取消</button><button class="btn btn-primary" type="button" id="update-save">${icon('check')} 保存动态</button>`,
  });
  m.root.querySelector('#update-save').onclick = async () => {
    const fd = new FormData(m.root.querySelector('#update-form'));
    const body = Object.fromEntries(fd.entries());
    if (!String(body.title).trim()) return toast('标题不能为空', 'err');
    try {
      await api(`/authors/${author.id}/updates`, { method: 'POST', body });
      toast('动态已记录', 'ok');
      m.close();
      route();
    } catch (err) { toast(err.message, 'err'); }
  };
}

/* ============================== STACKS ============================== */
async function stacksPage(seq) {
  const stacks = await loadStacks(true);
  if (seq !== renderSeq) return;
  viewState = { stacks };
  const roots = stackRoots(stacks);
  const articleCount = (await api('/stats').catch(() => null))?.articles?.total ?? 0;
  const renderRow = (node, depth = 0) => {
    const kids = stackChildren(stacks, node.id);
    return `<div class="stack-row ${depth === 0 ? 'root' : ''}" style="--depth:${depth};--stack-color:${esc(node.color)}">
      <div class="stack-row-main">
        <span class="stack-dot"></span>
        <div class="stack-name-wrap">
          <div class="stack-name">${esc(node.name)} ${kids.length ? `<span class="badge badge-outline">${kids.length} 子类</span>` : ''}</div>
          <div class="stack-desc">${esc(node.description || '暂无描述')}</div>
          ${depth === 0 && node.keywords ? `<div class="stack-keywords">${esc(node.keywords)}</div>` : ''}
        </div>
        <div class="stack-count"><strong>${node.article_count || 0}</strong><span>篇${kids.length && node.direct_count ? ` · 直接 ${node.direct_count}` : ''}</span></div>
        <div class="stack-row-actions">
          <a class="icon-btn" href="#/library?stack=${node.id}" title="查看该分类下的文献">${icon('book')}</a>
          <button class="icon-btn" data-action="stack-add-child" data-id="${node.id}" title="新增子类">${icon('plus')}</button>
          <button class="icon-btn" data-action="stack-edit" data-id="${node.id}" title="编辑">${icon('edit')}</button>
          <button class="icon-btn" data-action="stack-delete" data-id="${node.id}" title="删除">${icon('trash')}</button>
        </div>
      </div>
      ${kids.length ? `<div class="stack-children">${kids.map((k) => renderRow(k, depth + 1)).join('')}</div>` : ''}
    </div>`;
  };
  app.innerHTML = `<div class="page">
    <div class="page-head">
      <div><div class="eyebrow">Taxonomy</div><h1>技术栈</h1><p>内置 8 个初始技术方向，可在页面上继续添加子分类。文章可以归入一个或多个分类；按父级筛选会自动包含全部子类。</p></div>
      <div class="head-actions"><button class="btn btn-primary" data-action="stack-new">${icon('plus')} 新建顶层分类</button><a class="btn" href="#/library">${icon('book')} 按技术栈浏览</a></div>
    </div>
    <div class="stack-overview">
      <div><strong>${roots.length}</strong><span>顶层方向</span></div>
      <div><strong>${stacks.length}</strong><span>分类节点</span></div>
      <div><strong>${articleCount}</strong><span>库内文献</span></div>
      <div><strong>${stacks.filter((s) => s.direct_count).length}</strong><span>直接使用的分类</span></div>
    </div>
    <div class="stack-tree card">
      <div class="stack-tree-head"><div><h2>分类树</h2><div class="sub">点击书本图标查看该分类（含子类）的文献</div></div><span class="badge badge-outline">初始分类</span></div>
      ${roots.length ? `<div class="stack-tree-body">${roots.map((r) => renderRow(r, 0)).join('')}</div>` : emptyBlock({ title: '还没有技术栈', text: '创建第一个顶层分类。', action: '<button class="btn btn-primary" data-action="stack-new">新建分类</button>', iconName: 'stack' })}
    </div>
    <div class="upload-note" style="margin-top:18px">${icon('spark')}<div><strong>自动归类逻辑：</strong>自动建议会优先匹配当前分类的关键词；没有匹配叶子时可归入父级。命中至少两个关键词，或命中一个高特异性短语/缩写时触发。父级计数自动汇总所有子类。</div></div>
  </div>`;
}

function openStackEditModal(stack, parentId = null) {
  const editing = !!stack;
  const stacks = viewState.stacks || stacksCache || [];
  const parent = parentId ? stacks.find((x) => x.id === parentId) : null;
  const s = stack || { color: parent?.color || '#2e7c71', sort_order: 500, parent_id: parentId };
  const parentOptions = stacks
    .filter((x) => !editing || (x.id !== s.id && !(x.path || '').startsWith(`${s.path || s.name} /`)))
    .map((x) => `<option value="${x.id}" ${Number(x.id) === Number(s.parent_id) ? 'selected' : ''}>${'— '.repeat(x.level || 0)}${esc(x.name)}</option>`)
    .join('');
  const m = openModal({
    title: editing ? '编辑技术栈' : '新建技术栈',
    subtitle: editing ? '可调整名称、父级与自动匹配关键词' : '选择父级可创建子类',
    wide: true,
    body: `<form id="stack-form"><div class="form-grid">
      <div class="field"><label>名称 *</label><input class="input" name="name" value="${esc(s.name || '')}" required /></div>
      <div class="field"><label>父级分类</label><select class="select" name="parent_id"><option value="">（顶层分类）</option>${parentOptions}</select></div>
      <div class="field"><label>颜色</label><input class="input" name="color" type="color" value="${esc(s.color || '#2e7c71')}" style="height:38px;padding:3px" /></div>
      <div class="field"><label>排序权重</label><input class="input" type="number" name="sort_order" value="${s.sort_order ?? 500}" /><small>数字越小越靠前</small></div>
      <div class="field span-2"><label>描述</label><input class="input" name="description" value="${esc(s.description || '')}" placeholder="这个分类关注什么？" /></div>
      <div class="field span-2"><label>自动匹配关键词</label><textarea class="textarea" name="keywords" rows="4" placeholder="用英文逗号分隔，例如：quantum dynamics, wavepacket, MCTDH">${esc(s.keywords || '')}</textarea><small>匹配不区分大小写；建议使用论文中会出现的英文术语。父级分类不参与自动建议，除非没有叶子命中。</small></div>
    </div></form>`,
    footer: `<button class="btn" type="button" data-close-modal>取消</button><button class="btn btn-primary" type="button" id="stack-save">${icon('check')} ${editing ? '保存' : '创建'}</button>`,
  });
  m.root.querySelector('#stack-save').onclick = async () => {
    const fd = new FormData(m.root.querySelector('#stack-form'));
    const body = Object.fromEntries(fd.entries());
    body.sort_order = Number(body.sort_order || 500);
    body.parent_id = body.parent_id ? Number(body.parent_id) : null;
    if (!String(body.name).trim()) return toast('名称不能为空', 'err');
    try {
      await api(editing ? `/stacks/${s.id}` : '/stacks', { method: editing ? 'PATCH' : 'POST', body });
      toast(editing ? '技术栈已更新' : '技术栈已创建', 'ok');
      m.close();
      stacksCache = null;
      await loadStacks(true);
      route();
    } catch (err) { toast(err.message, 'err'); }
  };
}

/* ============================== CRITIQUES ============================== */
async function critiquesPage(params, seq) {
  const status = params.get('status') || '';
  const stance = params.get('stance') || '';
  const authorId = params.get('author_id') || '';
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (stance) query.set('stance', stance);
  if (authorId) query.set('author_id', authorId);
  const data = await api(`/critiques?${query}`);
  if (seq !== renderSeq) return;
  viewState = { critiques: data.items };
  const summary = data.summary || {};
  const rows = data.items.map((c) => `<div class="critique-item">
    <div class="critique-head">
      <span class="badge ${STANCE[c.stance]?.cls || 'badge-muted'}">${STANCE[c.stance]?.label || esc(c.stance)}</span>
      <span class="badge badge-outline">${DIMENSION[c.dimension] || esc(c.dimension)}</span>
      <span class="severity">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= c.severity ? 'on' : ''}"></i>`).join('')}</span>
      <span class="small muted">${esc(c.critic || '我')}</span>
      <span class="when">${fmtDateTime(c.created_at)}</span>
    </div>
    <div class="critique-body math-content">${renderMathText(c.content)}</div>
    ${c.evidence ? `<div class="critique-evidence math-content">${renderMathText(c.evidence)}</div>` : ''}
    <div class="critique-foot">
      <select class="status-select" data-critique-status="${c.id}"><option value="open" ${c.status === 'open' ? 'selected' : ''}>开放</option><option value="addressed" ${c.status === 'addressed' ? 'selected' : ''}>已回应</option><option value="dismissed" ${c.status === 'dismissed' ? 'selected' : ''}>已搁置</option></select>
      <a class="small link" href="#/articles/${c.article_id}?tab=critiques" style="margin-left:8px;max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.article_title)}</a>
      <span class="spacer"></span>
      <button class="btn btn-sm" data-action="critique-edit" data-id="${c.id}">${icon('edit')} 编辑</button>
      <button class="btn btn-sm btn-danger" data-action="critique-delete" data-id="${c.id}">${icon('trash')} 删除</button>
    </div>
  </div>`).join('');
  app.innerHTML = `<div class="page">
    <div class="page-head">
      <div><div class="eyebrow">Critical memory</div><h1>批判记忆</h1><p>不只是收藏论文，也收藏你对论文的判断。这些记录会进入作者档案，并作为后续阅读与判断的上下文。</p></div>
      <div class="head-actions"><a class="btn btn-primary" href="#/library">${icon('book')} 去文献库写批判</a></div>
    </div>
    ${authorId ? `<div class="notice" style="margin-bottom:12px">当前仅显示该作者关联论文的批判。<a class="link" href="#/critiques">清除筛选</a></div>` : ''}
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat-card"><div class="stat-top"><span>累计批判</span>${icon('chat')}</div><strong>${summary.total || 0}</strong><small>持续积累的判断</small></div>
      <div class="stat-card"><div class="stat-top"><span>开放中</span>${icon('clock')}</div><strong>${summary.open || 0}</strong><small>尚待回应/解决</small></div>
      <div class="stat-card"><div class="stat-top"><span>明确质疑</span>${icon('warn')}</div><strong>${summary.challenges || 0}</strong><small>方法、数据或结论</small></div>
      <div class="stat-card"><div class="stat-top"><span>存疑</span>${icon('target')}</div><strong>${summary.questions || 0}</strong><small>需要更多证据</small></div>
    </div>
    <div class="filter-pills">
      <a class="pill ${!status && !stance ? 'active' : ''}" href="#/critiques${authorId ? `?author_id=${authorId}` : ''}">全部</a>
      ${Object.entries(STANCE).map(([k, v]) => `<a class="pill ${stance === k ? 'active' : ''}" href="#/critiques?stance=${k}${authorId ? `&author_id=${authorId}` : ''}">${v.label}</a>`).join('')}
      <span style="width:1px;background:var(--line);margin:0 4px"></span>
      ${Object.entries({ open: '开放', addressed: '已回应', dismissed: '已搁置' }).map(([k, v]) => `<a class="pill ${status === k ? 'active' : ''}" href="#/critiques?status=${k}${authorId ? `&author_id=${authorId}` : ''}">${v}</a>`).join('')}
    </div>
    <div class="critique-list">${data.items.length ? rows : `<div class="card panel">${emptyBlock({ title: '没有匹配的批判', text: '批判记忆是平台的核心资产：记录你为什么相信，或为什么不信。', action: '<a class="btn btn-primary" href="#/library">去文献库</a>', iconName: 'chat' })}</div>`}</div>
  </div>`;
  app.querySelectorAll('[data-critique-status]').forEach((sel) => {
    sel.onchange = async () => {
      try {
        await api(`/critiques/${sel.dataset.critiqueStatus}`, { method: 'PATCH', body: { status: sel.value } });
        toast('状态已更新', 'ok');
        refreshShell();
      } catch (err) { toast(err.message, 'err'); }
    };
  });
}

function openCritiqueEditModal(critique) {
  const m = openModal({
    title: '编辑批判',
    subtitle: '保留原始判断的上下文，修正措辞或补充证据',
    wide: true,
    body: `<form id="critique-edit-form"><div class="form-row" style="margin-bottom:10px">
      <div class="field" style="max-width:140px"><label>立场</label><select class="select" name="stance">${Object.entries(STANCE).map(([k, v]) => `<option value="${k}" ${critique.stance === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
      <div class="field" style="max-width:140px"><label>维度</label><select class="select" name="dimension">${Object.entries(DIMENSION).map(([k, v]) => `<option value="${k}" ${critique.dimension === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
      <div class="field" style="max-width:120px"><label>严重度</label><input class="input" type="number" name="severity" min="1" max="5" value="${critique.severity}" /></div>
      <div class="field" style="max-width:120px"><label>状态</label><select class="select" name="status"><option value="open" ${critique.status === 'open' ? 'selected' : ''}>开放</option><option value="addressed" ${critique.status === 'addressed' ? 'selected' : ''}>已回应</option><option value="dismissed" ${critique.status === 'dismissed' ? 'selected' : ''}>已搁置</option></select></div>
    </div>
    <div class="field"><label>内容</label><textarea class="textarea" name="content" rows="5" required>${esc(critique.content)}</textarea></div>
    <div class="field" style="margin-top:10px"><label>证据 / 位置</label><textarea class="textarea" name="evidence" rows="2">${esc(critique.evidence || '')}</textarea></div></form>`,
    footer: `<button class="btn" type="button" data-close-modal>取消</button><button class="btn btn-primary" type="button" id="critique-edit-save">${icon('check')} 保存</button>`,
  });
  m.root.querySelector('#critique-edit-save').onclick = async () => {
    const form = m.root.querySelector('#critique-edit-form');
    const fd = new FormData(form);
    const body = Object.fromEntries(fd.entries());
    body.severity = Number(body.severity);
    try {
      await api(`/critiques/${critique.id}`, { method: 'PATCH', body });
      toast('批判已更新', 'ok');
      m.close();
      route();
    } catch (err) { toast(err.message, 'err'); }
  };
}

/* ============================== SETTINGS ============================== */
async function settingsPage(seq) {
  const s = await api('/settings');
  if (seq !== renderSeq) return;
  viewState = { settings: s };
  app.innerHTML = `<div class="page page-narrow">
    <div class="page-head"><div><div class="eyebrow">Configuration</div><h1>设置</h1><p>ASAP 文献源连接、作者数据源与本地数据管理。所有配置保存在本机数据库。</p></div><div class="head-actions"><span class="badge badge-outline">v${esc(s.version)}</span></div></div>
    <form id="settings-form">
      <div class="settings-grid">
        <div class="card settings-block">
          <div class="panel-head" style="margin-bottom:4px"><div><h2>ASAP 文献源</h2><div class="desc">为 ASAP 连接预留的适配入口。可保存地址与凭据并测试连通性；检索与 PDF 下载需要接口文档后再接入。</div></div></div>
          <div class="field" style="margin-bottom:12px"><label>服务地址</label><input class="input" name="asap_base_url" value="${esc(s.asap_base_url || '')}" placeholder="https://asap.example.org/api" /></div>
          <div class="field"><label>访问凭据 ${s.has_asap_key ? '<span class="badge badge-ok">已保存</span>' : '<span class="badge badge-muted">未配置</span>'}</label><input class="input" type="password" name="asap_api_key" autocomplete="new-password" placeholder="${s.has_asap_key ? '留空表示不修改' : 'Token / API Key'}" /></div>
          <div class="settings-actions"><button class="btn btn-primary" type="submit">${icon('check')} 保存设置</button><button class="btn" type="button" id="test-asap">${icon('sync')} 测试连接</button>${s.has_asap_key ? '<button class="btn btn-danger" type="button" id="clear-asap">清除凭据</button>' : ''}</div>
          <div class="notice" style="margin-top:12px">需要 ASAP 的接口文档才能实现检索、元数据映射和 PDF 下载。当前不会伪造或猜测接口。</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card settings-block">
            <h2>作者数据源</h2><p class="desc">OpenAlex 用于补全作者机构、主题与最近论文；可选填联系邮箱进入其 polite pool。</p>
            <div class="field"><label>学术联系人邮箱（可选）</label><input class="input" type="email" name="contact_email" value="${esc(s.contact_email || '')}" placeholder="用于 OpenAlex polite pool" /><small>留空也可以使用；不会写入导出文件中的密钥。</small></div>
          </div>
          <div class="card settings-block">
            <h2>数据与备份</h2><p class="desc">数据库与 PDF 位于 data 目录，随项目文件夹迁移即可。</p>
            <div class="kv"><span>数据目录</span><span class="mono">${esc(s.data_dir)}</span></div>
            <div class="kv"><span>单篇上传上限</span><span>${s.max_upload_mb} MB</span></div>
            <div class="kv"><span>数据库</span><span>library.db (SQLite)</span></div>
            <div class="kv"><span>PDF 存储</span><span>data/pdfs/</span></div>
            <div class="settings-actions"><a class="btn" href="/api/export?text=1">${icon('download')} 导出完整 JSON</a><button class="btn" type="button" id="backup-now">${icon('database')} 创建本地备份</button></div>
            <p class="small muted" style="margin-top:10px">导出含全文，文件可能较大。备份写入 data/backups/。</p>
          </div>
        </div>
        <div class="card settings-block span-full">
          <h2>使用边界</h2>
          <div class="author-profile-grid" style="margin-top:10px">
            <div><div class="setting-row"><div class="txt"><strong>本地优先</strong><span>PDF 与结构化情报保存在本机；只有你主动同步 OpenAlex、查询 Crossref 或抓取主页时才发生外部请求。</span></div></div>
            <div class="setting-row"><div class="txt"><strong>证据可核验</strong><span>规则抽取可能出错，字段旁保留原文证据；请以论文原文为准。</span></div></div></div>
            <div><div class="setting-row"><div class="txt"><strong>批判是判断，不是事实</strong><span>批判记录会进入文献与作者档案，但不会改写论文事实字段。定期回看“已回应”和“已搁置”的判断。</span></div></div>
            <div class="setting-row"><div class="txt"><strong>合法使用</strong><span>只上传你有权访问和处理的文献；遵守出版商与机构许可。</span></div></div></div>
          </div>
        </div>
      </div>
    </form>
  </div>`;

  const form = document.getElementById('settings-form');
  const collect = () => Object.fromEntries(new FormData(form).entries());
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const body = collect();
      if (body.asap_api_key === '') delete body.asap_api_key;
      await api('/settings', { method: 'PATCH', body });
      toast('设置已保存', 'ok');
      route();
    } catch (err) { toast(err.message, 'err'); }
  });
  document.getElementById('test-asap').onclick = async (e) => {
    const btn = e.currentTarget;
    const body = collect();
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px"></span> 测试中…';
    try {
      const result = await api('/settings/test-asap', { method: 'POST', body: { url: body.asap_base_url, api_key: body.asap_api_key } });
      toast(`ASAP 连接返回 HTTP ${result.status}（${result.ms} ms）`, result.ok ? 'ok' : 'err');
    } catch (err) { toast(err.message, 'err'); }
    btn.disabled = false;
    btn.innerHTML = `${icon('sync')} 测试连接`;
  };
  document.getElementById('backup-now').onclick = async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      const result = await api('/backup', { method: 'POST', body: { include_text: true } });
      toast(`备份完成：${result.file}（${fmtBytes(result.bytes)}）`, 'ok');
    } catch (err) { toast(err.message, 'err'); }
    btn.disabled = false;
  };
  document.getElementById('clear-asap')?.addEventListener('click', async () => {
    if (!(await confirmDialog({ title: '清除 ASAP 凭据', message: '仅清除本机保存的凭据。', confirmText: '清除' }))) return;
    await api('/settings', { method: 'PATCH', body: { clear_asap_key: true } });
    toast('ASAP 凭据已清除', 'ok');
    route();
  });
}

/* ============================== ACTIONS ============================== */
function openReextractDialog() {
  const article = viewState.article;
  if (!article) return;
  if (!article.full_text) return toast('没有可用的全文文本，请先上传可解析的 PDF', 'err');
  const m = openModal({
    title: '重新规则抽取',
    subtitle: '本地关键词与章节结构分析，不发送任何数据',
    body: `<div class="confirm-text">用关键词、章节标题与正则规则重新抽取科学问题、方法、理论变量、结论与证据。它不会替代人工判断，也不会使用外部模型。</div>
      <div class="notice" style="margin-top:12px">默认采用增量模式：只填补空白字段，保留已经写入的内容。若勾选覆盖，会替换现有情报字段（含人工修改）。</div>
      <label class="check" style="margin-top:14px"><input type="checkbox" id="analyze-overwrite" /> 覆盖式重写（危险：会替换已有字段）</label>`,
    footer: `<button class="btn" type="button" data-close-modal>取消</button><button class="btn btn-primary" type="button" id="analyze-run">${icon('refresh')} 重新抽取</button>`,
  });
  m.root.querySelector('#analyze-run').onclick = async () => {
    const overwrite = m.root.querySelector('#analyze-overwrite').checked;
    m.close();
    const progress = openModal({
      title: '正在重新抽取',
      narrow: true,
      body: `<div class="loading" style="min-height:140px;padding:10px"><span class="spinner"></span><p>正在解析章节与关键词…</p></div>`,
    });
    try {
      const result = await api(`/articles/${article.id}/analyze`, { method: 'POST', body: { overwrite } });
      progress.close();
      toast('规则抽取完成', 'ok');
      if (result.suggestions?.length) {
        toast(`技术栈建议：${result.suggestions.map((s) => s.name).join('、')}。可在“技术栈”中确认。`, '');
      }
      dirty = false;
      navigate(`#/articles/${article.id}?tab=intel`);
    } catch (err) {
      progress.close();
      toast(err.message, 'err');
    }
  };
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  ta.remove();
  return ok;
}

async function runAuthorSync() {
  const author = viewState.author;
  if (!author) return;
  const btn = document.querySelector('[data-action="author-sync"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px"></span> 同步中…'; }
  try {
    const res = await api(`/authors/${author.id}/sync`, { method: 'POST', body: {} });
    toast(`OpenAlex 已匹配：${res.matched.display_name || author.name}；新增 ${res.added_updates} 条动态`, 'ok');
    route();
  } catch (err) {
    toast(err.message, 'err');
    if (btn) { btn.disabled = false; btn.innerHTML = `${icon('sync')} 同步 OpenAlex`; }
  }
}

function openWebsiteFlow() {
  const author = viewState.author;
  if (!author) return;
  const m = openModal({
    title: '抓取作者主页',
    subtitle: '提取页面标题、简介与可见文本；不会访问内网地址',
    body: `<div class="field"><label>主页网址</label><input class="input" id="website-url" type="url" value="${esc(author.website || '')}" placeholder="https://…" /></div>
      <div class="notice" style="margin-top:12px">抓取结果会保存为作者档案的主页快照。页面可能需要 JavaScript 渲染，遇到这种情况只能得到静态 HTML 的标题/简介。</div>`,
    footer: `<button class="btn" type="button" data-close-modal>取消</button><button class="btn btn-primary" type="button" id="website-run">${icon('link')} 抓取</button>`,
  });
  m.root.querySelector('#website-run').onclick = async () => {
    const url = m.root.querySelector('#website-url').value.trim();
    if (!url) return toast('请填写网址', 'err');
    const btn = m.root.querySelector('#website-run');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px"></span> 抓取中…';
    try {
      if (url !== author.website) await api(`/authors/${author.id}`, { method: 'PATCH', body: { website: url } });
      await api(`/authors/${author.id}/website`, { method: 'POST', body: { url } });
      toast('主页快照已更新', 'ok');
      m.close();
      route();
    } catch (err) {
      toast(err.message, 'err');
      btn.disabled = false;
      btn.innerHTML = `${icon('link')} 抓取`;
    }
  };
}

document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  try {
    if (action === 'new-author') { e.preventDefault(); openAuthorModal(null); }
    else if (action === 'author-edit') { e.preventDefault(); openAuthorModal(viewState.author); }
    else if (action === 'author-sync') { e.preventDefault(); await runAuthorSync(); }
    else if (action === 'author-website') { e.preventDefault(); openWebsiteFlow(); }
    else if (action === 'author-update-add') { e.preventDefault(); openAuthorUpdateModal(viewState.author); }
    else if (action === 'author-update-delete') {
      e.preventDefault();
      if (!(await confirmDialog({ title: '删除动态', message: '从时间线移除这条记录？', confirmText: '删除' }))) return;
      await api(`/authors/updates/${el.dataset.id}`, { method: 'DELETE' });
      toast('动态已删除', 'ok');
      route();
    } else if (action === 'infer-corresponding') {
      e.preventDefault();
      const a = viewState.article;
      if (!a) return;
      const manual = (a.authors || []).some((x) => x.corresponding && ['manual', 'confirmed'].includes(x.corresponding_source));
      if (manual) {
        const ok = await confirmDialog({ title: '覆盖手动通讯作者', message: '已有手动确认的通讯作者。重新识别会覆盖现有通讯作者标记，确定继续吗？', confirmText: '重新识别', danger: false });
        if (!ok) return;
      }
      try {
        const res = await api(`/articles/${a.id}/infer-corresponding`, { method: 'POST', body: { overwrite: manual } });
        if (res.skipped) { toast(res.reason || '已保留手动通讯作者', ''); return; }
        const names = (res.authors || []).map((x) => x.name).join('、') || '未识别到';
        toast(`通讯作者：${names}`, 'ok');
        route();
      } catch (err) { toast(err.message, 'err'); }
    } else if (action === 'analyze') { e.preventDefault(); openReextractDialog(); }
    else if (action === 'edit-meta') { e.preventDefault(); openMetaModal(viewState.article, viewState.stacks); }
    else if (action === 'manage-stacks') { e.preventDefault(); openStackModal(viewState.article, viewState.stacks); }
    else if (action === 'copy-markdown') {
      e.preventDefault();
      const ok = await copyText(articleMarkdown(viewState.article));
      toast(ok ? 'Markdown 摘要已复制' : '复制失败，请手动选择内容', ok ? 'ok' : 'err');
    } else if (action === 'delete-article') {
      e.preventDefault();
      const a = viewState.article;
      if (!(await confirmDialog({ title: '删除文献', message: `将永久删除《${esc(a.title)}》及其 PDF、批判记录和作者关联。<br><br><strong>此操作不可撤销。</strong>`, confirmText: '永久删除' }))) return;
      await api(`/articles/${a.id}`, { method: 'DELETE' });
      toast('文献已删除', 'ok');
      dirty = false;
      await refreshShell();
      navigate('#/library');
    } else if (action === 'critique-edit') {
      e.preventDefault();
      const id = Number(el.dataset.id);
      const list = viewState.article?.critiques || viewState.critiques || [];
      const c = list.find((x) => x.id === id);
      if (c) openCritiqueEditModal(c); else toast('批判记录已变化，请刷新页面', 'err');
    } else if (action === 'critique-delete') {
      e.preventDefault();
      if (!(await confirmDialog({ title: '删除批判', message: '这条判断将从文献和作者档案中移除。<br><strong>此操作不可撤销。</strong>', confirmText: '删除' }))) return;
      await api(`/critiques/${el.dataset.id}`, { method: 'DELETE' });
      toast('批判已删除', 'ok');
      await refreshShell();
      route();
    } else if (action === 'stack-new') { e.preventDefault(); openStackEditModal(null); }
    else if (action === 'stack-add-child') {
      e.preventDefault();
      openStackEditModal(null, Number(el.dataset.id));
    } else if (action === 'stack-edit') {
      e.preventDefault();
      const stack = (viewState.stacks || stacksCache || []).find((s) => s.id === Number(el.dataset.id));
      if (stack) openStackEditModal(stack);
    } else if (action === 'stack-delete') {
      e.preventDefault();
      const stack = (viewState.stacks || stacksCache || []).find((s) => s.id === Number(el.dataset.id));
      if (!stack) return;
      const children = (viewState.stacks || stacksCache || []).filter((x) => x.parent_id === stack.id).length;
      if (!(await confirmDialog({ title: '删除技术栈', message: `删除「${esc(stack.name)}」？${children ? `它还有 <strong>${children}</strong> 个子类，会一并删除。` : ''}${stack.article_count ? `<br>相关 <strong>${stack.article_count}</strong> 篇文献会失去此分类（文献本身不会删除）。` : ''}`, confirmText: '删除技术栈' }))) return;
      await api(`/stacks/${stack.id}`, { method: 'DELETE' });
      stacksCache = null;
      toast('技术栈已删除', 'ok');
      route();
    }
  } catch (err) {
    toast(err.message, 'err');
  }
});

/* ============================== INIT ============================== */
document.getElementById('menu-toggle').addEventListener('click', () => {
  sidebar.classList.add('open');
  scrim.classList.add('open');
});
scrim.addEventListener('click', closeSidebar);
document.querySelectorAll('.main-nav a').forEach((a) => a.addEventListener('click', closeSidebar));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalRoot.innerHTML) {
    modalRoot.innerHTML = '';
    document.body.classList.remove('modal-open');
    closeSidebar();
  }
});
window.addEventListener('beforeunload', (e) => {
  if (dirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});
window.addEventListener('hashchange', route);

async function init() {
  await refreshShell();
  await route();
}
init();
