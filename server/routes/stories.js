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
      max_tokens: 2048,
      system: 'You are a Storybook expert. Generate a complete Storybook 7+ CSF3 stories file for the given React component. Return ONLY the code — no markdown, no explanation.',
      messages: [{ role: 'user', content: `Generate stories for "${componentName}":\n\n${code}` }],
    });

    const storiesCode = (msg.content[0]?.text?.trim() ?? '')
      .replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
    res.json({ code: storiesCode, filename: `${componentName}.stories.tsx` });
  } catch (err) {
    console.error('[stories] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
