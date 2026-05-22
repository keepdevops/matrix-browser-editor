const express = require('express');
const JSZip = require('jszip');
const { z } = require('zod');

const router = express.Router();

const FileSchema = z.object({
  name: z.string().min(1),
  code: z.string(),
  language: z.enum(['tsx', 'jsx', 'ts', 'js']),
});

const BodySchema = z.object({
  files: z.array(FileSchema).min(1),
});

router.post('/', async (req, res) => {
  const result = BodySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid request', details: result.error.flatten() });
  }

  const { files } = result.data;
  const zip = new JSZip();
  const src = zip.folder('src');

  files.forEach(({ name, code, language }) => {
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Component';
    src.file(`${safeName}.${language}`, code);
  });

  const pkgJson = JSON.stringify({
    name: 'exported-components',
    version: '0.1.0',
    private: true,
    dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
    devDependencies: { typescript: '^5.0.0', '@types/react': '^18.0.0' },
  }, null, 2);
  zip.file('package.json', pkgJson);

  const tsconfig = JSON.stringify({
    compilerOptions: { target: 'ES2020', lib: ['ES2020', 'DOM'], jsx: 'react-jsx', strict: true, moduleResolution: 'bundler' },
    include: ['src'],
  }, null, 2);
  zip.file('tsconfig.json', tsconfig);

  try {
    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="components.zip"');
    res.send(buffer);
  } catch (err) {
    console.error('[zip] generation error:', err);
    res.status(500).json({ error: 'Failed to generate zip' });
  }
});

module.exports = router;
