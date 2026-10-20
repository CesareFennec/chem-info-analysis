const METHOD_TERMS = [
  ['密度泛函理论 (DFT)', /\b(density functional theory|DFT|Kohn[- ]Sham)\b/i],
  ['波函数电子结构', /\b(coupled cluster|CCSD\(T\)|CCSD|MP2|CASSCF|CASPT2|NEVPT2|MRCI|full CI|configuration interaction)\b/i],
  ['量子波包动力学', /\b(quantum dynamics|wavepacket|wave packet|MCTDH|multi[- ]configuration time[- ]dependent Hartree|split[- ]operator)\b/i],
  ['路径积分 / RPMD', /\b(path integral|RPMD|ring polymer|PIMMD|centroid molecular dynamics)\b/i],
  ['开放量子体系 (HEOM/主方程)', /\b(HEOM|hierarchical equations|quantum master equation|Lindblad|Redfield|polaron transform)\b/i],
  ['经典分子动力学', /\b(molecular dynamics|MD simulation|MD simulations|Langevin dynamics|Nos[eé][- ]Hoover)\b/i],
  ['过渡态理论', /\b(transition state theory|TST|variational TST|CVT|instanton)\b/i],
  ['RRKM / 主方程', /\b(RRKM|Rice[- ]Ramsperger[- ]Kassel[- ]Marcus|master equation|microcanonical rate)\b/i],
  ['准经典轨迹', /\b(quasi[- ]classical trajector|QCT|classical trajector)\b/i],
  ['非绝热动力学', /\b(nonadiabatic|surface hopping|fewest switches|Ehrenfest|conical intersection)\b/i],
  ['机器学习势', /\b(machine learning potential|neural network potential|MLIP|GAP|DeePMD|ANI|equivariant|message[- ]passing neural network)\b/i],
  ['动理学蒙特卡洛', /\b(kinetic Monte Carlo|kMC)\b/i],
  ['微观动力学建模', /\b(microkinetic|mean[- ]field model|reaction network)\b/i],
  ['实验动力学', /\b(time[- ]resolved|pump[- ]probe|crossed beam|molecular beam|shock tube|flow reactor|transient absorption|laser[- ]induced fluorescence)\b/i],
  ['光谱计算', /\b(TDDFT|excitation spectra|absorption spectrum|vibrational spectrum|Raman|infrared spectrum|electronic spectrum)\b/i],
  ['自由能 / 增强采样', /\b(umbrella sampling|metadynamics|free energy surface|replica exchange|thermodynamic integration)\b/i],
];

const OBSERVABLE_TERMS = [
  ['速率常数', /\b(rate constant|rate coefficients?|thermal rate|reaction rate)\b/i],
  ['反应截面', /\b(cross section|cross-section|reactive scattering)\b/i],
  ['分支比 / 产物分布', /\b(branching ratio|branching fraction|product distribution|product branching)\b/i],
  ['产率 / 选择性', /\b(yield|selectivity|turnover frequency|conversion)\b/i],
  ['平衡常数', /\b(equilibrium constant|free energy of reaction|reaction free energy)\b/i],
  ['速率 / 寿命', /\b(lifetime|decay rate|relaxation rate|population decay|coherence lifetime)\b/i],
  ['扩散 / 输运系数', /\b(diffusion coefficient|viscosity|thermal conductivity|mobility)\b/i],
  ['光谱 / 谱线', /\b(spectrum|spectra|spectral density|line shape|peak position)\b/i],
  ['同位素效应', /\b(kinetic isotope effect|KIE|isotope effect)\b/i],
  ['布居 / 相干', /\b(population|coherence|occupation|state population)\b/i],
  ['能量转移', /\b(energy transfer|energy relaxation|vibrational relaxation|heat transfer)\b/i],
];

const THEORY_TERMS = [
  ['量子力学', /\bquantum (?:mechanical|dynamics|treatment|chemistry|simulation)\b|\bquantum\b/i],
  ['经典力学', /\bclassical (?:mechanics|dynamics|trajectory|simulation)\b/i],
  ['半经典', /\bsemiclassical|semi-classical|WKB|instanton\b/i],
  ['统计力学', /\bstatistical mechanics|partition function|canonical ensemble|microcanonical|Boltzmann\b/i],
  ['开放量子体系', /\bopen quantum system|system[- ]bath|Markovian|non-Markovian|decoherence\b/i],
  ['非绝热', /\bnonadiabatic|non-adiabatic|diabatic|avoided crossing|conical intersection\b/i],
  ['绝热 / BO 近似', /\badiabatic|Born[- ]Oppenheimer\b/i],
  ['线性响应', /\blinear response|Green[- ]Kubo|spectral function\b/i],
];

const SOFTWARE_TERMS = [
  'VASP', 'Gaussian', 'ORCA', 'Q-Chem', 'Molpro', 'MOLCAS', 'NWChem', 'LAMMPS',
  'GROMACS', 'OpenMM', 'ASE', 'i-PI', 'PySCF', 'CP2K', 'Quantum ESPRESSO', 'CHARMM',
  'AMBER', 'Polyrate', 'MESS', 'Thermo', 'Cantera', 'CHEMKIN', 'PyRates', 'QuTiP',
];

const KINETICS_STRONG = [
  /\bchemical kinetics\b/i, /\breaction rate(s)?\b/i, /\brate constant(s)?\b/i,
  /\bthermal rate\b/i, /\bRRKM\b/, /\btransition state theory\b/i, /\bmaster equation\b/i,
  /\bkinetic isotope effect\b/i, /\breaction dynamics\b/i, /\bpotential energy surface\b/i,
  /\bmicrocanonical\b/i, /\bArrhenius\b/i, /\bpre[- ]exponential factor\b/i,
];
const KINETICS_MEDIUM = [
  /\bkinetics?\b/i, /\breaction mechanism\b/i, /\bactivation energy\b/i, /\bcatalyst\b/i,
  /\bcombustion\b/i, /\bpyrolysis\b/i, /\bphotodissociation\b/i, /\bscattering\b/i,
  /\bbranching ratio\b/i, /\bchemical reaction\b/i,
];

const ABBREVIATIONS = /\b(e\.g|i\.e|et al|Fig|Figs|Eq|Eqs|Ref|Refs|vs|cf|approx|ca|No|Dr|Prof|Phys|Chem|J|Rev|Lett|Commun|Sci|Proc|Natl|Acad|USA|Inc|Ltd|St|Univ|Dept)\./gi;

export function stripJats(html = '') {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x?[0-9a-f]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentencesFrom(block = '') {
  const text = String(block)
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(ABBREVIATIONS, (m) => m.replace('.', '§'))
    .trim();
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"'(])/)
    .map((s) => s.replace(/§/g, '.').trim())
    .filter((s) => s.length >= 35 && s.length <= 900)
    .map((s) => s.replace(/\s+/g, ' '));
}

function sectionMap(text) {
  const pattern = /(?:^|\n)\s*(?:\d+(?:\.\d+)*\.?\s*)?(Abstract|Introduction|Background|Methods?|Methodology|Computational Details?|Theory|Theoretical (?:Methods?|Framework)|Model(?: and Methods?)?|Results?(?: and Discussion)?|Discussion|Conclusions?|Summary and Outlook|Summary|Outlook|Acknowledg(?:e)?ments?|References|Appendix)\s*(?:\n|$)/gi;
  const hits = [];
  for (const m of text.matchAll(pattern)) {
    hits.push({ name: m[1].toLowerCase(), index: m.index, end: m.index + m[0].length });
  }
  const map = {};
  for (let i = 0; i < hits.length; i += 1) {
    const next = hits[i + 1]?.index ?? text.length;
    const current = map[hits[i].name] || '';
    const segment = text.slice(hits[i].end, next).trim();
    map[hits[i].name] = current ? `${current}\n\n${segment}` : segment;
  }
  const pick = (...names) => names.map((n) => map[n]).filter(Boolean).join('\n\n');
  return {
    abstract: pick('abstract'),
    introduction: pick('introduction', 'background'),
    methods: pick('methods', 'methodology', 'computational details', 'theory', 'theoretical method', 'theoretical methods', 'theoretical framework', 'model', 'model and methods'),
    results: pick('results', 'results and discussion', 'discussion'),
    conclusion: pick('conclusion', 'conclusions', 'summary and outlook', 'summary', 'outlook'),
    map,
  };
}

function pickSentences(sentences, regexes, limit = 2, maxLen = 420) {
  const scored = [];
  const seen = new Set();
  for (const sentence of sentences) {
    if (sentence.length < 35 || sentence.length > 900) continue;
    let score = 0;
    for (const re of regexes) if (re.test(sentence)) score += 1;
    if (score === 0) continue;
    const key = sentence.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '').slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);
    scored.push({ sentence, score: score + Math.min(sentence.length, 300) / 3000 });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => (s.sentence.length > maxLen ? `${s.sentence.slice(0, maxLen - 1).trim()}…` : s.sentence));
}

function fieldResult(sentences, regexes, limit = 2) {
  const picks = pickSentences(sentences, regexes, limit);
  return {
    text: picks.join(' '),
    evidence: picks,
    hits: picks.length,
  };
}

function confidenceOf(hits) {
  if (hits >= 3) return 'high';
  if (hits >= 1) return 'medium';
  return 'low';
}

function labelsFromTerms(text, terms) {
  const found = [];
  for (const [label, re] of terms) {
    if (re.test(text)) found.push(label);
  }
  return [...new Set(found)];
}

export function detectKinetics(text, extra = {}) {
  const sample = `${extra.title || ''}\n${extra.journal || ''}\n${String(text).slice(0, 120000)}`;
  let strong = 0;
  let medium = 0;
  const matched = [];
  for (const re of KINETICS_STRONG) {
    if (re.test(sample)) {
      strong += 1;
      matched.push(re.source.replace(/\\b|\\/g, '').slice(0, 40));
    }
  }
  for (const re of KINETICS_MEDIUM) if (re.test(sample)) medium += 1;
  const journalHit = /(chemical physics|physical chemistry|chemical theory|combustion|kinetics|catalysis|reaction|faraday)/i.test(
    extra.journal || '',
  );
  return {
    isKinetics: strong >= 2 || (strong >= 1 && (medium >= 2 || journalHit)),
    score: strong * 2 + medium + (journalHit ? 1 : 0),
    matched: [...new Set(matched)].slice(0, 8),
  };
}

export function suggestStacks(text, stacks = []) {
  const haystack = String(text).slice(0, 180000);
  const parentIds = new Set(stacks.map((s) => s.parent_id).filter(Boolean));
  const scoreStack = (stack) => {
    const kws = String(stack.keywords || '')
      .split(/[,，;；]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const matched = [];
    for (const kw of kws) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(?:^|[^A-Za-z0-9])${escaped}(?:[^A-Za-z0-9]|$)`, 'i');
      if (re.test(haystack)) matched.push(kw);
      if (matched.length >= 6) break;
    }
    const strong = matched.some((k) => k.length >= 10 || (/^[A-Z0-9()/.-]{3,}$/.test(k) && k.length >= 4));
    if (!(matched.length >= 2 || strong)) return null;
    return {
      id: stack.id,
      name: stack.name,
      color: stack.color,
      path: stack.path || stack.name,
      parent_id: stack.parent_id || null,
      score: matched.length + matched.reduce((n, k) => n + Math.min(k.length, 18), 0) / 100,
      matched,
    };
  };
  const leaves = stacks.filter((s) => !parentIds.has(s.id));
  const leafSuggestions = leaves.map(scoreStack).filter(Boolean);
  const parentById = new Map(stacks.map((s) => [s.id, s.parent_id]));
  const coveredParents = new Set();
  for (const suggestion of leafSuggestions) {
    let parent = parentById.get(suggestion.id);
    while (parent) {
      coveredParents.add(parent);
      parent = parentById.get(parent);
    }
  }
  const parentSuggestions = stacks
    .filter((s) => parentIds.has(s.id) && !coveredParents.has(s.id))
    .map(scoreStack)
    .filter(Boolean);
  return [...leafSuggestions, ...parentSuggestions].sort((a, b) => b.score - a.score).slice(0, 5);
}

export function extractKeywords(text, title = '') {
  const labels = labelsFromTerms(text, METHOD_TERMS);
  const obs = labelsFromTerms(text, OBSERVABLE_TERMS).slice(0, 3);
  const theory = labelsFromTerms(text, THEORY_TERMS).slice(0, 2);
  const metaKws = String(title)
    .split(/[.:;,-]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3 && s.length < 40);
  return [...new Set([...labels, ...obs, ...theory, ...metaKws.slice(0, 3)])].slice(0, 12);
}

export function analyzeArticle({ text = '', title = '', abstract = '', journal = '', year = '', existing = {} } = {}) {
  const full = String(text || '');
  const sections = sectionMap(full);
  const abstractText = String(abstract || '').trim() || sections.abstract || full.slice(0, 3500);
  const abstractSentences = sentencesFrom(abstractText);
  const introSentences = sentencesFrom(sections.introduction || full.slice(0, 12000));
  const methodSentences = sentencesFrom(sections.methods || '');
  const resultSentences = sentencesFrom(sections.results || '');
  const conclusionSentences = sentencesFrom(sections.conclusion || '');
  const allSentences = [...abstractSentences, ...introSentences, ...methodSentences, ...resultSentences, ...conclusionSentences];

  const questionRegex = [
    /\b(we|here|this (?:work|study|paper|article))\b.{0,80}\b(investigat|study|address|explore|examine|report|present|develop|propose|aim|focus|elucidat|understand|resolve|test|quantif)/i,
    /\b(goal|purpose|objective|question|challenge|open problem|remains? (?:unclear|unknown|elusive))\b/i,
    /\b(how|why|whether)\b.{10,160}\?/i,
  ];
  const question = fieldResult([...abstractSentences, ...introSentences], questionRegex, 2);

  const methodsRegex = [
    /\b(we|this work|here)\b.{0,100}\b(use|used|employ|perform|carry out|develop|combine|apply|simulat|calculat|measur|model)/i,
    /\b(method|approach|framework|protocol|simulation|calculation|experiment|theory)\b/i,
    ...METHOD_TERMS.map(([, re]) => re),
  ];
  const methods = fieldResult([...abstractSentences, ...methodSentences, ...resultSentences], methodsRegex, 3);
  const methodLabels = labelsFromTerms(full, METHOD_TERMS);

  const conclusion = fieldResult(
    conclusionSentences.length ? conclusionSentences : [...abstractSentences, ...resultSentences],
    [
      /\b(conclud|in summary|overall|we find|we show|our results|these results|demonstrat|reveal|indicat|suggest|implication)/i,
      /\b(future|outlook|remain|open question)\b/i,
    ],
    3,
  );

  const limitations = fieldResult([...conclusionSentences, ...resultSentences, ...methodSentences], [
    /\b(limitation|caveat|approximation|assumption|neglect|uncertaint|future work|further (?:work|studies)|remains? (?:unclear|challenging)|cannot|not able)\b/i,
  ], 2);

  const hamiltonian = fieldResult(allSentences, [
    /\bHamiltonian\b/i, /\bspin[- ]boson\b/i, /\bHolstein\b/i, /\bFrenkel\b/i, /\bHubbard\b/i,
    /\bJaynes[- ]Cummings\b/i, /\bAnderson impurity\b/i, /\btight[- ]binding\b/i, /\bmodel (?:system|Hamiltonian)\b/i,
  ], 3);

  const functional = fieldResult(allSentences, [
    /\b(exchange[- ]correlation|XC) functional\b/i,
    /\b(density functional|DFT|Kohn[- ]Sham)\b/i,
    /\b(PBE0?|B3LYP|B97|M06|TPSS|SCAN|r2SCAN|BLYP|PW91|HSE|ωB97|wB97|CAM-B3LYP)\b/,
    /\b(functional|basis set|pseudopotential|PAW)\b/i,
  ], 3);

  const potential = fieldResult(allSentences, [
    /\bpotential energy surface|PES\b/i, /\bpotential\b/i, /\bforce field\b/i,
    /\b(machine learning|neural network|ML|GAP|DeePMD|ANI) potential\b/i, /\bReaxFF\b/i,
    /\bLennard[- ]Jones\b/i, /\bembedded[- ]atom\b/i, /\bMorse\b/i, /\bab initio\b/i,
  ], 3);

  const dynamics = fieldResult(allSentences, [
    /\b(dynamics|dynamic simulation|trajector|propagat|time evolution|equation of motion)\b/i,
    ...METHOD_TERMS.filter(([label]) => /动力学|轨迹|路径积分|主方程|HEOM|TST|RRKM|表面跳跃|波包/.test(label)).map(([, re]) => re),
  ], 3);

  const observables = fieldResult(allSentences, OBSERVABLE_TERMS.map(([, re]) => re), 3);
  const observableLabels = labelsFromTerms(full, OBSERVABLE_TERMS);
  const theoryLabels = labelsFromTerms(full, THEORY_TERMS);
  const software = SOFTWARE_TERMS.filter((s) => {
    if (s === 'Gaussian') return /\bGaussian\s*(?:09|16|03)\b|\bGaussian (?:program|package|software)\b/.test(full);
    if (s === 'MESS') return /\bMESS\b/.test(full);
    const re = new RegExp(`(?:^|[^A-Za-z0-9])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[^A-Za-z0-9]|$)`, 'i');
    return re.test(full);
  });
  const kinetics = detectKinetics(full, { title, journal });

  const frameworkText = theoryLabels.length
    ? `识别到的理论框架：${theoryLabels.join('、')}。${pickSentences(allSentences, [/quantum|classical|semiclassical|statistical|open system|nonadiabatic/i], 2).join(' ')}`
    : '';
  const softwareText = software.length ? `文中出现的软件/程序：${software.join('、')}。` : '';

  const evidence = {
    scientific_question: question.evidence,
    methods: methods.evidence,
    conclusions: conclusion.evidence,
    limitations: limitations.evidence,
    hamiltonian: hamiltonian.evidence,
    functional: functional.evidence,
    potential: potential.evidence,
    dynamics_methods: dynamics.evidence,
    observables: observables.evidence,
  };
  const confidence = {
    scientific_question: confidenceOf(question.hits),
    methods: confidenceOf(methods.hits),
    conclusions: confidenceOf(conclusion.hits),
    hamiltonian: confidenceOf(hamiltonian.hits),
    functional: confidenceOf(functional.hits),
    potential: confidenceOf(potential.hits),
    dynamics_methods: confidenceOf(dynamics.hits),
    observables: confidenceOf(observables.hits),
  };

  const intel = {
    scientific_question: question.text,
    methods: [methodLabels.length ? `方法线索：${methodLabels.join('、')}。` : '', methods.text].filter(Boolean).join(' '),
    conclusions: conclusion.text,
    limitations: limitations.text,
    hamiltonian: hamiltonian.text,
    functional: functional.text,
    potential: potential.text,
    dynamics_methods: [dynamics.text, softwareText].filter(Boolean).join(' '),
    observables: observableLabels.length ? `识别到的可观测量：${observableLabels.join('、')}。${observables.text}` : observables.text,
    theory_framework: frameworkText,
    approximations: limitations.text,
    software: software.join('、'),
    keywords: extractKeywords(full, title),
    evidence,
    confidence,
    method_labels: methodLabels,
    observable_labels: observableLabels,
    kinetics,
    generated_by: 'heuristic',
    generated_at: new Date().toISOString(),
    version: 1,
  };

  // Fill only empty fields from prior manual work, never overwrite user text.
  if (existing && typeof existing === 'object') {
    for (const [key, value] of Object.entries(existing)) {
      if (typeof value === 'string' && value.trim() && !String(intel[key] || '').trim()) intel[key] = value;
    }
  }
  return intel;
}

export function mergeIntel(current = {}, proposed = {}, source = 'manual') {
  const merged = { ...current };
  const stringFields = [
    'scientific_question', 'methods', 'conclusions', 'limitations', 'hamiltonian', 'functional',
    'potential', 'dynamics_methods', 'observables', 'theory_framework', 'approximations', 'software',
    'critical_assessment',
  ];
  for (const key of stringFields) {
    if (typeof proposed[key] === 'string' && proposed[key].trim()) merged[key] = proposed[key].trim();
  }
  if (Array.isArray(proposed.keywords)) merged.keywords = [...new Set(proposed.keywords.map(String).filter(Boolean))].slice(0, 20);
  if (proposed.evidence && typeof proposed.evidence === 'object') {
    merged.evidence = { ...(current.evidence || {}) };
    for (const [key, value] of Object.entries(proposed.evidence)) {
      if (Array.isArray(value)) merged.evidence[key] = value.map(String).filter(Boolean).slice(0, 4);
    }
  }
  if (proposed.confidence && typeof proposed.confidence === 'object') {
    merged.confidence = { ...(current.confidence || {}), ...proposed.confidence };
  }
  merged.generated_by = source;
  merged.generated_at = new Date().toISOString();
  merged.version = (current.version || 0) + 1;
  return merged;
}

export function inferCorresponding(text = '', authors = []) {
  if (!Array.isArray(authors) || !authors.length) return authors;
  const source = String(text || '');
  const marked = new Map();
  const mark = (author, confidence, reason, sourceType, email = '') => {
    if (!author?.name) return;
    const previous = marked.get(author.name);
    const rank = { low: 1, medium: 2, high: 3, confirmed: 4 };
    if (!previous || (rank[confidence] || 0) > (rank[previous.confidence] || 0)) {
      marked.set(author.name, { confidence, reason, sourceType, email });
    }
  };
  const alpha = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
  const nameInfo = (name) => {
    const parts = String(name || '').replace(/[.,]/g, ' ').split(/\s+/).filter(Boolean);
    const family = parts[parts.length - 1] || '';
    const given = parts.slice(0, -1);
    return {
      family,
      familyA: alpha(family),
      given,
      firstA: alpha(given[0] || ''),
      initialsA: given.map((p) => alpha(p)[0] || '').join(''),
    };
  };
  const emailScore = (author, localRaw) => {
    const local = alpha(localRaw);
    const info = nameInfo(author.name);
    if (!local || !info.familyA) return { score: 0, reason: '' };
    if (local === `${info.initialsA}${info.familyA}` || local === info.familyA) {
      return { score: 8, reason: `邮箱 ${localRaw}@… 与姓名匹配` };
    }
    if (info.familyA.length >= 4 && local.includes(info.familyA)) {
      return { score: 7, reason: `邮箱 ${localRaw}@… 含姓氏` };
    }
    if (info.firstA.length >= 4 && local === info.firstA) {
      return { score: 5, reason: `邮箱 ${localRaw}@… 与名匹配` };
    }
    if (info.firstA.length >= 4 && local.includes(info.firstA)) {
      return { score: 4, reason: `邮箱 ${localRaw}@… 含名` };
    }
    if (info.initialsA && info.familyA.length >= 3 && local.includes(`${info.initialsA}${info.familyA}`)) {
      return { score: 6, reason: `邮箱 ${localRaw}@… 含姓名缩写` };
    }
    return { score: 0, reason: '' };
  };

  // 1) Explicit corresponding-author phrases: pick the nearest author family name after the phrase.
  const triggers = /(corresponding author|author to whom correspondence|correspondence should be addressed|correspondence to|通讯作者)/gi;
  for (const match of source.matchAll(triggers)) {
    const idx = match.index;
    const after = source.slice(idx, idx + 320).toLowerCase();
    let best = null;
    let bestPos = Infinity;
    for (const a of authors) {
      const family = nameInfo(a.name).family.toLowerCase();
      if (family.length < 3) continue;
      const pos = after.indexOf(family);
      if (pos >= 0 && pos < bestPos) {
        best = a;
        bestPos = pos;
      }
    }
    if (best) mark(best, 'high', 'PDF 明确标注 corresponding author', 'explicit');
  }

  // 2) Email-based inference. Contact emails are the most reliable signal when the PDF has no prose marker.
  const emails = findEmails(source.slice(0, 40000)).filter((e) => {
    const local = e.split('@')[0].toLowerCase();
    return !/^(admin|info|office|journal|editor|support|help|contact|group|lab|team|noreply|no-reply)$/.test(local);
  });
  for (const email of emails) {
    const local = email.split('@')[0];
    let best = null;
    for (const author of authors) {
      const result = emailScore(author, local);
      if (!best || result.score > best.result.score) best = { author, result };
    }
    if (best?.result.score >= 4) {
      const emailPos = source.toLowerCase().indexOf(email);
      const context = emailPos >= 0 ? source.slice(Math.max(0, emailPos - 160), emailPos + email.length + 120) : '';
      const explicitMail = /(electronic mail|e-?mail|correspondence|corresponding author)/i.test(context);
      const confidence = best.result.score >= 7 || explicitMail ? 'high' : 'medium';
      mark(best.author, confidence, `${best.result.reason}${explicitMail ? '；上文为联系邮箱' : ''}`, 'email', email);
    }
  }

  // 3) Fallback: last author (senior author convention) or sole author, clearly marked low confidence.
  if (!marked.size) {
    if (authors.length === 1) {
      mark(authors[0], 'high', '唯一作者，默认为通讯作者', 'sole');
    } else {
      const last = authors[authors.length - 1];
      mark(last, 'low', '未找到明确标记或邮箱，按末位作者推断，请人工确认', 'heuristic');
    }
  }

  return authors.map((a) => {
    const hit = marked.get(a.name);
    if (a.corresponding && !hit) {
      return {
        ...a,
        corresponding: true,
        corresponding_source: a.corresponding_source || 'manual',
        corresponding_confidence: a.corresponding_confidence || 'confirmed',
        corresponding_reason: a.corresponding_reason || '已有通讯作者标记',
      };
    }
    if (!hit) {
      return {
        ...a,
        corresponding: false,
        corresponding_source: '',
        corresponding_confidence: '',
        corresponding_reason: '',
      };
    }
    return {
      ...a,
      corresponding: true,
      corresponding_source: hit.sourceType,
      corresponding_confidence: hit.confidence,
      corresponding_reason: hit.reason,
      email: a.email || hit.email || '',
    };
  });
}

function findEmails(text = '') {
  return [...new Set((String(text).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map((e) => e.toLowerCase()))];
}
