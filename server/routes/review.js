'use strict';

const { Router } = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { z } = require('zod');

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BodySchema = z.object({
  code: z.string().min(1).max(100000),
  language: z.enum(['tsx', 'jsx', 'ts', 'js']).default('tsx'),
});

function sendSSE(res, type, content) {
  res.write(`data: ${JSON.stringify({ type, content })}\n\n`);
}

router.post('/', async (req, res) => {
  const result = BodySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Invalid request' });

  const { code } = result.data;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are a senior React engineer doing a code review. Review the component for: readability, accessibility (a11y), performance, and best practices. Be concise — use markdown bullet points grouped by category. Max 20 bullets total.',
      messages: [{ role: 'user', content: `Review this React component:\n\n\`\`\`tsx\n${code}\n\`\`\`` }],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        sendSSE(res, 'delta', chunk.delta.text);
      }
    }
    sendSSE(res, 'done', '');
    res.end();
  } catch (err) {
    console.error('[review] error:', err.message);
    sendSSE(res, 'error', err.message);
    res.end();
  }
});

module.exports = router;
