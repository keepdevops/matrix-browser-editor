'use strict';

const { Router } = require('express');
const { z } = require('zod');

const router = Router();
const cache = new Map();

const BodySchema = z.object({
  packages: z.array(z.string().min(1).max(100)).max(20),
});

async function resolvePackage(pkg) {
  if (cache.has(pkg)) return cache.get(pkg);

  try {
    // Try unpkg ESM bundle
    const esmUrl = `https://unpkg.com/${pkg}?module`;
    const res = await fetch(esmUrl, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(5000) });
    if (res.ok || res.status === 200) {
      const finalUrl = res.url;
      cache.set(pkg, finalUrl);
      return finalUrl;
    }
    // Fallback: jsdelivr ESM
    const jsdUrl = `https://cdn.jsdelivr.net/npm/${pkg}/+esm`;
    cache.set(pkg, jsdUrl);
    return jsdUrl;
  } catch (err) {
    console.error(`[cdnResolve] failed to resolve ${pkg}:`, err.message);
    const fallback = `https://cdn.jsdelivr.net/npm/${pkg}/+esm`;
    cache.set(pkg, fallback);
    return fallback;
  }
}

router.post('/', async (req, res) => {
  const result = BodySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Invalid request' });

  const { packages } = result.data;
  const resolved = {};

  await Promise.all(packages.map(async (pkg) => {
    resolved[pkg] = await resolvePackage(pkg);
  }));

  res.json({ resolved });
});

module.exports = router;
