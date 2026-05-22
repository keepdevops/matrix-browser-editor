'use strict';

const { Router } = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { z } = require('zod');

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BodySchema = z.object({
  description: z.string().min(1).max(200),
});

router.post('/', async (req, res) => {
  const result = BodySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Invalid request' });

  const { description } = result.data;

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: 'You are a UI color palette designer. Return ONLY a JSON object with exactly these keys: "color-primary", "color-secondary", "color-background", "color-surface", "color-text", "color-border". Values must be hex colors (#rrggbb). No extra text or markdown.',
      messages: [{ role: 'user', content: `Generate a cohesive color palette for: "${description}"` }],
    });

    let raw = msg.content[0]?.text?.trim() ?? '{}';
    raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const colors = JSON.parse(raw);
    res.json({ colors });
  } catch (err) {
    console.error('[palette] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
