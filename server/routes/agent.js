'use strict';

const { Router } = require('express');
const { streamComponent } = require('../services/swarmClient');
const { validate, PromptRequestSchema } = require('../services/codeValidator');

const router = Router();

function sendSSE(res, type, content) {
  res.write(`data: ${JSON.stringify({ type, content })}\n\n`);
}

router.post('/stream', async (req, res) => {
  let validated;
  try {
    validated = validate(PromptRequestSchema, req.body);
  } catch (err) {
    console.error('[agent/stream] validation error:', err.message);
    return res.status(400).json({ error: err.message });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const { prompt, styleSystem, theme, templateCode, history } = validated;

  await streamComponent({
    prompt,
    styleSystem,
    theme,
    templateCode,
    history,
    onChunk: (text) => sendSSE(res, 'delta', text),
    onDone: (fullText) => {
      sendSSE(res, 'done', fullText);
      res.end();
    },
    onError: (message) => {
      console.error('[agent/stream] claude error:', message);
      sendSSE(res, 'error', message);
      res.end();
    },
  });
});

module.exports = router;
