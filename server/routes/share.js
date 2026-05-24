'use strict';

const { Router } = require('express');
const { z } = require('zod');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const router = Router();

const STORE_PATH = path.join(__dirname, '..', 'shares.json');

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return new Map(Object.entries(JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'))));
    }
  } catch (err) {
    console.error('[share] failed to load store:', err.message);
  }
  return new Map();
}

function saveStore(shares) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(Object.fromEntries(shares)), 'utf8');
  } catch (err) {
    console.error('[share] failed to save store:', err.message);
  }
}

const shares = loadStore();

const ShareSchema = z.object({
  code: z.string().min(1).max(200_000),
  language: z.enum(['tsx', 'jsx', 'ts', 'js']).default('tsx'),
  componentName: z.string().max(100).default('Component'),
  styleSystem: z.string().max(40).default('tailwind'),
});

router.post('/', (req, res) => {
  const result = ShareSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0]?.message });
  }
  const id = crypto.randomBytes(5).toString('hex'); // 10-char hex
  shares.set(id, { ...result.data, createdAt: Date.now() });
  saveStore(shares);
  console.log('[share] created', id, result.data.componentName);
  res.json({ id, url: `/share/${id}` });
});

router.get('/:id', (req, res) => {
  const data = shares.get(req.params.id);
  if (!data) return res.status(404).json({ error: 'Share not found' });
  res.json(data);
});

module.exports = router;
