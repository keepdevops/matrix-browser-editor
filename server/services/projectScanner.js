'use strict';

const fs = require('fs');
const path = require('path');

const STYLE_SYSTEM_MARKERS = {
  tailwind: ['tailwindcss', 'tailwind.config'],
  shadcn: ['@shadcn/ui', 'components/ui'],
  mui: ['@mui/material', '@mui/icons-material'],
  antd: ['antd', 'ant-design'],
  chakra: ['@chakra-ui/react'],
  mantine: ['@mantine/core'],
};

function detectStyleSystem(packageJson) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    for (const [system, markers] of Object.entries(STYLE_SYSTEM_MARKERS)) {
      if (markers.some((m) => deps.some((d) => d.includes(m)))) {
        return system;
      }
    }
  } catch (err) {
    console.error('[projectScanner] package.json read error:', err.message);
  }
  return 'tailwind';
}

function findReactFiles(dir, maxDepth = 3, depth = 0) {
  if (depth > maxDepth) return [];
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...findReactFiles(full, maxDepth, depth + 1));
      } else if (/\.(tsx|jsx|ts|js)$/.test(entry.name)) {
        results.push(full);
      }
    }
  } catch (err) {
    console.error('[projectScanner] readdir error:', err.message);
  }
  return results;
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error('[projectScanner] file read error:', err.message);
    return null;
  }
}

function scanProject(projectPath) {
  if (!fs.existsSync(projectPath)) {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }

  const packageJsonPath = path.join(projectPath, 'package.json');
  const styleSystem = detectStyleSystem(packageJsonPath);
  const srcDir = fs.existsSync(path.join(projectPath, 'src'))
    ? path.join(projectPath, 'src')
    : projectPath;

  const files = findReactFiles(srcDir);
  const components = files.map((f) => ({
    path: f,
    relativePath: path.relative(projectPath, f),
    content: readFileSafe(f),
  })).filter((f) => f.content !== null);

  const summary = {
    styleSystem,
    totalFiles: components.length,
    paths: components.map((c) => c.relativePath),
    sampleCode: components.slice(0, 3).map((c) => ({
      path: c.relativePath,
      preview: c.content.slice(0, 500),
    })),
  };

  return summary;
}

module.exports = { scanProject, detectStyleSystem, findReactFiles };
