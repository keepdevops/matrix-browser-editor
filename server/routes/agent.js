'use strict';

const { Router } = require('express');
const swarmClient    = require('../services/swarmClient');
const claudeClient   = require('../services/claudeClient');
const llamaCppClient = require('../services/llamaCppClient');
const { validate, PromptRequestSchema } = require('../services/codeValidator');

const router = Router();

function sendSSE(res, type, content) {
  res.write(`data: ${JSON.stringify({ type, content })}\n\n`);
}

// Returns ordered client array; first client is tried first, rest are fallbacks.
// Vision requests always route to Claude — local models can't handle images.
function resolveClientChain(preferredBackend, hasScreenshot) {
  if (hasScreenshot) return [claudeClient];

  const hasLlama = Boolean(process.env.LLAMA_CPP_URL);
  const hasSwarm = Boolean(process.env.SWARM_URL);

  if (preferredBackend === 'claude')   return [claudeClient];
  if (preferredBackend === 'llamacpp') return hasLlama ? [llamaCppClient] : [claudeClient];
  if (preferredBackend === 'swarm')    return hasSwarm  ? [swarmClient,    claudeClient] : [claudeClient];

  // 'auto': llama.cpp → swarm → Claude
  const chain = [];
  if (hasLlama) chain.push(llamaCppClient);
  if (hasSwarm) chain.push(swarmClient);
  chain.push(claudeClient);
  return chain;
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

  const { prompt, styleSystem, theme, templateCode, history, screenshotImage, preferredBackend } = validated;
  const streamArgs = { prompt, styleSystem, theme, templateCode, history, screenshotImage };
  const chain = resolveClientChain(preferredBackend, Boolean(screenshotImage));

  if (screenshotImage) console.info('[agent/stream] vision request — routing to claudeClient');

  const attempt = async (index) => {
    const client = chain[index];
    const isLast = index === chain.length - 1;
    await client.streamComponent({
      ...streamArgs,
      onChunk: (text) => sendSSE(res, 'delta', text),
      onDone:  (full) => { sendSSE(res, 'done', full); res.end(); },
      onError: (msg) => {
        if (!isLast) {
          console.warn(`[agent/stream] client[${index}] failed, trying fallback: ${msg}`);
          attempt(index + 1);
        } else {
          console.error('[agent/stream] all clients failed:', msg);
          sendSSE(res, 'error', msg);
          res.end();
        }
      },
    });
  };

  await attempt(0);
});

module.exports = router;
