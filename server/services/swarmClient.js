'use strict';

const http = require('http');

const SWARM_URL = process.env.SWARM_URL || 'http://localhost:3002';
const SWARM_STREAM_PATH = '/api/architect/stream';

/**
 * Stream a component generation request through the matrix swarm coordinator.
 * Translates swarm SSE events (token, agent_done, done, error) into the
 * editor's expected callbacks (onChunk, onDone, onError).
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
      let fullText = '';

      res.on('data', (chunk) => {
        buf += chunk.toString();
        const blocks = buf.split('\n\n');
        buf = blocks.pop(); // keep incomplete block

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

          if (eventName === 'token') {
            const delta = typeof data === 'object' ? (data.delta ?? '') : String(data);
            fullText += delta;
            onChunk(delta);
          } else if (eventName === 'done') {
            onDone(fullText);
            resolve();
          } else if (eventName === 'error') {
            const msg = typeof data === 'object' ? (data.error ?? JSON.stringify(data)) : String(data);
            console.error('[swarmClient] agent error:', msg);
            onError(msg);
            resolve();
          }
          // agent_done, selected, stage, synthesis_start — informational, skip
        }
      });

      res.on('end', () => {
        if (fullText) onDone(fullText);
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

  full += `Request: ${prompt}\n\n`;
  full += `Respond with ONLY a JSON object — no markdown, no explanation:\n`;
  full += `{"componentName":"PascalCase","language":"tsx","description":"...","dependencies":[],"code":"..."}`;

  return full;
}

module.exports = { streamComponent };
