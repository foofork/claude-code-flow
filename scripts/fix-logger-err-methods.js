#!/usr/bin/env node
/**
 * Fix TypeScript TS2339 errors for incorrect method names
 * Fixes logger.err -> logger.error and console.err -> console.error
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

async function fixMethodNames(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Fix logger.err -> logger.error
  if (content.includes('.err(')) {
    content = content.replace(/(\blogger\s*\.\s*)err\(/g, '$1error(');
    content = content.replace(/(\bthis\.logger\s*\.\s*)err\(/g, '$1error(');
    modified = true;
  }
  
  // Fix console.err -> console.error
  if (content.includes('console.err(')) {
    content = content.replace(/\bconsole\s*\.\s*err\(/g, 'console.error(');
    modified = true;
  }
  
  // Fix this.err -> this.error (in logger contexts)
  if (content.includes('this.err(')) {
    // Check if it's likely a logger context (contains logger methods)
    if (content.includes('this.info(') || content.includes('this.warn(') || content.includes('this.debug(')) {
      content = content.replace(/\bthis\s*\.\s*err\(/g, 'this.error(');
      modified = true;
    }
  }
  
  if (modified && content !== originalContent) {
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

async function main() {
  console.log('Fixing logger and console method names...');
  
  const tsFiles = await getAllTypeScriptFiles('./src');
  
  console.log(`Found ${tsFiles.length} TypeScript files to process`);
  
  let fixedCount = 0;
  let processedCount = 0;
  const fixedFiles = [];
  
  for (const file of tsFiles) {
    processedCount++;
    try {
      const wasFixed = await fixMethodNames(file);
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
    console.log('\nFixed method names in:');
    fixedFiles.forEach(f => console.log(`  - ${f}`));
  }
}

main().catch(console.error);