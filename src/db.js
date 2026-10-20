import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { TAXONOMY_VERSION, OLD_DEFAULT_STACK_NAMES, flattenTaxonomy } from './taxonomy.js';
import { inferCorresponding, suggestStacks } from './analyzer.js';

const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT '',
  authors_text TEXT NOT NULL DEFAULT '',
  journal TEXT NOT NULL DEFAULT '',
  year INTEGER,
  doi TEXT NOT NULL DEFAULT '',
  arxiv_id TEXT NOT NULL DEFAULT '',
  abstract TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'inbox',
  is_kinetics INTEGER NOT NULL DEFAULT 0,
  pdf_path TEXT,
  pdf_filename TEXT,
  pdf_sha256 TEXT,
  pdf_size INTEGER,
  page_count INTEGER,
  full_text TEXT NOT NULL DEFAULT '',
  text_status TEXT NOT NULL DEFAULT 'none',
  text_error TEXT NOT NULL DEFAULT '',
  intel_json TEXT NOT NULL DEFAULT '{}',
  analysis_source TEXT NOT NULL DEFAULT 'none',
  analysis_confidence TEXT NOT NULL DEFAULT 'low',
  analyzed_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_pdf_sha ON articles(pdf_sha256) WHERE pdf_sha256 IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_year ON articles(year);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_updated ON articles(updated_at DESC);

CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_norm TEXT NOT NULL UNIQUE,
  affiliation TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  orcid TEXT NOT NULL DEFAULT '',
  openalex_id TEXT NOT NULL DEFAULT '',
  research_direction TEXT NOT NULL DEFAULT '',
  research_json TEXT NOT NULL DEFAULT '{}',
  website_summary TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_synced_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);

CREATE TABLE IF NOT EXISTS article_authors (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  corresponding INTEGER NOT NULL DEFAULT 0,
  corresponding_source TEXT NOT NULL DEFAULT '',
  corresponding_confidence TEXT NOT NULL DEFAULT '',
  corresponding_reason TEXT NOT NULL DEFAULT '',
  affiliation TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (article_id, author_id)
);
CREATE INDEX IF NOT EXISTS idx_aa_author ON article_authors(author_id);

CREATE TABLE IF NOT EXISTS stacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  parent_id INTEGER REFERENCES stacks(id) ON DELETE CASCADE,
  color TEXT NOT NULL DEFAULT '#4b6b88',
  description TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS article_stacks (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  stack_id INTEGER NOT NULL REFERENCES stacks(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'manual',
  PRIMARY KEY (article_id, stack_id)
);

CREATE TABLE IF NOT EXISTS critiques (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  critic TEXT NOT NULL DEFAULT '我',
  stance TEXT NOT NULL DEFAULT 'question',
  dimension TEXT NOT NULL DEFAULT 'method',
  severity INTEGER NOT NULL DEFAULT 3,
  content TEXT NOT NULL,
  evidence TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_critiques_article ON critiques(article_id);
CREATE INDEX IF NOT EXISTS idx_critiques_created ON critiques(created_at DESC);

CREATE TABLE IF NOT EXISTS author_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'paper',
  title TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  occurred_on TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_author_updates_ext ON author_updates(author_id, source, external_id) WHERE external_id <> '';
CREATE INDEX IF NOT EXISTS idx_author_updates_author ON author_updates(author_id, occurred_on DESC);

CREATE TABLE IF NOT EXISTS revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  snapshot TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_revisions_article ON revisions(article_id, created_at DESC);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);
`;

export function nowIso() {
  return new Date().toISOString();
}

export function normalizeName(name = '') {
  return String(name)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[.,;:()\[\]{}'"’“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function splitList(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value || '')
    .split(/[,，;；\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function ensureColumn(db, table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

export function openDatabase(dbFile) {
  const fresh = dbFile === ':memory:' || !fs.existsSync(dbFile) || fs.statSync(dbFile).size === 0;
  const db = new DatabaseSync(dbFile);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);
  ensureColumn(db, 'stacks', 'parent_id', 'INTEGER REFERENCES stacks(id) ON DELETE CASCADE');
  ensureColumn(db, 'article_authors', 'corresponding_source', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, 'article_authors', 'corresponding_confidence', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, 'article_authors', 'corresponding_reason', "TEXT NOT NULL DEFAULT ''");
  db.exec('CREATE INDEX IF NOT EXISTS idx_stacks_parent ON stacks(parent_id);');
  migrateTaxonomy(db, fresh);
  backfillCorresponding(db);
  return db;
}

function getMarker(db, key) {
  return db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value || '';
}

function setMarker(db, key, value) {
  db.prepare(
    'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
  ).run(key, String(value), nowIso());
}

function seedTaxonomy(db) {
  const rows = flattenTaxonomy();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO stacks (name, parent_id, color, description, keywords, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const ids = [];
  const now = nowIso();
  for (const row of rows) {
    const parentId = row.parentIndex == null ? null : ids[row.parentIndex];
    insert.run(row.name, parentId, row.color, row.description, row.keywords, row.sort_order, now);
    const found = db.prepare('SELECT id FROM stacks WHERE name = ?').get(row.name);
    ids.push(found?.id ?? null);
  }
}

function migrateTaxonomy(db, fresh) {
  const version = getMarker(db, 'taxonomy_version');
  if (version === TAXONOMY_VERSION) return;
  const before = db.prepare('SELECT id FROM articles').all().map((r) => r.id);
  if (!fresh) {
    const placeholders = OLD_DEFAULT_STACK_NAMES.map(() => '?').join(',');
    db.prepare(`DELETE FROM stacks WHERE name IN (${placeholders})`).run(...OLD_DEFAULT_STACK_NAMES);
  }
  seedTaxonomy(db);
  setMarker(db, 'taxonomy_version', TAXONOMY_VERSION);
  // 旧自动分类已随旧技术栈删除；用新层级重新分类，保留手工分类。
  const articles = db.prepare("SELECT id FROM articles WHERE full_text <> '' ORDER BY id").all().map((r) => r.id);
  const ids = articles.length ? articles : before;
  if (ids.length) reclassifyAutoStacks(db, ids);
}

function reclassifyAutoStacks(db, articleIds) {
  try {
    const stacks = listStacks(db);
    const update = db.prepare("DELETE FROM article_stacks WHERE article_id = ? AND source = 'auto'");
    const insert = db.prepare("INSERT OR IGNORE INTO article_stacks (article_id, stack_id, source) VALUES (?, ?, 'auto')");
    for (const id of articleIds) {
      const article = db.prepare('SELECT full_text FROM articles WHERE id = ?').get(id);
      if (!article?.full_text) continue;
      const suggestions = suggestStacks(article.full_text, stacks).slice(0, 4);
      update.run(id);
      for (const s of suggestions) insert.run(id, s.id);
    }
  } catch (err) {
    console.error('[taxonomy] 自动分类失败：', err.message);
  }
}

function backfillCorresponding(db) {
  if (getMarker(db, 'corresponding_backfill_v2') === '1') return;
  try {
    const articles = db.prepare(
      `SELECT ar.id, ar.full_text FROM articles ar
       WHERE ar.full_text <> ''
         AND NOT EXISTS (SELECT 1 FROM article_authors aa WHERE aa.article_id = ar.id AND aa.corresponding = 1)`,
    ).all();
    let changed = 0;
    for (const article of articles) {
      const authors = articleAuthors(db, article.id);
      if (!authors.length) continue;
      const inferred = inferCorresponding(article.full_text, authors);
      for (const author of inferred) {
        if (!author.corresponding) continue;
        db.prepare(
          `UPDATE article_authors SET corresponding = 1, corresponding_source = ?, corresponding_confidence = ?, corresponding_reason = ?
           WHERE article_id = ? AND author_id = ?`,
        ).run(
          author.corresponding_source || 'inferred',
          author.corresponding_confidence || 'low',
          author.corresponding_reason || '',
          article.id,
          author.id,
        );
        if (author.email) {
          db.prepare("UPDATE authors SET email = ?, updated_at = ? WHERE id = ? AND email = ''").run(author.email, nowIso(), author.id);
        }
        changed += 1;
      }
    }
    setMarker(db, 'corresponding_backfill_v2', '1');
    if (changed) console.log(`[corresponding] 已为 ${changed} 位作者补全通讯作者推断`);
  } catch (err) {
    console.error('[corresponding] 通讯作者补全失败：', err.message);
  }
}

export function getArticleRow(db, id) {
  return db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
}

export function articleAuthors(db, id) {
  return db
    .prepare(
      `SELECT a.id, a.name, a.affiliation AS profile_affiliation, a.email, a.website, a.orcid,
              aa.position, aa.corresponding, aa.affiliation,
              aa.corresponding_source, aa.corresponding_confidence, aa.corresponding_reason
       FROM article_authors aa JOIN authors a ON a.id = aa.author_id
       WHERE aa.article_id = ? ORDER BY aa.position ASC, a.name ASC`,
    )
    .all(id);
}

export function listStacks(db) {
  const rows = db.prepare('SELECT * FROM stacks').all();
  const byId = new Map(rows.map((r) => [r.id, { ...r, children: [] }]));
  const roots = [];
  for (const row of byId.values()) {
    if (row.parent_id && byId.has(row.parent_id)) byId.get(row.parent_id).children.push(row);
    else roots.push(row);
  }
  const sort = (a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name);
  const out = [];
  const walk = (nodes, parent = null, level = 0) => {
    nodes.sort(sort).forEach((node) => {
      const path = parent ? `${parent.path} / ${node.name}` : node.name;
      out.push({
        ...node,
        children: undefined,
        parent_name: parent?.name || '',
        path,
        level,
        child_count: node.children.length,
      });
      walk(node.children, { ...node, path }, level + 1);
    });
  };
  walk(roots);
  return out;
}

export function descendantStackIds(db, id) {
  const stacks = listStacks(db);
  const children = new Map();
  for (const s of stacks) {
    if (!children.has(s.parent_id)) children.set(s.parent_id, []);
    children.get(s.parent_id).push(s.id);
  }
  const out = new Set([Number(id)]);
  const walk = (sid) => {
    for (const child of children.get(sid) || []) {
      if (out.has(child)) continue;
      out.add(child);
      walk(child);
    }
  };
  walk(Number(id));
  return [...out];
}

export function articleStacks(db, id) {
  const links = db.prepare('SELECT stack_id, source FROM article_stacks WHERE article_id = ?').all(id);
  const ids = new Set(links.map((r) => r.stack_id));
  const sourceById = new Map(links.map((r) => [r.stack_id, r.source]));
  return listStacks(db)
    .filter((s) => ids.has(s.id))
    .map((s) => ({
      id: s.id, name: s.name, color: s.color, description: s.description,
      parent_id: s.parent_id, path: s.path, level: s.level, source: sourceById.get(s.id) || 'manual',
    }));
}

export function articleCritiques(db, id) {
  return db.prepare('SELECT * FROM critiques WHERE article_id = ? ORDER BY created_at DESC').all(id);
}

export function hydrateArticle(db, row, { withText = false } = {}) {
  if (!row) return null;
  const item = {
    ...row,
    is_kinetics: !!row.is_kinetics,
    intel: parseJson(row.intel_json, {}),
    tags: splitList(row.tags),
    keywords: splitList(row.keywords),
    authors: articleAuthors(db, row.id),
    stacks: articleStacks(db, row.id),
    critique_count: db.prepare('SELECT COUNT(*) AS n FROM critiques WHERE article_id = ?').get(row.id).n,
  };
  if (!withText) {
    item.full_text = undefined;
    item.intel_json = undefined;
  }
  return item;
}

export function getArticle(db, id, opts = {}) {
  return hydrateArticle(db, getArticleRow(db, id), opts);
}

export function upsertAuthor(db, input = {}) {
  const name = String(input.name || '').trim();
  if (!name) return null;
  const norm = normalizeName(name);
  let existing = db.prepare('SELECT * FROM authors WHERE name_norm = ?').get(norm);
  const now = nowIso();
  if (!existing) {
    const info = db
      .prepare(
        `INSERT INTO authors (name, name_norm, affiliation, email, website, orcid, openalex_id,
          research_direction, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        name,
        norm,
        String(input.affiliation || ''),
        String(input.email || ''),
        String(input.website || ''),
        String(input.orcid || ''),
        String(input.openalex_id || ''),
        String(input.research_direction || ''),
        String(input.notes || ''),
        now,
        now,
      );
    existing = db.prepare('SELECT * FROM authors WHERE id = ?').get(info.lastInsertRowid);
    return existing;
  }
  const updates = {};
  for (const key of ['affiliation', 'email', 'website', 'orcid', 'openalex_id', 'research_direction']) {
    if (input[key] && String(input[key]).trim() && !existing[key]) updates[key] = String(input[key]).trim();
  }
  if (Object.keys(updates).length) {
    updates.updated_at = now;
    const cols = Object.keys(updates);
    db.prepare(`UPDATE authors SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`).run(
      ...cols.map((c) => updates[c]),
      existing.id,
    );
    existing = db.prepare('SELECT * FROM authors WHERE id = ?').get(existing.id);
  }
  return existing;
}

export function setArticleAuthors(db, articleId, authors = []) {
  const clean = (Array.isArray(authors) ? authors : [])
    .map((a, i) => ({ ...a, name: String(a?.name || '').trim(), position: i }))
    .filter((a) => a.name);
  const seen = new Set();
  const rows = clean.filter((a) => {
    const key = normalizeName(a.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  db.exec('BEGIN');
  try {
    db.prepare('DELETE FROM article_authors WHERE article_id = ?').run(articleId);
    const attach = db.prepare(
      `INSERT INTO article_authors
        (article_id, author_id, position, corresponding, corresponding_source, corresponding_confidence, corresponding_reason, affiliation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const a of rows) {
      const author = upsertAuthor(db, a);
      if (author) {
        const isCorresponding = !!a.corresponding;
        attach.run(
          articleId,
          author.id,
          a.position,
          isCorresponding ? 1 : 0,
          isCorresponding ? String(a.corresponding_source || 'manual') : '',
          isCorresponding ? String(a.corresponding_confidence || 'confirmed') : '',
          isCorresponding ? String(a.corresponding_reason || '') : '',
          String(a.affiliation || ''),
        );
      }
    }
    const names = rows.map((a) => a.name).join(', ');
    db.prepare('UPDATE articles SET authors_text = ?, updated_at = ? WHERE id = ?').run(names, nowIso(), articleId);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function setArticleStacks(db, articleId, stackIds = [], source = 'manual') {
  db.exec('BEGIN');
  try {
    db.prepare('DELETE FROM article_stacks WHERE article_id = ?').run(articleId);
    const insert = db.prepare('INSERT OR IGNORE INTO article_stacks (article_id, stack_id, source) VALUES (?, ?, ?)');
    for (const id of stackIds) {
      if (Number.isFinite(Number(id))) insert.run(articleId, Number(id), source);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function recordRevision(db, articleId, source, snapshot, note = '') {
  db.prepare('INSERT INTO revisions (article_id, source, snapshot, note, created_at) VALUES (?, ?, ?, ?, ?)').run(
    articleId,
    source,
    JSON.stringify(snapshot),
    note,
    nowIso(),
  );
}

export function getSetting(db, key, fallback = '') {
  return db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value ?? fallback;
}

export function setSetting(db, key, value) {
  db.prepare(
    'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
  ).run(key, String(value ?? ''), nowIso());
}

export function hydrateAuthor(db, row) {
  if (!row) return null;
  const articles = db
    .prepare(
      `SELECT ar.id, ar.title, ar.year, ar.journal, ar.status, ar.analysis_confidence, ar.is_kinetics,
              aa.corresponding, aa.position
       FROM article_authors aa JOIN articles ar ON ar.id = aa.article_id
       WHERE aa.author_id = ? ORDER BY COALESCE(ar.year, 0) DESC, ar.updated_at DESC`,
    )
    .all(row.id);
  const critiqueStats = db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN c.status = 'open' THEN 1 ELSE 0 END) AS open,
              SUM(CASE WHEN c.stance = 'challenge' THEN 1 ELSE 0 END) AS challenges
       FROM critiques c JOIN article_authors aa ON aa.article_id = c.article_id
       WHERE aa.author_id = ?`,
    )
    .get(row.id);
  const updates = db
    .prepare(`SELECT * FROM author_updates WHERE author_id = ? ORDER BY COALESCE(occurred_on, '') DESC, id DESC`)
    .all(row.id);
  return {
    ...row,
    research: parseJson(row.research_json, {}),
    articles,
    corresponding_count: articles.filter((a) => a.corresponding).length,
    critique_stats: {
      total: critiqueStats.total || 0,
      open: critiqueStats.open || 0,
      challenges: critiqueStats.challenges || 0,
    },
    updates,
  };
}
