'use strict';

const { Router } = require('express');
const swarmClient = require('../services/swarmClient');
const claudeClient = require('../services/claudeClient');
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

  const streamArgs = {
    prompt,
    styleSystem,
    theme,
    templateCode,
    history,
  };

  // Try swarm first when configured; fall back to direct Claude API on connection error
  const useSwarm = Boolean(process.env.SWARM_URL);

  const attempt = (client, isFallback) => client.streamComponent({
    ...streamArgs,
    onChunk: (text) => sendSSE(res, 'delta', text),
    onDone: (fullText) => {
      sendSSE(res, 'done', fullText);
      res.end();
    },
    onError: (message) => {
      if (useSwarm && !isFallback) {
        console.warn('[agent/stream] swarm unavailable, falling back to claudeClient:', message);
        attempt(claudeClient, true);
      } else {
        console.error('[agent/stream] error:', message);
        sendSSE(res, 'error', message);
        res.end();
      }
    },
  });

  await attempt(useSwarm ? swarmClient : claudeClient, false);
});

module.exports = router;
