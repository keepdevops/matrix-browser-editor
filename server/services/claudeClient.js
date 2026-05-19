'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';

const STYLE_SYSTEM_INSTRUCTIONS = {
  tailwind: 'Use Tailwind CSS utility classes for all styling. No inline styles or CSS modules.',
  shadcn: 'Use shadcn/ui components (Button, Card, Input, etc.) with Tailwind CSS. Import from "@/components/ui/*".',
  mui: 'Use Material UI v5 components. Import from "@mui/material". Use sx prop for overrides.',
  antd: 'Use Ant Design v5 components. Import from "antd". Follow Ant Design patterns.',
  chakra: 'Use Chakra UI v2 components. Import from "@chakra-ui/react". Use Chakra prop styling.',
  mantine: 'Use Mantine v7 components. Import from "@mantine/core". Follow Mantine patterns.',
};

const SYSTEM_PROMPT = `You are an expert React component generator. When asked to build a UI component or panel, you MUST respond with ONLY a JSON object — no markdown, no explanation.

The JSON must have exactly these fields:
{
  "componentName": "PascalCaseName",
  "language": "tsx",
  "description": "brief description",
  "dependencies": ["list", "of", "npm", "packages"],
  "code": "the full component code as a string"
}

Rules:
- The component must be a named export AND a default export
- Include all imports at the top
- Make it fully functional (real state, real handlers)
- Make it visually beautiful and production-ready
- Use the specified style system consistently
- Never use placeholder text like "TODO" or "coming soon"`;

function buildMessages(prompt, styleSystem, theme, templateCode, history) {
  const styleInstruction = STYLE_SYSTEM_INSTRUCTIONS[styleSystem] || STYLE_SYSTEM_INSTRUCTIONS.tailwind;
  const themeInstruction = theme === 'dark' ? 'Use a dark color scheme.' : 'Use a light color scheme.';

  const systemWithStyle = `${SYSTEM_PROMPT}\n\nStyle system: ${styleInstruction}\nTheme: ${themeInstruction}`;

  const messages = [];

  if (history.length > 0) {
    for (const msg of history.slice(-6)) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  let userContent = prompt;
  if (templateCode) {
    userContent = `Start from this template and modify it as needed:\n\`\`\`tsx\n${templateCode}\n\`\`\`\n\nRequest: ${prompt}`;
  }

  messages.push({ role: 'user', content: userContent });

  return { systemWithStyle, messages };
}

async function streamComponent({ prompt, styleSystem, theme, templateCode, history, onChunk, onDone, onError }) {
  const { systemWithStyle, messages } = buildMessages(prompt, styleSystem, theme, templateCode, history);

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: systemWithStyle,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    });

    let fullText = '';

    stream.on('text', (text) => {
      fullText += text;
      onChunk(text);
    });

    stream.on('error', (err) => {
      console.error('[claudeClient] stream error:', err.message);
      onError(err.message);
    });

    await stream.finalMessage();
    onDone(fullText);
  } catch (err) {
    console.error('[claudeClient] request failed:', err.message);
    onError(err.message);
  }
}

module.exports = { streamComponent };
