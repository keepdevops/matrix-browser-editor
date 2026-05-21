'use strict';

const { Router } = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { z } = require('zod');

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';

const InlineEditSchema = z.object({
  selectedCode: z.string().min(1).max(8000),
  instruction: z.string().min(1).max(500),
  context: z.string().max(20000).optional(),
});

router.post('/', async (req, res) => {
  let body;
  try {
    body = InlineEditSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const { selectedCode, instruction, context } = body;

  const prompt = context
    ? `Here is the full component for context:\n\`\`\`tsx\n${context}\n\`\`\`\n\nSelected code to edit:\n\`\`\`tsx\n${selectedCode}\n\`\`\`\n\nInstruction: ${instruction}\n\nReply with ONLY the replacement code — no explanation, no markdown fences, no imports unless they were in the selection.`
    : `Edit this code:\n\`\`\`tsx\n${selectedCode}\n\`\`\`\n\nInstruction: ${instruction}\n\nReply with ONLY the replacement code.`;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: 'You are a precise code editor. Follow the instruction exactly. Return only the replacement code with no explanation or markdown.',
      messages: [{ role: 'user', content: prompt }],
    });
    const replacement = message.content[0]?.text?.trim() ?? selectedCode;
    res.json({ replacement });
  } catch (err) {
    console.error('[inline] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
