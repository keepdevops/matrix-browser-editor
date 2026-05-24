'use strict';

const http = require('http');
const https = require('https');

const LLAMA_CPP_URL = process.env.LLAMA_CPP_URL || 'http://localhost:8080';
const LLAMA_CPP_MODEL = process.env.LLAMA_CPP_MODEL || 'local-model';

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
- Never use placeholder text like "TODO" or "coming soon"
- CRITICAL: The exported default component MUST render with zero props. Never require external props on the default export. Use hardcoded sample data inside the component or wrap sub-components with demo data. If you define a props interface, the default export must provide all values internally
CRITICAL FORMATTING RULE: Your entire response must be a single JSON object. Start your response with { and end with }. No preamble. No explanation. No markdown. No code fences.`;

async function checkHealth() {
  try {
    const url = new URL('/health', LLAMA_CPP_URL);
    const mod = url.protocol === 'https:' ? https : http;
    return await new Promise((resolve) => {
      const req = mod.get(url.toString(), (res) => {
        resolve(res.statusCode === 200);
        res.resume();
      });
      req.setTimeout(2000, () => { req.destroy(); resolve(false); });
      req.on('error', () => resolve(false));
    });
  } catch {
    return false;
  }
}

function buildMessages(prompt, styleSystem, theme, templateCode, history) {
  const styleInstruction = STYLE_SYSTEM_INSTRUCTIONS[styleSystem] || STYLE_SYSTEM_INSTRUCTIONS.tailwind;
  const themeInstruction = theme === 'dark' ? 'Use a dark color scheme.' : 'Use a light color scheme.';
  const systemContent = `${SYSTEM_PROMPT}\n\nStyle system: ${styleInstruction}\nTheme: ${themeInstruction}`;

  const messages = [{ role: 'system', content: systemContent }];

  for (const msg of (history || []).slice(-6)) {
    messages.push({ role: msg.role, content: msg.content });
  }

  const userText = templateCode
    ? `Start from this template and modify it as needed:\n\`\`\`tsx\n${templateCode}\n\`\`\`\n\nRequest: ${prompt}`
    : prompt;

  messages.push({ role: 'user', content: userText });
  return messages;
}

function streamComponent({ prompt, styleSystem, theme, templateCode, history, onChunk, onDone, onError }) {
  let settled = false;
  const settle = (fn) => { if (!settled) { settled = true; fn(); } };

  const messages = buildMessages(prompt, styleSystem, theme, templateCode, history);
  const body = JSON.stringify({
    model: LLAMA_CPP_MODEL,
    messages,
    stream: true,
    temperature: 0.3,
    max_tokens: 4096,
  });

  let url;
  try {
    url = new URL('/v1/chat/completions', LLAMA_CPP_URL);
  } catch (err) {
    settle(() => onError(`Invalid LLAMA_CPP_URL: ${err.message}`));
    return Promise.resolve();
  }

  const mod = url.protocol === 'https:' ? https : http;

  return new Promise((resolve) => {
    const req = mod.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      if (res.statusCode !== 200) {
        settle(() => onError(`llama.cpp returned HTTP ${res.statusCode}`));
        res.resume();
        resolve();
        return;
      }

      let fullText = '';
      let buf = '';

      res.on('data', (chunk) => {
        buf += chunk.toString();
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') {
            settle(() => onDone(fullText));
            resolve();
            return;
          }
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              onChunk(delta);
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      });

      res.on('end', () => {
        settle(() => onDone(fullText));
        resolve();
      });

      res.on('error', (err) => {
        console.error('[llamaCppClient] response error:', err.message);
        settle(() => onError(err.message));
        resolve();
      });
    });

    req.setTimeout(60000, () => {
      req.destroy();
      settle(() => onError('llama.cpp request timed out'));
      resolve();
    });

    req.on('error', (err) => {
      console.error('[llamaCppClient] request error:', err.message);
      settle(() => onError(err.message));
      resolve();
    });

    req.write(body);
    req.end();
  });
}

module.exports = { streamComponent, checkHealth };
