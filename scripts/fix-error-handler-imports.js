#!/usr/bin/env node
/**
 * Fix incorrect error-handler import paths
 */

import { promises as fs } from 'fs';
import path from 'path';

async function getAllTypeScriptFiles(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.includes('node_modules')) {
      await getAllTypeScriptFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function calculateRelativePath(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  let relativePath = path.relative(fromDir, toFile);
  
  // Ensure it starts with ./ or ../
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  
  // Replace backslashes with forward slashes (for Windows)
  relativePath = relativePath.replace(/\\/g, '/');
  
  return relativePath;
}

async function fixErrorHandlerImports(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Find error-handler imports with incorrect paths
  const importRegex = /import\s*{\s*getErrorMessage\s*}\s*from\s*['"][^'"]+error-handler\.js['"]/g;
  const matches = content.match(importRegex);
  
  if (matches) {
    // Calculate correct relative path
    const errorHandlerPath = path.join(process.cwd(), 'src/utils/error-handler.js');
    const relativePath = calculateRelativePath(filePath, errorHandlerPath);
    
    // Replace all error-handler imports with correct path
    content = content.replace(importRegex, `import { getErrorMessage } from '${relativePath}'`);
    modified = true;
  }
  
  if (modified && content !== originalContent) {
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

async function main() {
  console.log('Fixing error-handler import paths...');
  
  const tsFiles = await getAllTypeScriptFiles('./src');
  
  console.log(`Found ${tsFiles.length} TypeScript files to process`);
  
  let fixedCount = 0;
  let processedCount = 0;
  const fixedFiles = [];
  
  for (const file of tsFiles) {
    processedCount++;
    try {
      const wasFixed = await fixErrorHandlerImports(file);
      if (wasFixed) {
        fixedCount++;
        fixedFiles.push(file);
        console.log(`  ✓ Fixed: ${file}`);
      }
    } catch (err) {
      console.error(`  ✗ Error processing ${file}:`, err.message);
    }
    
    // Progress indicator every 25 files
    if (processedCount % 25 === 0) {
      console.log(`  ... processed ${processedCount}/${tsFiles.length} files`);
    }
  }
  
  console.log(`\n✅ Processed ${processedCount} files, fixed ${fixedCount} files`);
  
  if (fixedFiles.length > 0) {
    console.log('\nFixed import paths in:');
    fixedFiles.forEach(f => console.log(`  - ${f}`));
  }
}

main().catch(console.error);