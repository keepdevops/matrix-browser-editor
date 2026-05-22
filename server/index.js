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
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.EDITOR_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/inline', inlineRouter);
app.use('/api/audit', auditRouter);
app.use('/api/share', shareRouter);
app.use('/api/zip', zipRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/review', reviewRouter);
app.use('/api/tests', testsRouter);
app.use('/api/docs', docsRouter);
app.use('/api/palette', paletteRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/publish', publishRouter);
app.use('/api/cdn-resolve', cdnResolveRouter);
app.use('/api/agent', agentRouter);
app.use('/api/preview', previewRouter);
app.use('/api/connector', connectorRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/status', (_req, res) => res.json({
  swarmEnabled: Boolean(process.env.SWARM_URL),
  swarmUrl: process.env.SWARM_URL || null,
}));

app.use((err, _req, res, _next) => {
  console.error('[server] unhandled error:', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});

module.exports = app;
