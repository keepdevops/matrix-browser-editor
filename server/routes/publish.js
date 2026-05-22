'use strict';

const { Router } = require('express');
const { z } = require('zod');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const router = Router();

const BodySchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('0.1.0'),
  description: z.string().max(200).default(''),
  code: z.string().min(1).max(100000),
  language: z.enum(['tsx', 'jsx', 'ts', 'js']).default('tsx'),
});

router.post('/', async (req, res) => {
  const npmToken = process.env.NPM_TOKEN;
  if (!npmToken) return res.status(503).json({ error: 'NPM_TOKEN not configured on server' });

  const result = BodySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Invalid request', details: result.error.flatten() });

  const { name, version, description, code, language } = result.data;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-publish-'));

  try {
    fs.mkdirSync(path.join(tmpDir, 'src'));
    fs.writeFileSync(path.join(tmpDir, 'src', `index.${language}`), code);

    const pkg = {
      name, version, description,
      main: `src/index.${language}`,
      peerDependencies: { react: '>=17.0.0', 'react-dom': '>=17.0.0' },
      license: 'MIT',
    };
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(pkg, null, 2));
    fs.writeFileSync(path.join(tmpDir, '.npmrc'), `//registry.npmjs.org/:_authToken=${npmToken}`);

    execSync('npm publish --access public', { cwd: tmpDir, timeout: 30000 });

    res.json({ ok: true, name, version, url: `https://www.npmjs.com/package/${name}` });
  } catch (err) {
    console.error('[publish] error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

module.exports = router;
