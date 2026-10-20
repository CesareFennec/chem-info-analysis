import dns from 'node:dns/promises';
import net from 'node:net';
import { stripJats } from './analyzer.js';

const UA = 'ChemIntelAnalysis/1.0 (local research tool)';

async function fetchJson(url, { timeout = 12000 } = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

export function normalizeDoi(input = '') {
  let doi = String(input).trim();
  doi = doi.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '');
  doi = doi.replace(/^doi:\s*/i, '');
  return doi.replace(/[.,;:]+$/, '').trim();
}

export async function lookupCrossref(doiInput) {
  const doi = normalizeDoi(doiInput);
  if (!doi) throw new Error('DOI 为空');
  const data = await fetchJson(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  const m = data.message || {};
  const dateParts = m['published-print']?.['date-parts']?.[0] || m['published-online']?.['date-parts']?.[0] || m.issued?.['date-parts']?.[0] || [];
  const authors = (m.author || []).map((a, i) => ({
    name: [a.given, a.family].filter(Boolean).join(' ') || a.name || '',
    affiliation: (a.affiliation || []).map((x) => x.name).filter(Boolean).join('; '),
    orcid: String(a.ORCID || '').replace(/^https?:\/\/orcid\.org\//, ''),
    corresponding: false,
    position: i,
  })).filter((a) => a.name);
  return {
    doi: m.DOI || doi,
    title: Array.isArray(m.title) ? m.title[0] : m.title || '',
    subtitle: Array.isArray(m.subtitle) ? m.subtitle[0] : '',
    journal: Array.isArray(m['container-title']) ? m['container-title'][0] : m['container-title'] || '',
    year: dateParts[0] || null,
    abstract: stripJats(m.abstract || ''),
    authors,
    url: m.URL || `https://doi.org/${doi}`,
    publisher: m.publisher || '',
    type: m.type || '',
    source: 'crossref',
  };
}

function hostIsPrivate(address) {
  if (net.isIPv4(address)) {
    const parts = address.split('.').map(Number);
    return (
      parts[0] === 10 || parts[0] === 127 || parts[0] === 0 ||
      (parts[0] === 169 && parts[1] === 254) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127)
    );
  }
  if (net.isIPv6(address)) {
    const a = address.toLowerCase();
    return a === '::1' || a === '::' || a.startsWith('fc') || a.startsWith('fd') || a.startsWith('fe80') || a.startsWith('::ffff:127');
  }
  return true;
}

async function assertPublicUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('无效网址');
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('仅支持 http/https');
  if (/^(localhost|.*\.local|.*\.internal)$/i.test(url.hostname)) throw new Error('不允许访问本机/内网地址');
  const addresses = await dns.lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((a) => hostIsPrivate(a.address))) throw new Error('不允许访问内网地址');
  return url;
}

export async function fetchWebsiteSummary(rawUrl) {
  let url = await assertPublicUrl(rawUrl);
  let res;
  for (let i = 0; i < 4; i += 1) {
    res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ChemIntelAnalysis/1.0)', Accept: 'text/html,application/xhtml+xml' },
      redirect: 'manual',
      signal: AbortSignal.timeout(12000),
    });
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (!loc) break;
      url = await assertPublicUrl(new URL(loc, url).toString());
      continue;
    }
    break;
  }
  if (!res || !res.ok) throw new Error(`网页返回 HTTP ${res?.status || '错误'}`);
  const type = res.headers.get('content-type') || '';
  if (!/html|text/i.test(type)) throw new Error('目标不是 HTML 页面');
  const raw = (await res.text()).slice(0, 1_500_000);
  const title = (raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim();
  const meta = (name) => {
    const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i');
    const alt = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`, 'i');
    return (raw.match(re)?.[1] || raw.match(alt)?.[1] || '').trim();
  };
  const description = meta('description') || meta('og:description') || '';
  const keywords = meta('keywords');
  const text = raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000);
  return { url: url.toString(), title, description, keywords, text };
}

function pickAuthor(candidates, name, affiliation = '') {
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z\u4e00-\u9fff ]/g, ' ').replace(/\s+/g, ' ').trim();
  const target = norm(name);
  const aff = norm(affiliation).split(' ').filter((w) => w.length > 3);
  let best = null;
  let bestScore = -Infinity;
  for (const c of candidates) {
    const cname = norm(c.display_name || '');
    let score = 0;
    if (cname === target) score += 8;
    else if (cname.includes(target) || target.includes(cname)) score += 4;
    else score += Math.min(3, target.split(' ').filter((w) => cname.includes(w)).length);
    const inst = norm((c.last_known_institutions || []).map((x) => x.display_name).join(' '));
    score += aff.filter((w) => inst.includes(w)).length * 2;
    score += Math.min(2, Math.log10((c.works_count || 1) + 1));
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

export async function syncOpenAlex({ name, affiliation = '', orcid = '', openalexId = '', contactEmail = '' }) {
  const mail = contactEmail ? `&mailto=${encodeURIComponent(contactEmail)}` : '';
  let author = null;
  if (openalexId) {
    const id = String(openalexId).replace(/^https?:\/\/openalex\.org\//, '');
    author = await fetchJson(`https://api.openalex.org/authors/${encodeURIComponent(id)}?${mail.slice(1)}`);
  } else if (orcid) {
    const data = await fetchJson(`https://api.openalex.org/authors?filter=orcid:${encodeURIComponent(orcid)}${mail}`);
    author = data.results?.[0] || null;
  } else {
    const data = await fetchJson(`https://api.openalex.org/authors?search=${encodeURIComponent(name)}&per-page=15${mail}`);
    author = pickAuthor(data.results || [], name, affiliation);
  }
  if (!author) throw new Error('OpenAlex 未找到匹配作者');
  const aid = String(author.id || '').replace(/^https?:\/\/openalex\.org\//, '');
  const worksData = await fetchJson(
    `https://api.openalex.org/works?filter=author.id:${encodeURIComponent(aid)}&sort=publication_date:desc&per-page=20${mail}`,
  );
  const keepTypes = new Set(['article', 'preprint', 'review', 'book-chapter', 'letter']);
  const seenTitles = new Set();
  const works = (worksData.results || [])
    .filter((w) => !w.type || keepTypes.has(w.type))
    .map((w) => ({
      id: String(w.id || '').replace(/^https?:\/\/openalex\.org\//, ''),
      title: w.title || w.display_name || '',
      year: w.publication_year,
      date: w.publication_date,
      doi: w.doi || '',
      url: w.doi || w.id || '',
      journal: w.primary_location?.source?.display_name || '',
      cited_by: w.cited_by_count || 0,
      type: w.type || '',
      retracted: !!w.is_retracted,
      topics: (w.topics || []).slice(0, 3).map((t) => t.display_name),
    }))
    .filter((w) => {
      if (!w.title) return false;
      const key = w.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '').slice(0, 160);
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    });
  const topics = (author.topics || author.x_concepts || [])
    .slice(0, 12)
    .map((t) => ({ name: t.display_name || t.name || '', count: t.count || t.score || 0 }));
  const institutions = (author.last_known_institutions || author.last_known_institution || [])
    .map((i) => i?.display_name || i?.name || '')
    .filter(Boolean);
  return {
    author: {
      openalex_id: aid,
      orcid: author.orcid ? String(author.orcid).replace(/^https?:\/\/orcid\.org\//, '') : '',
      website: author.homepage_url || '',
      display_name: author.display_name || name,
      works_count: author.works_count || 0,
      cited_by_count: author.cited_by_count || 0,
      h_index: author.summary_stats?.h_index || 0,
      i10_index: author.summary_stats?.i10_index || 0,
      institutions,
      topics,
      affiliation: institutions[0] || affiliation,
    },
    works,
  };
}
