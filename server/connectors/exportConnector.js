'use strict';

const fs = require('fs');
const path = require('path');

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '').replace(/^[0-9]/, '_');
}

function buildExportFile(componentCode, componentName, language) {
  const name = sanitizeName(componentName || 'GeneratedComponent');
  const hasDefaultExport = /export\s+default/.test(componentCode);
  const code = hasDefaultExport
    ? componentCode
    : `${componentCode}\n\nexport default ${name};`;
  return { code, filename: `${name}.${language || 'tsx'}` };
}

function exportComponent({ componentCode, componentName, language, outputDir }) {
  if (!componentCode) throw new Error('componentCode is required');

  const { code, filename } = buildExportFile(componentCode, componentName, language);

  if (outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outPath = path.join(outputDir, filename);
    fs.writeFileSync(outPath, code, 'utf8');
    return { filename, path: outPath, code };
  }

  return { filename, code };
}

module.exports = { exportComponent };
