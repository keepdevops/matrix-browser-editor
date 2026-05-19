'use strict';

const { Router } = require('express');
const { screenshotComponent } = require('../services/screenshotter');
const { z } = require('zod');

const ScreenshotSchema = z.object({
  code: z.string().min(1),
  styleSystem: z.string().default('tailwind'),
  theme: z.enum(['light', 'dark']).default('light'),
  width: z.number().int().min(320).max(2560).default(800),
  height: z.number().int().min(240).max(1440).default(600),
});

const router = Router();

const CDN_MAP = {
  tailwind: [
    '<script src="https://cdn.tailwindcss.com"></script>',
  ],
  shadcn: [
    '<script src="https://cdn.tailwindcss.com"></script>',
  ],
  mui: [
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />',
    '<script crossorigin src="https://unpkg.com/@mui/material@5/umd/material-ui.production.min.js"></script>',
  ],
  antd: [
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/5.12.8/reset.min.css" />',
    '<script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/antd/5.12.8/antd.min.js"></script>',
  ],
  chakra: [
    '<script crossorigin src="https://unpkg.com/@chakra-ui/react@2/dist/chakra-ui-react.umd.js"></script>',
  ],
  mantine: [
    '<link rel="stylesheet" href="https://unpkg.com/@mantine/core@7/styles.css" />',
    '<script crossorigin src="https://unpkg.com/@mantine/core@7/dist/mantine-core.umd.cjs"></script>',
  ],
};

const DARK_BODY_STYLE = 'background:#0f172a;color:#f1f5f9;';
const LIGHT_BODY_STYLE = 'background:#f8fafc;color:#0f172a;';

router.get('/shell', (req, res) => {
  const styleSystem = req.query.styleSystem || 'tailwind';
  const theme = req.query.theme || 'light';

  const cdnTags = (CDN_MAP[styleSystem] || CDN_MAP.tailwind).join('\n    ');
  const bodyStyle = theme === 'dark' ? DARK_BODY_STYLE : LIGHT_BODY_STYLE;
  const darkClass = theme === 'dark' ? 'dark' : '';

  const html = `<!DOCTYPE html>
<html lang="en" class="${darkClass}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  ${cdnTags}
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 1rem; font-family: sans-serif; ${bodyStyle} }
  </style>
</head>
<body>
  <div id="root"></div>
  <script id="preview-script" type="text/babel">
    // Component code injected here
  </script>
  <script>
    window.__renderComponent = function(code) {
      const script = document.getElementById('preview-script');
      script.textContent = code + '\\nReactDOM.createRoot(document.getElementById("root")).render(React.createElement(window.__PreviewComponent || (() => React.createElement("div", null, "No component exported")), null));';
      Babel.transformScriptTags();
    };
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

router.post('/screenshot', async (req, res) => {
  let params;
  try {
    params = ScreenshotSchema.parse(req.body);
  } catch (err) {
    console.error('[preview/screenshot] validation error:', err.message);
    return res.status(400).json({ error: err.message });
  }
  try {
    const base64 = await screenshotComponent(params);
    res.json({ ok: true, image: `data:image/png;base64,${base64}` });
  } catch (err) {
    console.error('[preview/screenshot] playwright error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
