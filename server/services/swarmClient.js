'use strict';

const http = require('http');

const SWARM_URL = process.env.SWARM_URL || 'http://localhost:3002';
const SWARM_STREAM_PATH = '/api/architect/stream';

/**
 * The swarm runs multiple agents (frontend, tester, etc.) and streams
 * their tokens mixed together. We only want the `frontend` agent's output,
 * then extract the first TSX/TypeScript code block from its markdown.
 */
function extractComponentFromMarkdown(text) {
  // Match tsx, ts, jsx, js, typescript, javascript code blocks
  const codeBlockRe = /```(?:tsx?|jsx?|typescript|javascript)[^\n]*\n([\s\S]*?)```/g;
  let best = null;
  let bestLen = 0;
  let match;
  while ((match = codeBlockRe.exec(text)) !== null) {
    const block = match[1].trim();
    // Must look like a React component (has JSX or React import)
    if (block.length > bestLen && (block.includes('React') || block.includes('return (') || block.includes('return('))) {
      best = block;
      bestLen = block.length;
    }
  }
  if (!best) return null;

  // Prefer export name, fall back to filename comment
  const exportMatch =
    best.match(/export\s+default\s+(?:function|class)\s+(\w+)/) ||
    best.match(/export\s+(?:function|class|const)\s+(\w+)/) ||
    best.match(/const\s+(\w+):\s*React\.FC/) ||
    best.match(/\/\/\s*(\w+)\.tsx?/);
  const componentName = exportMatch ? exportMatch[1] : 'GeneratedComponent';

  return {
    componentName,
    language: 'tsx',
    description: '',
    dependencies: [],
    code: best,
  };
}

/**
 * Stream a component generation request through the matrix swarm coordinator.
 * Filters for `frontend` agent tokens and extracts the TSX component from markdown.
 */
function streamComponent({ prompt, styleSystem, theme, templateCode, history, onChunk, onDone, onError }) {
  return new Promise((resolve) => {
    const enrichedPrompt = buildPrompt(prompt, styleSystem, theme, templateCode);

    const body = JSON.stringify({
      prompt: enrichedPrompt,
      temperature: 0.2,
      context_policy: 'recent',
    });

    const url = new URL(SWARM_STREAM_PATH, SWARM_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3002,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Accept: 'text/event-stream',
      },
    };

    const req = http.request(options, (res) => {
      if (res.statusCode !== 200) {
        const msg = `Swarm returned HTTP ${res.statusCode}`;
        console.error('[swarmClient]', msg);
        onError(msg);
        resolve();
        return;
      }

      let buf = '';
      // Track per-agent text; stream the frontend agent's tokens to the client
      const agentText = {};
      let selectedAgents = [];
      let settled = false;

      res.on('data', (chunk) => {
        buf += chunk.toString();
        const blocks = buf.split('\n\n');
        buf = blocks.pop();

        for (const block of blocks) {
          if (!block.trim()) continue;
          let eventName = 'message';
          let dataStr = '';

          for (const line of block.split('\n')) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim();
            else if (line.startsWith('data:')) dataStr = line.slice(5).trim();
          }

          if (!dataStr) continue;

          let data;
          try { data = JSON.parse(dataStr); } catch { data = dataStr; }

          if (eventName === 'selected') {
            selectedAgents = Array.isArray(data.agents) ? data.agents : [];
          } else if (eventName === 'token') {
            const agent = typeof data === 'object' ? (data.agent ?? 'unknown') : 'unknown';
            const delta = typeof data === 'object' ? (data.delta ?? '') : String(data);
            if (!agentText[agent]) agentText[agent] = '';
            agentText[agent] += delta;
            // Only stream the frontend agent's tokens for display
            if (agent === 'frontend' || agent === 'unknown') onChunk(delta);
          } else if (eventName === 'done') {
            if (settled) { resolve(); return; }
            settled = true;
            const allText = Object.values(agentText).join('\n');
            const component = extractComponentFromMarkdown(allText);
            if (!component) {
              console.warn('[swarmClient] no React code block found in swarm response, triggering fallback');
              onError('swarm response has no extractable React component');
              resolve();
              return;
            }
            onDone(JSON.stringify(component));
            resolve();
          } else if (eventName === 'error') {
            const msg = typeof data === 'object' ? (data.error ?? JSON.stringify(data)) : String(data);
            console.error('[swarmClient] agent error:', msg);
            onError(msg);
            resolve();
          }
        }
      });

      res.on('end', () => {
        if (!settled && Object.keys(agentText).length > 0) {
          settled = true;
          const allText = Object.values(agentText).join('\n');
          const component = extractComponentFromMarkdown(allText);
          if (component) {
            onDone(JSON.stringify(component));
          } else {
            console.warn('[swarmClient] end: no React block, triggering fallback');
            onError('swarm response has no extractable React component');
          }
        }
        resolve();
      });

      res.on('error', (err) => {
        console.error('[swarmClient] response error:', err.message);
        onError(err.message);
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('[swarmClient] request error:', err.message);
      onError(err.message);
      resolve();
    });

    req.write(body);
    req.end();
  });
}

function buildPrompt(prompt, styleSystem, theme, templateCode) {
  const styleMap = {
    tailwind: 'Tailwind CSS utility classes',
    shadcn: 'shadcn/ui components with Tailwind CSS',
    mui: 'Material UI v5',
    antd: 'Ant Design v5',
    chakra: 'Chakra UI v2',
    mantine: 'Mantine v7',
  };
  const style = styleMap[styleSystem] || 'Tailwind CSS';
  const themeNote = theme === 'dark' ? 'dark color scheme' : 'light color scheme';

  let full = `Generate a React component using ${style} with a ${themeNote}.\n\n`;

  if (templateCode) {
    full += `Start from this template:\n\`\`\`tsx\n${templateCode}\n\`\`\`\n\n`;
  }

  full += `Request: ${prompt}`;

  return full;
}

module.exports = { streamComponent };
