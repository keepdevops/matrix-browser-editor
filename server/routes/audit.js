'use strict';

const { Router } = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { z } = require('zod');

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';

const AuditRequestSchema = z.object({
  code: z.string().min(1).max(20000),
  screenshotImage: z.string().regex(/^[A-Za-z0-9+/=]+$/).optional(),
});

const SYSTEM = `You are a frontend accessibility and quality auditor. Analyze the React component code for WCAG 2.1 AA issues and common UX problems.

Return ONLY valid JSON — no markdown, no explanation:
{
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "element": "button | img | input | div | etc",
      "message": "short description of the problem",
      "fix": "concrete code change or attribute to add"
    }
  ]
}

Check for: missing alt text, missing aria-label on icon buttons, low-contrast color combinations, missing form labels, missing role attributes, keyboard-inaccessible interactive elements, missing focus styles, missing lang attribute, redundant ARIA, empty heading tags.`;

router.post('/', async (req, res) => {
  let body;
  try {
    body = AuditRequestSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const { code, screenshotImage } = body;

  const userContent = screenshotImage
    ? [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshotImage } },
        { type: 'text', text: `Audit this React component:\n\`\`\`tsx\n${code}\n\`\`\`` },
      ]
    : `Audit this React component:\n\`\`\`tsx\n${code}\n\`\`\``;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: 'user', content: userContent }],
    });

    const raw = message.content[0]?.text?.trim() ?? '{"issues":[]}';
    const cleaned = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error('[audit] parse error, raw:', raw.slice(0, 200));
      result = { issues: [] };
    }

    console.info(`[audit] ${result.issues?.length ?? 0} issues found`);
    res.json(result);
  } catch (err) {
    console.error('[audit] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
