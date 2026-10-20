# Changelog

## v1.0.0 — 2026-10-20

Initial public release.

### Literature & PDF

- Local PDF archive with SHA-256 deduplication
- Inline PDF viewer, download, replace and delete
- PDF.js text extraction with two-column reading order
- DOI, email and metadata detection; optional Crossref enrichment

### Structured intelligence

- Scientific question, methods, conclusions, limitations and independent assessment
- Chemical-kinetics variables: Hamiltonian, functional, potential, dynamics method, observables
- Per-field evidence snippets and confidence labels
- Fully editable fields with version history
- Local rule-based re-extraction with incremental or overwrite modes

### WebTeX formulas

- Local WebTeX → SVG rendering
- Inline `$...$` and display `$$...$$` math
- Formula read mode and edit-mode previews
- Supported in intelligence fields, evidence, critiques and author profiles
- Cached SVG endpoint with command filtering

### Authors

- Corresponding-author inference from explicit markers, contact emails and last-author fallback
- Confidence and source labels; manual confirmation
- OpenAlex profile sync: topics, metrics and recent works
- Author homepage snapshot
- Author update timeline and cross-article aggregation

### Taxonomy & critique

- 8 built-in, editable research directions with optional child stacks
- Parent/child filtering, automatic leaf suggestions, CRUD
- Persistent critiques with stance, dimension, severity, evidence and status
- Critique aggregation by article and author

### Data

- SQLite storage, JSON export, local backups
- Portable `data/` directory
- Windows, WSL and Linux launch scripts

### Privacy

- Local-only by default
- No account system and no telemetry
- External requests only for explicit Crossref / OpenAlex / homepage actions
