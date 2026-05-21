'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const agentRouter = require('./routes/agent');
const previewRouter = require('./routes/preview');
const connectorRouter = require('./routes/connector');
const inlineRouter = require('./routes/inline');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.EDITOR_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

app.use('/api/agent', agentRouter);
app.use('/api/agent/inline', inlineRouter);
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
