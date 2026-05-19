'use strict';

const fs = require('fs');
const path = require('path');

function buildImportStatement(componentName, importPath) {
  return `import { ${componentName} } from '${importPath}';\n`;
}

function injectIntoFile(targetContent, componentName, componentCode, importPath) {
  const lines = targetContent.split('\n');

  // Find last import line to insert after
  let lastImportLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) lastImportLine = i;
  }

  const importStatement = buildImportStatement(componentName, importPath);

  if (lastImportLine >= 0) {
    lines.splice(lastImportLine + 1, 0, importStatement.trim());
  } else {
    lines.unshift(importStatement.trim());
  }

  return lines.join('\n');
}

function inject({ targetFile, componentCode, componentName, language, outputDir }) {
  if (!targetFile || !componentCode || !componentName) {
    throw new Error('targetFile, componentCode, and componentName are required');
  }

  if (!fs.existsSync(targetFile)) {
    throw new Error(`Target file not found: ${targetFile}`);
  }

  const dir = outputDir || path.dirname(targetFile);
  const ext = language || 'tsx';
  const componentFilename = `${componentName}.${ext}`;
  const componentOutPath = path.join(dir, componentFilename);

  fs.writeFileSync(componentOutPath, componentCode, 'utf8');

  const relativeImportPath = './' + componentFilename.replace(/\.(tsx|ts)$/, '');
  const targetContent = fs.readFileSync(targetFile, 'utf8');
  const updatedContent = injectIntoFile(targetContent, componentName, componentCode, relativeImportPath);

  fs.writeFileSync(targetFile, updatedContent, 'utf8');

  return {
    componentPath: componentOutPath,
    importAdded: relativeImportPath,
    targetFile,
  };
}

module.exports = { inject };
