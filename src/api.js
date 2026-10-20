import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import {
  getArticle, getArticleRow, hydrateArticle, hydrateAuthor, nowIso, openDatabase, recordRevision,
  setArticleAuthors, setArticleStacks, splitList, upsertAuthor, getSetting, setSetting, parseJson,
  articleAuthors, listStacks, descendantStackIds,
} from './db.js';
import { analyzeArticle, detectKinetics, mergeIntel, suggestStacks, inferCorresponding, stripJats } from './analyzer.js';
import { extractPdf, isPdfBuffer, sha256, safePdfName, removeFileQuiet } from './pdf.js';
import { lookupCrossref, normalizeDoi, syncOpenAlex, fetchWebsiteSummary } from './enrich.js';
import { renderFormulaSvg, errorSvg } from './math.js';

const STATUSES = new Set(['inbox', 'reading', 'analyzed', 'archived']);
const STANCES = new Set(['challenge', 'question', 'support', 'note']);
const DIMENSIONS = new Set(['method', 'data', 'conclusion', 'reproducibility', 'theory', 'writing', 'other']);
const CRITIQUE_STATUS = new Set(['open', 'addressed', 'dismissed']);

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function asInt(value, fallback = null) {
  if (value === '' || value == null) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(value) {
  if (typeof value === 'boolean') return value;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function overallConfidence(intel = {}) {
  const values = Object.values(intel.confidence || {});
  if (!values.length) return 'low';
  const high = values.filter((v) => v === 'high').length;
  const medium = values.filter((v) => v === 'medium').length;
  if (high >= 3) return 'high';
  if (high + medium >= 3) return 'medium';
  return 'low';
}

function pdfAbsolute(cfg, row) {
  if (!row?.pdf_path) return null;
  const abs = path.resolve(cfg.dataDir, row.pdf_path);
  if (!abs.startsWith(path.resolve(cfg.pdfDir) + path.sep)) return null;
  return fs.existsSync(abs) ? abs : null;
}

function stackIdsFromBody(body) {
  if (Array.isArray(body.stack_ids)) return body.stack_ids.map(Number).filter(Number.isFinite);
  if (typeof body.stack_ids === 'string' && body.stack_ids.trim()) {
    try {
      const parsed = JSON.parse(body.stack_ids);
      if (Array.isArray(parsed)) return parsed.map(Number).filter(Number.isFinite);
    } catch {
      return splitList(body.stack_ids).map(Number).filter(Number.isFinite);
    }
  }
  return null;
}

function applyWebsite(author) {
  if (!author) return author;
  let summary = author.website_summary;
  if (typeof summary === 'string' && summary) {
    try {
      summary = JSON.parse(summary);
    } catch {
      summary = { text: summary };
    }
  }
  return { ...author, website_summary: summary || null };
}

function listAuthors(db, { q = '', sort = 'articles' } = {}) {
  const where = q ? 'WHERE a.name LIKE ? OR a.affiliation LIKE ? OR a.research_direction LIKE ?' : '';
  const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];
  const order = sort === 'recent' ? 'a.updated_at DESC' : sort === 'name' ? 'a.name COLLATE NOCASE' : 'article_count DESC, a.name';
  return db
    .prepare(
      `SELECT a.*,
        (SELECT COUNT(*) FROM article_authors aa WHERE aa.author_id = a.id) AS article_count,
        (SELECT COUNT(*) FROM article_authors aa WHERE aa.author_id = a.id AND aa.corresponding = 1) AS corresponding_count,
        (SELECT MAX(COALESCE(ar.year, 0)) FROM article_authors aa JOIN articles ar ON ar.id = aa.article_id WHERE aa.author_id = a.id) AS latest_year,
        (SELECT MAX(au.occurred_on) FROM author_updates au WHERE au.author_id = a.id) AS latest_update
       FROM authors a ${where}
       ORDER BY ${order}`,
    )
    .all(...params)
    .map((a) => ({ ...a, research: parseJson(a.research_json, {}) }));
}

function collectExport(db, { includeText = false } = {}) {
  const articles = db.prepare('SELECT * FROM articles ORDER BY id').all().map((row) => {
    const full = hydrateArticle(db, row, { withText: includeText });
    full.critiques = db.prepare('SELECT * FROM critiques WHERE article_id = ? ORDER BY id').all(row.id);
    full.revisions = db
      .prepare('SELECT id, source, note, created_at FROM revisions WHERE article_id = ? ORDER BY id')
      .all(row.id);
    if (!includeText) delete full.full_text;
    return full;
  });
  const authors = db.prepare('SELECT * FROM authors ORDER BY id').all().map((a) => ({
    ...a,
    research: parseJson(a.research_json, {}),
    updates: db.prepare('SELECT * FROM author_updates WHERE author_id = ? ORDER BY id').all(a.id),
  }));
  const stacks = db.prepare('SELECT * FROM stacks ORDER BY sort_order, name').all();
  const settings = db
    .prepare("SELECT key, value FROM settings WHERE key NOT IN ('asap_api_key')")
    .all();
  return {
    format: 'chemintelanalysis/v1',
    exported_at: nowIso(),
    articles,
    authors,
    stacks,
    critiques: db.prepare('SELECT * FROM critiques ORDER BY id').all(),
    settings,
  };
}

export function createApi(cfg, db) {
  const router = express.Router();
  const upload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, cfg.tmpDir),
      filename: (_req, _file, cb) => cb(null, `${Date.now()}-${crypto.randomUUID()}.pdf`),
    }),
    limits: { fileSize: cfg.maxUploadBytes, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname)) cb(null, true);
      else cb(httpError(400, '只允许上传 PDF 文件'));
    },
  });

  router.get('/health', (_req, res) => {
    res.json({ ok: true, version: '1.0.0', time: nowIso() });
  });

  router.get('/stats', (_req, res) => {
    const one = (sql, ...p) => db.prepare(sql).get(...p);
    const articles = one(`SELECT COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN pdf_path IS NOT NULL THEN 1 ELSE 0 END), 0) AS with_pdf,
      COALESCE(SUM(pdf_size), 0) AS pdf_bytes,
      COALESCE(SUM(CASE WHEN analyzed_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS analyzed,
      COALESCE(SUM(CASE WHEN is_kinetics = 1 THEN 1 ELSE 0 END), 0) AS kinetics,
      COALESCE(SUM(CASE WHEN status = 'inbox' THEN 1 ELSE 0 END), 0) AS inbox,
      COALESCE(SUM(CASE WHEN status = 'reading' THEN 1 ELSE 0 END), 0) AS reading,
      COALESCE(SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END), 0) AS archived,
      COALESCE(SUM(CASE WHEN analysis_confidence = 'low' AND full_text <> '' THEN 1 ELSE 0 END), 0) AS low_confidence
      FROM articles`);
    const authors = one('SELECT COUNT(*) AS total FROM authors');
    const stacks = one('SELECT COUNT(*) AS total FROM stacks');
    const critiques = one(`SELECT COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END), 0) AS open,
      COALESCE(SUM(CASE WHEN stance = 'challenge' THEN 1 ELSE 0 END), 0) AS challenges
      FROM critiques`);
    const recent = db.prepare('SELECT * FROM articles ORDER BY created_at DESC LIMIT 6').all().map((r) => hydrateArticle(db, r));
    const topAuthors = db
      .prepare(`SELECT a.id, a.name, a.affiliation, COUNT(aa.article_id) AS article_count,
        SUM(aa.corresponding) AS corresponding_count
        FROM authors a JOIN article_authors aa ON aa.author_id = a.id
        GROUP BY a.id ORDER BY article_count DESC, corresponding_count DESC LIMIT 8`)
      .all();
    const allStacks = listStacks(db);
    const stackArticles = new Map();
    for (const link of db.prepare('SELECT stack_id, article_id FROM article_stacks').all()) {
      if (!stackArticles.has(link.stack_id)) stackArticles.set(link.stack_id, new Set());
      stackArticles.get(link.stack_id).add(link.article_id);
    }
    const topStacks = allStacks
      .filter((s) => !s.parent_id)
      .map((root) => {
        const ids = descendantStackIds(db, root.id);
        const articleIds = new Set();
        for (const sid of ids) for (const aid of stackArticles.get(sid) || []) articleIds.add(aid);
        return {
          id: root.id, name: root.name, color: root.color,
          child_count: root.child_count, article_count: articleIds.size,
        };
      })
      .sort((a, b) => b.article_count - a.article_count || a.name.localeCompare(b.name))
      .slice(0, 10);
    const years = db
      .prepare(`SELECT year, COUNT(*) AS n FROM articles WHERE year IS NOT NULL GROUP BY year ORDER BY year DESC LIMIT 12`)
      .all();
    const recentCritiques = db
      .prepare(`SELECT c.*, ar.title AS article_title FROM critiques c JOIN articles ar ON ar.id = c.article_id
        ORDER BY c.created_at DESC LIMIT 5`)
      .all();
    const attention = db
      .prepare(`SELECT ar.*,
        (SELECT COUNT(*) FROM article_authors aa WHERE aa.article_id = ar.id AND aa.corresponding = 1) AS corr_count,
        (SELECT COUNT(*) FROM critiques c WHERE c.article_id = ar.id AND c.status = 'open') AS open_critiques
        FROM articles ar
        WHERE ar.analysis_confidence = 'low'
           OR NOT EXISTS (SELECT 1 FROM article_authors aa WHERE aa.article_id = ar.id AND aa.corresponding = 1)
           OR EXISTS (SELECT 1 FROM critiques c WHERE c.article_id = ar.id AND c.status = 'open')
        ORDER BY ar.updated_at DESC LIMIT 6`)
      .all()
      .map((r) => ({ ...hydrateArticle(db, r), corr_count: r.corr_count, open_critiques: r.open_critiques }));
    res.json({ articles, authors, stacks, critiques, recent, topAuthors, topStacks, years, recentCritiques, attention });
  });

  router.get('/articles', (req, res) => {
    const q = String(req.query.q || '').trim().slice(0, 200);
    const page = Math.max(1, asInt(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, asInt(req.query.limit, 20)));
    const filters = [];
    const params = [];
    if (q) {
      const like = `%${q}%`;
      filters.push(`(ar.title LIKE ? OR ar.authors_text LIKE ? OR ar.abstract LIKE ? OR ar.journal LIKE ?
        OR ar.doi LIKE ? OR ar.tags LIKE ? OR ar.intel_json LIKE ? OR ar.notes LIKE ? OR ar.full_text LIKE ?)`);
      params.push(like, like, like, like, like, like, like, like, like);
    }
    if (req.query.status && STATUSES.has(req.query.status)) {
      filters.push('ar.status = ?');
      params.push(req.query.status);
    }
    if (req.query.kinetics === '1' || req.query.kinetics === '0') {
      filters.push('ar.is_kinetics = ?');
      params.push(Number(req.query.kinetics));
    }
    if (req.query.year) {
      filters.push('ar.year = ?');
      params.push(asInt(req.query.year));
    }
    if (req.query.stack) {
      const ids = descendantStackIds(db, asInt(req.query.stack));
      filters.push(`EXISTS (SELECT 1 FROM article_stacks x WHERE x.article_id = ar.id AND x.stack_id IN (${ids.map(() => '?').join(',')}))`);
      params.push(...ids);
    }
    if (req.query.author) {
      filters.push('EXISTS (SELECT 1 FROM article_authors x WHERE x.article_id = ar.id AND x.author_id = ?)');
      params.push(asInt(req.query.author));
    }
    if (req.query.corresponding === '1') {
      filters.push('EXISTS (SELECT 1 FROM article_authors x WHERE x.article_id = ar.id AND x.corresponding = 1)');
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const sorts = {
      updated: 'ar.updated_at DESC',
      created: 'ar.created_at DESC',
      year: 'COALESCE(ar.year, 0) DESC, ar.title COLLATE NOCASE',
      title: 'ar.title COLLATE NOCASE ASC',
      confidence: "CASE ar.analysis_confidence WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, ar.updated_at DESC",
    };
    const order = sorts[req.query.sort] || sorts.updated;
    const total = db.prepare(`SELECT COUNT(*) AS n FROM articles ar ${where}`).get(...params).n;
    const rows = db
      .prepare(`SELECT ar.* FROM articles ar ${where} ORDER BY ${order} LIMIT ? OFFSET ?`)
      .all(...params, limit, (page - 1) * limit);
    res.json({ items: rows.map((r) => hydrateArticle(db, r)), total, page, limit, pages: Math.ceil(total / limit) });
  });

  router.get('/articles/:id', (req, res) => {
    const row = getArticleRow(db, asInt(req.params.id));
    if (!row) throw httpError(404, '文献不存在');
    const article = hydrateArticle(db, row, { withText: true });
    article.critiques = db.prepare('SELECT * FROM critiques WHERE article_id = ? ORDER BY created_at DESC').all(row.id);
    article.revisions = db
      .prepare('SELECT id, source, note, created_at FROM revisions WHERE article_id = ? ORDER BY id DESC LIMIT 12')
      .all(row.id);
    article.pdf_exists = !!pdfAbsolute(cfg, row);
    res.json(article);
  });

  router.post(
    '/articles/upload',
    (req, res, next) => upload.single('file')(req, res, (err) => (err ? next(err) : next())),
    asyncRoute(async (req, res) => {
      if (!req.file) throw httpError(400, '请选择 PDF 文件');
      const tmpPath = req.file.path;
      let storedPath = null;
      let createdId = null;
      try {
        const buffer = fs.readFileSync(tmpPath);
        if (!isPdfBuffer(buffer)) throw httpError(422, '文件不是有效的 PDF');
        const hash = sha256(buffer);
        const dup = db.prepare('SELECT id FROM articles WHERE pdf_sha256 = ?').get(hash);
        if (dup) throw httpError(409, `该 PDF 已存在（文献 #${dup.id}）`);
        let extracted;
        let extractError = '';
        try {
          extracted = await extractPdf(buffer);
        } catch (err) {
          extractError = err.message || String(err);
          extracted = { text: '', pageCount: null, metadata: {}, title: '', doi: '', emails: [], firstPage: '' };
        }
        const bodyDoi = normalizeDoi(req.body.doi || '');
        const doi = bodyDoi || extracted.doi || '';
        let meta = null;
        if (doi && !cfg.offline) {
          try {
            meta = await lookupCrossref(doi);
          } catch {
            meta = null;
          }
        }
        const bodyTitle = String(req.body.title || '').trim();
        const fallbackTitle = req.file.originalname.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ');
        const title = bodyTitle || meta?.title || extracted.title || fallbackTitle || '未命名文献';
        const journal = String(req.body.journal || '').trim() || meta?.journal || '';
        const year = asInt(req.body.year, null) ?? meta?.year ?? null;
        const abstract = String(req.body.abstract || '').trim() || meta?.abstract || '';
        let authors = Array.isArray(meta?.authors) && meta.authors.length
          ? meta.authors
          : splitList(extracted.metadata?.author || '').map((name) => ({ name, corresponding: false }));
        authors = inferCorresponding(extracted.text || extracted.firstPage || '', authors);
        const kinetics = req.body.is_kinetics === 'auto' || req.body.is_kinetics == null
          ? detectKinetics(extracted.text, { title, journal })
          : { isKinetics: asBool(req.body.is_kinetics) };
        const storedName = `${crypto.randomUUID()}.pdf`;
        const relativePath = path.join('pdfs', storedName);
        storedPath = path.join(cfg.pdfDir, storedName);
        fs.renameSync(tmpPath, storedPath);
        const timestamp = nowIso();
        let intel = {};
        let analysisSource = 'none';
        let confidence = 'low';
        if (extracted.text) {
          intel = analyzeArticle({ text: extracted.text, title, abstract, journal, year });
          intel.kinetics = kinetics;
          analysisSource = 'heuristic';
          confidence = overallConfidence(intel);
        } else {
          intel = { kinetics, generated_by: 'none', generated_at: timestamp };
        }
        const info = db
          .prepare(
            `INSERT INTO articles (title, authors_text, journal, year, doi, arxiv_id, abstract, keywords, tags,
              status, is_kinetics, pdf_path, pdf_filename, pdf_sha256, pdf_size, page_count, full_text,
              text_status, text_error, intel_json, analysis_source, analysis_confidence, analyzed_at, notes,
              created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'inbox', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?)`,
          )
          .run(
            title,
            authors.map((a) => a.name).join(', '),
            journal,
            year,
            doi,
            String(req.body.arxiv_id || '').trim(),
            abstract,
            (intel.keywords || []).join(', '),
            String(req.body.tags || '').trim(),
            kinetics.isKinetics ? 1 : 0,
            relativePath,
            safePdfName(req.file.originalname),
            hash,
            buffer.length,
            extracted.pageCount,
            extracted.text,
            extracted.text ? 'ok' : 'error',
            extractError,
            JSON.stringify(intel),
            analysisSource,
            confidence,
            extracted.text ? timestamp : null,
            timestamp,
            timestamp,
          );
        const id = Number(info.lastInsertRowid);
        createdId = id;
        setArticleAuthors(db, id, authors);
        let stackIds = stackIdsFromBody(req.body);
        let stackSource = 'manual';
        if (!stackIds && asBool(req.body.auto_stack ?? '1')) {
          const stacks = listStacks(db);
          const suggestions = suggestStacks(`${title}\n${abstract}\n${extracted.text}`, stacks);
          stackIds = suggestions.slice(0, 4).map((s) => s.id);
          stackSource = 'auto';
        }
        setArticleStacks(db, id, stackIds || [], stackSource);
        recordRevision(db, id, 'initial', intel, '上传后自动抽取');
        const article = getArticle(db, id, { withText: false });
        article.critiques = [];
        article.revisions = db
          .prepare('SELECT id, source, note, created_at FROM revisions WHERE article_id = ? ORDER BY id DESC')
          .all(id);
        article.pdf_exists = true;
        res.status(201).json({ article, crossref: !!meta, extracted: extracted.text ? true : false, warnings: extractError ? [`PDF 文本抽取失败：${extractError}`] : [] });
      } catch (err) {
        removeFileQuiet(tmpPath);
        if (createdId) {
          try { db.prepare('DELETE FROM articles WHERE id = ?').run(createdId); } catch { /* noop */ }
        }
        if (storedPath) removeFileQuiet(storedPath);
        throw err;
      }
    }),
  );

  router.patch('/articles/:id', (req, res) => {
    const id = asInt(req.params.id);
    const row = getArticleRow(db, id);
    if (!row) throw httpError(404, '文献不存在');
    const b = req.body || {};
    const fields = {};
    const stringFields = ['title', 'journal', 'doi', 'arxiv_id', 'abstract', 'tags', 'notes'];
    for (const key of stringFields) {
      if (b[key] !== undefined) fields[key] = String(b[key] ?? '').trim();
    }
    if (b.year !== undefined) fields.year = b.year === '' || b.year == null ? null : asInt(b.year);
    if (b.is_kinetics !== undefined) fields.is_kinetics = asBool(b.is_kinetics) ? 1 : 0;
    if (b.status !== undefined) {
      if (!STATUSES.has(b.status)) throw httpError(400, '无效状态');
      fields.status = b.status;
    }
    let intelChanged = false;
    if (b.intel && typeof b.intel === 'object') {
      const intel = { ...b.intel };
      delete intel.generated_by;
      intel.generated_by = 'manual';
      intel.generated_at = nowIso();
      fields.intel_json = JSON.stringify(intel);
      fields.analysis_source = 'manual';
      fields.analysis_confidence = overallConfidence(intel);
      fields.analyzed_at = nowIso();
      if (Array.isArray(intel.keywords)) fields.keywords = intel.keywords.join(', ');
      intelChanged = true;
    }
    fields.updated_at = nowIso();
    const cols = Object.keys(fields);
    db.prepare(`UPDATE articles SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`).run(
      ...cols.map((c) => fields[c]),
      id,
    );
    if (Array.isArray(b.authors)) setArticleAuthors(db, id, b.authors);
    const stackIds = stackIdsFromBody(b);
    if (stackIds) setArticleStacks(db, id, stackIds, 'manual');
    if (intelChanged) recordRevision(db, id, 'manual', b.intel, b.revision_note || '人工编辑情报');
    res.json(getArticle(db, id, { withText: false }));
  });

  router.delete('/articles/:id', (req, res) => {
    const id = asInt(req.params.id);
    const row = getArticleRow(db, id);
    if (!row) throw httpError(404, '文献不存在');
    const abs = pdfAbsolute(cfg, row);
    db.prepare('DELETE FROM articles WHERE id = ?').run(id);
    if (abs) removeFileQuiet(abs);
    res.json({ ok: true, deleted: id });
  });

  router.get('/articles/:id/pdf', (req, res) => {
    const row = getArticleRow(db, asInt(req.params.id));
    const abs = pdfAbsolute(cfg, row);
    if (!abs) throw httpError(404, 'PDF 文件不存在');
    const download = req.query.download === '1';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(row.pdf_filename || 'paper.pdf')}`,
    );
    fs.createReadStream(abs).pipe(res);
  });

  router.post(
    '/articles/:id/pdf',
    (req, res, next) => upload.single('file')(req, res, (err) => (err ? next(err) : next())),
    asyncRoute(async (req, res) => {
      const id = asInt(req.params.id);
      const row = getArticleRow(db, id);
      if (!row) throw httpError(404, '文献不存在');
      if (!req.file) throw httpError(400, '请选择 PDF 文件');
      const tmpPath = req.file.path;
      let storedPath = null;
      let createdId = null;
      try {
        const buffer = fs.readFileSync(tmpPath);
        if (!isPdfBuffer(buffer)) throw httpError(422, '文件不是有效的 PDF');
        const hash = sha256(buffer);
        const dup = db.prepare('SELECT id FROM articles WHERE pdf_sha256 = ? AND id <> ?').get(hash, id);
        if (dup) throw httpError(409, `该 PDF 已属于文献 #${dup.id}`);
        const extracted = await extractPdf(buffer);
        const storedName = `${crypto.randomUUID()}.pdf`;
        const rel = path.join('pdfs', storedName);
        fs.renameSync(tmpPath, path.join(cfg.pdfDir, storedName));
        const old = pdfAbsolute(cfg, row);
        db.prepare(
          `UPDATE articles SET pdf_path = ?, pdf_filename = ?, pdf_sha256 = ?, pdf_size = ?, page_count = ?,
            full_text = ?, text_status = 'ok', text_error = '', updated_at = ? WHERE id = ?`,
        ).run(rel, safePdfName(req.file.originalname), hash, buffer.length, extracted.pageCount, extracted.text, nowIso(), id);
        if (old) removeFileQuiet(old);
        const intel = analyzeArticle({
          text: extracted.text,
          title: row.title,
          abstract: row.abstract,
          journal: row.journal,
          year: row.year,
          existing: parseJson(row.intel_json, {}),
        });
        db.prepare('UPDATE articles SET intel_json = ?, analysis_source = ?, analysis_confidence = ?, analyzed_at = ?, updated_at = ? WHERE id = ?').run(
          JSON.stringify(intel), 'heuristic', overallConfidence(intel), nowIso(), nowIso(), id,
        );
        recordRevision(db, id, 'pdf-replace', intel, '替换 PDF 并重新抽取');
        res.json({ article: getArticle(db, id, { withText: false }), warnings: [] });
      } catch (err) {
        removeFileQuiet(tmpPath);
        throw err;
      }
    }),
  );

  router.post('/articles/:id/analyze', asyncRoute(async (req, res) => {
    const id = asInt(req.params.id);
    const row = getArticleRow(db, id);
    if (!row) throw httpError(404, '文献不存在');
    if (!row.full_text) throw httpError(422, '该文献尚无可用全文文本，请先上传可解析的 PDF');
    const overwrite = asBool(req.body?.overwrite);
    const existing = parseJson(row.intel_json, {});
    const proposed = analyzeArticle({
      text: row.full_text,
      title: row.title,
      abstract: row.abstract,
      journal: row.journal,
      year: row.year,
    });
    let intel;
    if (overwrite) {
      intel = mergeIntel(existing, proposed, 'heuristic');
    } else {
      intel = { ...proposed };
      const preserve = [
        'scientific_question', 'methods', 'conclusions', 'limitations', 'hamiltonian', 'functional',
        'potential', 'dynamics_methods', 'observables', 'theory_framework', 'approximations', 'software',
        'critical_assessment',
      ];
      for (const key of preserve) {
        if (existing[key] && String(existing[key]).trim()) intel[key] = existing[key];
      }
      intel.evidence = { ...(existing.evidence || {}), ...(proposed.evidence || {}) };
      intel.confidence = { ...(existing.confidence || {}), ...(proposed.confidence || {}) };
      intel.keywords = proposed.keywords?.length ? proposed.keywords : existing.keywords || [];
      intel.generated_by = 'heuristic';
      intel.generated_at = nowIso();
      intel.version = (existing.version || 0) + 1;
    }
    const stacks = listStacks(db);
    const suggestions = suggestStacks(`${row.title}\n${row.abstract}\n${row.full_text}`, stacks);
    db.prepare(
      'UPDATE articles SET intel_json = ?, analysis_source = ?, analysis_confidence = ?, keywords = ?, is_kinetics = ?, analyzed_at = ?, updated_at = ?, status = CASE WHEN status = \'inbox\' THEN \'analyzed\' ELSE status END WHERE id = ?',
    ).run(
      JSON.stringify(intel),
      'heuristic',
      overallConfidence(intel),
      (intel.keywords || []).join(', '),
      intel.kinetics?.isKinetics ? 1 : row.is_kinetics,
      nowIso(),
      nowIso(),
      id,
    );
    recordRevision(db, id, 'heuristic', intel, overwrite ? '覆盖式重新分析' : '增量重新分析');
    const article = getArticle(db, id, { withText: false });
    article.critiques = db.prepare('SELECT * FROM critiques WHERE article_id = ? ORDER BY created_at DESC').all(id);
    res.json({ article, suggestions });
  }));

  router.get('/articles/:id/stack-suggestions', (req, res) => {
    const row = getArticleRow(db, asInt(req.params.id));
    if (!row) throw httpError(404, '文献不存在');
    const stacks = listStacks(db);
    res.json({ suggestions: suggestStacks(`${row.title}\n${row.abstract}\n${row.full_text}`, stacks) });
  });

  router.post('/articles/:id/reclassify-stacks', (req, res) => {
    const id = asInt(req.params.id);
    const row = getArticleRow(db, id);
    if (!row) throw httpError(404, '文献不存在');
    const stacks = listStacks(db);
    const suggestions = suggestStacks(`${row.title}\n${row.abstract}\n${row.full_text}`, stacks).slice(0, 5);
    db.prepare("DELETE FROM article_stacks WHERE article_id = ? AND source = 'auto'").run(id);
    const insert = db.prepare("INSERT OR IGNORE INTO article_stacks (article_id, stack_id, source) VALUES (?, ?, 'auto')");
    for (const s of suggestions) insert.run(id, s.id);
    res.json({ article: getArticle(db, id, { withText: false }), suggestions });
  });

  router.post('/articles/:id/doi', asyncRoute(async (req, res) => {
    const id = asInt(req.params.id);
    const row = getArticleRow(db, id);
    if (!row) throw httpError(404, '文献不存在');
    const doi = normalizeDoi(req.body?.doi || row.doi);
    if (!doi) throw httpError(400, '请填写 DOI');
    const meta = await lookupCrossref(doi);
    const overwrite = asBool(req.body?.overwrite);
    const fields = { doi: meta.doi, updated_at: nowIso() };
    if (meta.title && (!row.title || overwrite || row.title === '未命名文献')) fields.title = meta.title;
    if (meta.journal && (!row.journal || overwrite)) fields.journal = meta.journal;
    if (meta.year && (!row.year || overwrite)) fields.year = meta.year;
    if (meta.abstract && (!row.abstract || overwrite)) fields.abstract = meta.abstract;
    db.prepare(`UPDATE articles SET ${Object.keys(fields).map((k) => `${k} = ?`).join(', ')} WHERE id = ?`).run(
      ...Object.values(fields), id,
    );
    const count = db.prepare('SELECT COUNT(*) AS n FROM article_authors WHERE article_id = ?').get(id).n;
    if (meta.authors.length && (count === 0 || overwrite)) {
      setArticleAuthors(db, id, inferCorresponding(row.full_text || '', meta.authors));
    }
    res.json({ article: getArticle(db, id, { withText: false }), meta });
  }));

  router.post('/articles/:id/infer-corresponding', (req, res) => {
    const id = asInt(req.params.id);
    const row = getArticleRow(db, id);
    if (!row) throw httpError(404, '文献不存在');
    const authors = articleAuthors(db, id);
    if (!authors.length) throw httpError(400, '该文献还没有作者，无法识别通讯作者');
    const manual = authors.some((a) => a.corresponding && ['manual', 'confirmed'].includes(a.corresponding_source));
    if (manual && !asBool(req.body?.overwrite)) {
      return res.json({ skipped: true, reason: '已有手动确认的通讯作者；如需覆盖请传入 overwrite=1', article: getArticle(db, id, { withText: false }) });
    }
    const inferred = inferCorresponding(row.full_text || row.abstract || '', authors);
    const update = db.prepare(
      `UPDATE article_authors SET corresponding = ?, corresponding_source = ?, corresponding_confidence = ?, corresponding_reason = ?
       WHERE article_id = ? AND author_id = ?`,
    );
    for (const author of inferred) {
      update.run(
        author.corresponding ? 1 : 0,
        author.corresponding_source || '',
        author.corresponding_confidence || '',
        author.corresponding_reason || '',
        id,
        author.id,
      );
      if (author.email) {
        db.prepare("UPDATE authors SET email = ?, updated_at = ? WHERE id = ? AND email = ''").run(author.email, nowIso(), author.id);
      }
    }
    res.json({
      skipped: false,
      article: getArticle(db, id, { withText: false }),
      authors: inferred.filter((a) => a.corresponding),
    });
  });

  router.get('/articles/:id/revisions', (req, res) => {
    const id = asInt(req.params.id);
    const rows = db.prepare('SELECT * FROM revisions WHERE article_id = ? ORDER BY id DESC LIMIT 50').all(id);
    res.json({ items: rows.map((r) => ({ ...r, snapshot: parseJson(r.snapshot, {}) })) });
  });
  router.get('/authors', (req, res) => {
    res.json({ items: listAuthors(db, { q: String(req.query.q || '').trim(), sort: String(req.query.sort || 'articles') }) });
  });

  router.post('/authors', (req, res) => {
    const name = String(req.body?.name || '').trim();
    if (!name) throw httpError(400, '作者姓名不能为空');
    const author = upsertAuthor(db, req.body);
    res.status(201).json(hydrateAuthor(db, author));
  });

  router.get('/authors/:id', (req, res) => {
    const author = db.prepare('SELECT * FROM authors WHERE id = ?').get(asInt(req.params.id));
    if (!author) throw httpError(404, '作者不存在');
    res.json(applyWebsite(hydrateAuthor(db, author)));
  });

  router.patch('/authors/:id', (req, res) => {
    const id = asInt(req.params.id);
    const author = db.prepare('SELECT * FROM authors WHERE id = ?').get(id);
    if (!author) throw httpError(404, '作者不存在');
    const b = req.body || {};
    const fields = {};
    for (const key of ['name', 'affiliation', 'email', 'website', 'orcid', 'openalex_id', 'research_direction', 'notes']) {
      if (b[key] !== undefined) fields[key] = String(b[key] ?? '').trim();
    }
    if (fields.name !== undefined) {
      if (!fields.name) throw httpError(400, '作者姓名不能为空');
      const norm = fields.name.normalize('NFKC').toLowerCase().replace(/[.,;:()\[\]{}'"’“”]/g, ' ').replace(/\s+/g, ' ').trim();
      const conflict = db.prepare('SELECT id FROM authors WHERE name_norm = ? AND id <> ?').get(norm, id);
      if (conflict) throw httpError(409, `已存在同名作者 #${conflict.id}`);
      fields.name_norm = norm;
    }
    if (b.research && typeof b.research === 'object') fields.research_json = JSON.stringify(b.research);
    if (b.website_summary !== undefined) {
      fields.website_summary = typeof b.website_summary === 'string' ? b.website_summary : JSON.stringify(b.website_summary);
    }
    fields.updated_at = nowIso();
    const cols = Object.keys(fields);
    db.prepare(`UPDATE authors SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`).run(
      ...cols.map((c) => fields[c]), id,
    );
    if (fields.name) {
      const articleRows = db.prepare('SELECT article_id FROM article_authors WHERE author_id = ?').all(id);
      const namesStmt = db.prepare(
        `SELECT a.name FROM article_authors aa JOIN authors a ON a.id = aa.author_id
         WHERE aa.article_id = ? ORDER BY aa.position, a.name`,
      );
      const updateText = db.prepare('UPDATE articles SET authors_text = ?, updated_at = ? WHERE id = ?');
      for (const row of articleRows) {
        updateText.run(namesStmt.all(row.article_id).map((x) => x.name).join(', '), nowIso(), row.article_id);
      }
    }
    res.json(applyWebsite(hydrateAuthor(db, db.prepare('SELECT * FROM authors WHERE id = ?').get(id))));
  });

  router.post('/authors/:id/sync', asyncRoute(async (req, res) => {
    const id = asInt(req.params.id);
    const author = db.prepare('SELECT * FROM authors WHERE id = ?').get(id);
    if (!author) throw httpError(404, '作者不存在');
    const contactEmail = getSetting(db, 'contact_email', '') || req.body?.contact_email || '';
    const result = await syncOpenAlex({
      name: author.name,
      affiliation: author.affiliation,
      orcid: author.orcid,
      openalexId: author.openalex_id || req.body?.openalex_id || '',
      contactEmail,
    });
    const info = result.author;
    const research = {
      works_count: info.works_count,
      cited_by_count: info.cited_by_count,
      h_index: info.h_index,
      i10_index: info.i10_index,
      institutions: info.institutions,
      topics: info.topics,
      recent_works: result.works.slice(0, 12),
      synced_at: nowIso(),
    };
    const topicsText = info.topics.slice(0, 4).map((t) => t.name).filter(Boolean).join('、');
    const fields = {
      openalex_id: info.openalex_id || author.openalex_id,
      orcid: author.orcid || info.orcid || '',
      website: author.website || info.website || '',
      affiliation: author.affiliation || info.affiliation || '',
      research_direction: author.research_direction || topicsText,
      research_json: JSON.stringify(research),
      last_synced_at: nowIso(),
      updated_at: nowIso(),
    };
    const cols = Object.keys(fields);
    db.prepare(`UPDATE authors SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`).run(
      ...cols.map((c) => fields[c]), id,
    );
    const exists = db.prepare('SELECT id FROM author_updates WHERE author_id = ? AND source = ? AND external_id = ?');
    const insert = db.prepare(
      `INSERT INTO author_updates (author_id, kind, title, detail, url, occurred_on, source, external_id, created_at)
       VALUES (?, 'paper', ?, ?, ?, ?, 'openalex', ?, ?)`,
    );
    let added = 0;
    for (const work of result.works) {
      if (!work.title || !work.id) continue;
      if (exists.get(id, 'openalex', work.id)) continue;
      insert.run(
        id,
        work.title,
        [work.type === 'preprint' ? '预印本' : work.type === 'review' ? '综述' : '', work.retracted ? '已撤稿' : '', work.journal, work.cited_by ? `被引 ${work.cited_by}` : '', ...(work.topics || [])].filter(Boolean).join(' · '),
        work.url || '',
        work.date || (work.year ? String(work.year) : ''),
        work.id,
        nowIso(),
      );
      added += 1;
    }
    res.json({
      author: applyWebsite(hydrateAuthor(db, db.prepare('SELECT * FROM authors WHERE id = ?').get(id))),
      added_updates: added,
      matched: info,
    });
  }));

  router.post('/authors/:id/website', asyncRoute(async (req, res) => {
    const id = asInt(req.params.id);
    const author = db.prepare('SELECT * FROM authors WHERE id = ?').get(id);
    if (!author) throw httpError(404, '作者不存在');
    const url = String(req.body?.url || author.website || '').trim();
    if (!url) throw httpError(400, '请先填写作者主页网址');
    const summary = await fetchWebsiteSummary(url);
    const stored = { ...summary, fetched_at: nowIso() };
    db.prepare('UPDATE authors SET website_summary = ?, website = ?, updated_at = ? WHERE id = ?').run(
      JSON.stringify(stored), summary.url, nowIso(), id,
    );
    res.json({ author: applyWebsite(hydrateAuthor(db, db.prepare('SELECT * FROM authors WHERE id = ?').get(id))), summary: stored });
  }));

  router.post('/authors/:id/updates', (req, res) => {
    const id = asInt(req.params.id);
    const author = db.prepare('SELECT id FROM authors WHERE id = ?').get(id);
    if (!author) throw httpError(404, '作者不存在');
    const title = String(req.body?.title || '').trim();
    if (!title) throw httpError(400, '动态标题不能为空');
    const info = db.prepare(
      `INSERT INTO author_updates (author_id, kind, title, detail, url, occurred_on, source, external_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'manual', '', ?)`,
    ).run(
      id,
      String(req.body?.kind || 'note'),
      title,
      String(req.body?.detail || '').trim(),
      String(req.body?.url || '').trim(),
      String(req.body?.occurred_on || '').slice(0, 10),
      nowIso(),
    );
    res.status(201).json(db.prepare('SELECT * FROM author_updates WHERE id = ?').get(info.lastInsertRowid));
  });

  router.patch('/authors/updates/:uid', (req, res) => {
    const uid = asInt(req.params.uid);
    const update = db.prepare('SELECT * FROM author_updates WHERE id = ?').get(uid);
    if (!update) throw httpError(404, '动态不存在');
    const b = req.body || {};
    const fields = {};
    for (const key of ['kind', 'title', 'detail', 'url', 'occurred_on']) {
      if (b[key] !== undefined) fields[key] = String(b[key] ?? '').trim();
    }
    if (!Object.keys(fields).length) return res.json(update);
    db.prepare(`UPDATE author_updates SET ${Object.keys(fields).map((k) => `${k} = ?`).join(', ')} WHERE id = ?`).run(
      ...Object.values(fields), uid,
    );
    res.json(db.prepare('SELECT * FROM author_updates WHERE id = ?').get(uid));
  });

  router.delete('/authors/updates/:uid', (req, res) => {
    const uid = asInt(req.params.uid);
    db.prepare('DELETE FROM author_updates WHERE id = ?').run(uid);
    res.json({ ok: true });
  });

  router.get('/stacks', (_req, res) => {
    const all = listStacks(db);
    const direct = new Map();
    for (const link of db.prepare('SELECT stack_id, article_id FROM article_stacks').all()) {
      if (!direct.has(link.stack_id)) direct.set(link.stack_id, new Set());
      direct.get(link.stack_id).add(link.article_id);
    }
    const children = new Map();
    for (const node of all) {
      if (!children.has(node.parent_id)) children.set(node.parent_id, []);
      children.get(node.parent_id).push(node.id);
    }
    const aggregate = new Map();
    const collect = (id) => {
      if (aggregate.has(id)) return aggregate.get(id);
      const set = new Set(direct.get(id) || []);
      for (const child of children.get(id) || []) for (const aid of collect(child)) set.add(aid);
      aggregate.set(id, set);
      return set;
    };
    const items = all.map((node) => ({
      ...node,
      direct_count: (direct.get(node.id) || new Set()).size,
      article_count: collect(node.id).size,
    }));
    res.json({ items, total: items.length });
  });

  router.post('/stacks', (req, res) => {
    const name = String(req.body?.name || '').trim();
    if (!name) throw httpError(400, '技术栈名称不能为空');
    const exists = db.prepare('SELECT id FROM stacks WHERE name = ?').get(name);
    if (exists) throw httpError(409, '同名技术栈已存在');
    let parent = null;
    if (req.body?.parent_id !== undefined && req.body.parent_id !== null && req.body.parent_id !== '') {
      parent = db.prepare('SELECT * FROM stacks WHERE id = ?').get(asInt(req.body.parent_id));
      if (!parent) throw httpError(400, '父级技术栈不存在');
    }
    const color = /^#[0-9a-f]{6}$/i.test(req.body?.color || '') ? req.body.color : parent?.color || '#4b6b88';
    const keywords = Array.isArray(req.body?.keywords) ? req.body.keywords.join(',') : String(req.body?.keywords || '');
    const info = db.prepare(
      'INSERT INTO stacks (name, parent_id, color, description, keywords, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(
      name,
      parent?.id ?? null,
      color,
      String(req.body?.description || '').trim(),
      keywords.trim(),
      asInt(req.body?.sort_order, 500),
      nowIso(),
    );
    const created = db.prepare('SELECT * FROM stacks WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ ...created, path: parent ? `${parent.name} / ${created.name}` : created.name, level: parent ? 1 : 0 });
  });

  router.patch('/stacks/:id', (req, res) => {
    const id = asInt(req.params.id);
    const stack = db.prepare('SELECT * FROM stacks WHERE id = ?').get(id);
    if (!stack) throw httpError(404, '技术栈不存在');
    const b = req.body || {};
    const fields = {};
    for (const key of ['name', 'description', 'keywords']) {
      if (b[key] !== undefined) fields[key] = Array.isArray(b[key]) ? b[key].join(',') : String(b[key] ?? '').trim();
    }
    if (fields.name !== undefined && !fields.name) throw httpError(400, '技术栈名称不能为空');
    if (fields.name) {
      const conflict = db.prepare('SELECT id FROM stacks WHERE name = ? AND id <> ?').get(fields.name, id);
      if (conflict) throw httpError(409, '同名技术栈已存在');
    }
    if (b.parent_id !== undefined) {
      if (b.parent_id === null || b.parent_id === '' || Number(b.parent_id) === 0) {
        fields.parent_id = null;
      } else {
        const parentId = asInt(b.parent_id);
        if (parentId === id) throw httpError(400, '不能把技术栈设为自己的子级');
        if (descendantStackIds(db, id).includes(parentId)) throw httpError(400, '不能把技术栈移动到自己的子级下');
        const parent = db.prepare('SELECT id FROM stacks WHERE id = ?').get(parentId);
        if (!parent) throw httpError(400, '父级技术栈不存在');
        fields.parent_id = parentId;
      }
    }
    if (b.color !== undefined && /^#[0-9a-f]{6}$/i.test(b.color)) fields.color = b.color;
    if (b.sort_order !== undefined) fields.sort_order = asInt(b.sort_order, stack.sort_order);
    if (!Object.keys(fields).length) return res.json(stack);
    db.prepare(`UPDATE stacks SET ${Object.keys(fields).map((k) => `${k} = ?`).join(', ')} WHERE id = ?`).run(
      ...Object.values(fields), id,
    );
    res.json(db.prepare('SELECT * FROM stacks WHERE id = ?').get(id));
  });

  router.delete('/stacks/:id', (req, res) => {
    const id = asInt(req.params.id);
    const stack = db.prepare('SELECT * FROM stacks WHERE id = ?').get(id);
    if (!stack) throw httpError(404, '技术栈不存在');
    const ids = descendantStackIds(db, id);
    const placeholders = ids.map(() => '?').join(',');
    const articleIds = new Set(
      db.prepare(`SELECT article_id FROM article_stacks WHERE stack_id IN (${placeholders})`).all(...ids).map((r) => r.article_id),
    );
    db.prepare('DELETE FROM stacks WHERE id = ?').run(id);
    res.json({ ok: true, detached_articles: articleIds.size, deleted_nodes: ids.length });
  });

  router.get('/critiques', (req, res) => {
    const filters = [];
    const params = [];
    if (req.query.status && CRITIQUE_STATUS.has(req.query.status)) {
      filters.push('c.status = ?');
      params.push(req.query.status);
    }
    if (req.query.stance && STANCES.has(req.query.stance)) {
      filters.push('c.stance = ?');
      params.push(req.query.stance);
    }
    if (req.query.q) {
      filters.push('(c.content LIKE ? OR c.evidence LIKE ? OR ar.title LIKE ?)');
      const like = `%${String(req.query.q).slice(0, 100)}%`;
      params.push(like, like, like);
    }
    if (req.query.author_id) {
      filters.push('EXISTS (SELECT 1 FROM article_authors aa2 WHERE aa2.article_id = ar.id AND aa2.author_id = ?)');
      params.push(asInt(req.query.author_id));
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const items = db.prepare(
      `SELECT c.*, ar.title AS article_title, ar.year AS article_year,
        (SELECT GROUP_CONCAT(a.name, ', ') FROM article_authors aa JOIN authors a ON a.id = aa.author_id
          WHERE aa.article_id = ar.id AND aa.corresponding = 1) AS corresponding_authors
       FROM critiques c JOIN articles ar ON ar.id = c.article_id
       ${where} ORDER BY c.created_at DESC LIMIT 300`,
    ).all(...params);
    const summary = db.prepare(
      `SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END), 0) AS open,
        COALESCE(SUM(CASE WHEN stance = 'challenge' THEN 1 ELSE 0 END), 0) AS challenges,
        COALESCE(SUM(CASE WHEN stance = 'question' THEN 1 ELSE 0 END), 0) AS questions
       FROM critiques`,
    ).get();
    const byDimension = db.prepare('SELECT dimension, COUNT(*) AS n FROM critiques GROUP BY dimension ORDER BY n DESC').all();
    res.json({ items, summary, byDimension });
  });

  router.post('/critiques', (req, res) => {
    const articleId = asInt(req.body?.article_id);
    const article = db.prepare('SELECT id FROM articles WHERE id = ?').get(articleId);
    if (!article) throw httpError(404, '文献不存在');
    const content = String(req.body?.content || '').trim();
    if (!content) throw httpError(400, '批判内容不能为空');
    if (content.length > 6000) throw httpError(400, '批判内容过长（上限 6000 字）');
    const stance = STANCES.has(req.body?.stance) ? req.body.stance : 'question';
    const dimension = DIMENSIONS.has(req.body?.dimension) ? req.body.dimension : 'method';
    const severity = Math.min(5, Math.max(1, asInt(req.body?.severity, 3)));
    const info = db.prepare(
      `INSERT INTO critiques (article_id, critic, stance, dimension, severity, content, evidence, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
    ).run(
      articleId,
      String(req.body?.critic || '我').trim() || '我',
      stance,
      dimension,
      severity,
      content,
      String(req.body?.evidence || '').trim(),
      nowIso(),
      nowIso(),
    );
    res.status(201).json(db.prepare('SELECT * FROM critiques WHERE id = ?').get(info.lastInsertRowid));
  });

  router.patch('/critiques/:id', (req, res) => {
    const id = asInt(req.params.id);
    const critique = db.prepare('SELECT * FROM critiques WHERE id = ?').get(id);
    if (!critique) throw httpError(404, '批判记录不存在');
    const b = req.body || {};
    const fields = {};
    if (b.content !== undefined) {
      const content = String(b.content).trim();
      if (!content) throw httpError(400, '批判内容不能为空');
      fields.content = content;
    }
    if (b.evidence !== undefined) fields.evidence = String(b.evidence).trim();
    if (b.critic !== undefined) fields.critic = String(b.critic).trim() || '我';
    if (b.stance !== undefined && STANCES.has(b.stance)) fields.stance = b.stance;
    if (b.dimension !== undefined && DIMENSIONS.has(b.dimension)) fields.dimension = b.dimension;
    if (b.severity !== undefined) fields.severity = Math.min(5, Math.max(1, asInt(b.severity, 3)));
    if (b.status !== undefined && CRITIQUE_STATUS.has(b.status)) fields.status = b.status;
    fields.updated_at = nowIso();
    const cols = Object.keys(fields);
    db.prepare(`UPDATE critiques SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`).run(
      ...cols.map((c) => fields[c]), id,
    );
    res.json(db.prepare('SELECT * FROM critiques WHERE id = ?').get(id));
  });

  router.delete('/critiques/:id', (req, res) => {
    db.prepare('DELETE FROM critiques WHERE id = ?').run(asInt(req.params.id));
    res.json({ ok: true });
  });

  router.get('/settings', (_req, res) => {
    res.json({
      contact_email: getSetting(db, 'contact_email', ''),
      asap_base_url: getSetting(db, 'asap_base_url', ''),
      has_asap_key: !!getSetting(db, 'asap_api_key', ''),
      data_dir: cfg.dataDir,
      max_upload_mb: Math.round(cfg.maxUploadBytes / 1024 / 1024),
      version: '1.0.0',
    });
  });

  router.patch('/settings', (req, res) => {
    const b = req.body || {};
    const map = {
      contact_email: (v) => String(v).trim(),
      asap_base_url: (v) => String(v).trim(),
      asap_api_key: (v) => String(v).trim(),
    };
    for (const [key, transform] of Object.entries(map)) {
      if (b[key] !== undefined) setSetting(db, key, transform(b[key]));
    }
    if (b.clear_asap_key) setSetting(db, 'asap_api_key', '');
    res.json({ ok: true });
  });

  router.post('/settings/test-asap', asyncRoute(async (req, res) => {
    const url = String(req.body?.url || getSetting(db, 'asap_base_url', '') || '').trim();
    if (!url) throw httpError(400, '请先填写 ASAP 服务地址');
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      throw httpError(400, 'ASAP 地址格式无效');
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw httpError(400, '仅支持 http/https');
    const key = req.body?.api_key || getSetting(db, 'asap_api_key', '');
    const started = Date.now();
    const response = await fetch(parsed, {
      headers: key ? { Authorization: `Bearer ${key}` } : {},
      signal: AbortSignal.timeout(15000),
    });
    const text = (await response.text()).slice(0, 500);
    res.json({ ok: response.ok, status: response.status, ms: Date.now() - started, preview: text });
  }));

  router.get('/export', (req, res) => {
    const data = collectExport(db, { includeText: req.query.text === '1' });
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="chemintelanalysis-export-${stamp}.json"`);
    res.send(JSON.stringify(data, null, 2));
  });

  router.post('/backup', (req, res) => {
    const data = collectExport(db, { includeText: req.body?.include_text !== false });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = `backup-${stamp}.json`;
    const file = path.join(cfg.backupDir, name);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    res.json({ ok: true, file: name, path: file, bytes: fs.statSync(file).size });
  });

  router.get('/math/svg', (req, res) => {
    const tex = String(req.query.tex || '').slice(0, 2000);
    const display = req.query.display === '1';
    let svg;
    try {
      svg = renderFormulaSvg(tex, display);
    } catch (err) {
      svg = errorSvg(err.message || '公式渲染失败');
    }
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
    res.send(svg);
  });

  router.use((_req, res) => res.status(404).json({ error: 'API 不存在' }));
  return router;
}
