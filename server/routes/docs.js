'use strict';

const { Router } = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { z } = require('zod');

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BodySchema = z.object({
  code: z.string().min(1).max(100000),
  componentName: z.string().min(1).max(100),
});

router.post('/', async (req, res) => {
  const result = BodySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Invalid request' });

  const { code, componentName } = result.data;

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are a technical writer for React components. Return a JSON object with exactly two keys: "jsdoc" (a JSDoc comment block string, starting with /** and ending with */) and "readme" (a markdown string with a ## Usage section and prop table). No extra text.',
      messages: [{ role: 'user', content: `Document this component named "${componentName}":\n\n${code}` }],
    });

    let raw = msg.content[0]?.text?.trim() ?? '{}';
    // Strip markdown fences if present
    raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(raw);
    res.json({ jsdoc: parsed.jsdoc ?? '', readme: parsed.readme ?? '' });
  } catch (err) {
    console.error('[docs] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
