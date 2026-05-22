'use strict';

const { Router } = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { z } = require('zod');

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BodySchema = z.object({
  code: z.string().min(1).max(100000),
  componentName: z.string().min(1).max(100),
  language: z.enum(['tsx', 'jsx', 'ts', 'js']).default('tsx'),
});

router.post('/', async (req, res) => {
  const result = BodySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Invalid request' });

  const { code, componentName, language } = result.data;
  const testLang = language === 'jsx' ? 'jsx' : 'tsx';

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: `You are a React testing expert. Generate a complete Vitest + React Testing Library test file. Return ONLY the code — no markdown fences, no explanation.`,
      messages: [{
        role: 'user',
        content: `Generate tests for this component named "${componentName}":\n\n${code}\n\nTest file language: ${testLang}`,
      }],
    });

    const testCode = (msg.content[0]?.text?.trim() ?? '')
      .replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
    res.json({ code: testCode, filename: `${componentName}.test.${testLang}` });
  } catch (err) {
    console.error('[tests] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
