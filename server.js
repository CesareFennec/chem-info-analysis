import express from 'express';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import multer from 'multer';
import { makeConfig } from './src/config.js';
import { openDatabase } from './src/db.js';
import { createApi } from './src/api.js';

export function createApp(overrides = {}) {
  const cfg = makeConfig(overrides);
  const db = openDatabase(`${cfg.dataDir}/library.db`);
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '8mb' }));
  app.use(express.urlencoded({ extended: false, limit: '2mb' }));
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use('/api', createApi(cfg, db));
  app.use(express.static(cfg.publicDir, { extensions: ['html'], maxAge: 0 }));
  app.use('/docs', express.static(path.join(cfg.root, 'docs'), { maxAge: 0 }));
  app.use('/examples', express.static(path.join(cfg.root, 'examples'), { maxAge: 0 }));
  app.use((req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API 不存在' });
    return res.status(404).send('Not found');
  });
  app.use((err, _req, res, _next) => {
    let status = err.status || 500;
    let message = err.message || '服务器错误';
    if (err instanceof multer.MulterError) {
      status = 400;
      message = err.code === 'LIMIT_FILE_SIZE' ? `PDF 超过大小限制（${Math.round(cfg.maxUploadBytes / 1024 / 1024)} MB）` : `上传失败：${err.message}`;
    }
    if (status >= 500) console.error('[error]', err);
    if (res.headersSent) return;
    res.status(status).json({ error: message });
  });
  return { app, db, cfg };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const { app, db, cfg } = createApp();
  const server = app.listen(cfg.port, cfg.host, () => {
    console.log('');
    console.log('  ChemIntelAnalysis · 文献情报汇总平台');
    console.log('  ────────────────────────────────────────');
    console.log(`  访问地址: http://${cfg.host}:${cfg.port}`);
    console.log(`  数据目录: ${cfg.dataDir}`);
    console.log(`  PDF 目录: ${cfg.pdfDir}`);
    console.log('  按 Ctrl+C 停止服务');
    console.log('');
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`端口 ${cfg.port} 已被占用。请设置 PORT=其他端口 后重启。`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });
  const shutdown = () => {
    server.close(() => {
      try {
        db.close();
      } catch {
        /* noop */
      }
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
