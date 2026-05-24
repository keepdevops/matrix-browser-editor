'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const agentRouter = require('./routes/agent');
const previewRouter = require('./routes/preview');
const connectorRouter = require('./routes/connector');
const inlineRouter = require('./routes/inline');
const auditRouter = require('./routes/audit');
const shareRouter = require('./routes/share');
const zipRouter = require('./routes/zip');
const uploadRouter = require('./routes/upload');
const reviewRouter = require('./routes/review');
const testsRouter = require('./routes/tests');
const docsRouter = require('./routes/docs');
const paletteRouter = require('./routes/palette');
const storiesRouter = require('./routes/stories');
const publishRouter = require('./routes/publish');
const cdnResolveRouter = require('./routes/cdnResolve');
const { rateLimit } = require('./middleware/rateLimit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.EDITOR_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// AI routes — 20 req/min per IP
const aiLimit = rateLimit(20, 60_000);
// Heavy generation routes — 10 req/min per IP
const genLimit = rateLimit(10, 60_000);

app.use('/api/inline', aiLimit, inlineRouter);
app.use('/api/audit', aiLimit, auditRouter);
app.use('/api/share', shareRouter);
app.use('/api/zip', zipRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/review', genLimit, reviewRouter);
app.use('/api/tests', genLimit, testsRouter);
app.use('/api/docs', genLimit, docsRouter);
app.use('/api/palette', genLimit, paletteRouter);
app.use('/api/stories', genLimit, storiesRouter);
app.use('/api/publish', publishRouter);
app.use('/api/cdn-resolve', cdnResolveRouter);
app.use('/api/agent', aiLimit, agentRouter);
app.use('/api/preview', previewRouter);
app.use('/api/connector', connectorRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/status', async (_req, res) => {
  const llamaOnline = process.env.LLAMA_CPP_URL
    ? await require('./services/llamaCppClient').checkHealth()
    : false;
  res.json({
    swarmEnabled:    Boolean(process.env.SWARM_URL),
    swarmUrl:        process.env.SWARM_URL || null,
    llamaCppEnabled: Boolean(process.env.LLAMA_CPP_URL),
    llamaCppUrl:     process.env.LLAMA_CPP_URL || null,
    llamaCppOnline:  llamaOnline,
  });
});

app.use((err, _req, res, _next) => {
  console.error('[server] unhandled error:', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});

module.exports = app;
