'use strict';

const { Router } = require('express');
const { validate, ConnectorRequestSchema } = require('../services/codeValidator');
const { scanProject } = require('../services/projectScanner');
const { exportComponent } = require('../connectors/exportConnector');
const { inject } = require('../connectors/injectConnector');
const { liveInject } = require('../connectors/liveConnector');

const router = Router();

router.post('/analyze', (req, res) => {
  let validated;
  try {
    validated = validate(ConnectorRequestSchema, req.body);
  } catch (err) {
    console.error('[connector/analyze] validation error:', err.message);
    return res.status(400).json({ error: err.message });
  }
  try {
    const result = scanProject(validated.projectPath);
    res.json({ ok: true, result });
  } catch (err) {
    console.error('[connector/analyze] scan error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/export', (req, res) => {
  let validated;
  try {
    validated = validate(ConnectorRequestSchema, req.body);
  } catch (err) {
    console.error('[connector/export] validation error:', err.message);
    return res.status(400).json({ error: err.message });
  }
  try {
    const result = exportComponent({
      componentCode: validated.componentCode,
      componentName: validated.componentName,
      language: 'tsx',
      outputDir: validated.projectPath,
    });
    res.json({ ok: true, result });
  } catch (err) {
    console.error('[connector/export] export error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/inject', (req, res) => {
  let validated;
  try {
    validated = validate(ConnectorRequestSchema, req.body);
  } catch (err) {
    console.error('[connector/inject] validation error:', err.message);
    return res.status(400).json({ error: err.message });
  }
  try {
    const result = inject({
      targetFile: validated.targetFile,
      componentCode: validated.componentCode,
      componentName: validated.componentName,
      language: 'tsx',
      outputDir: validated.projectPath,
    });
    res.json({ ok: true, result });
  } catch (err) {
    console.error('[connector/inject] inject error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/live', async (req, res) => {
  let validated;
  try {
    validated = validate(ConnectorRequestSchema, req.body);
  } catch (err) {
    console.error('[connector/live] validation error:', err.message);
    return res.status(400).json({ error: err.message });
  }
  try {
    const result = await liveInject({
      targetUrl: validated.projectPath,
      componentCode: validated.componentCode,
      componentName: validated.componentName,
    });
    res.json({ ok: true, result });
  } catch (err) {
    console.error('[connector/live] live inject error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
