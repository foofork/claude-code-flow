#!/usr/bin/env node
/**
 * Fix property assignment where 'err' should be 'error'
 * Fixes pattern: object.err = ... to object.error = ...
 */

import { promises as fs } from 'fs';
import path from 'path';

async function fixErrProperty(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Pattern to find property assignments to .err
  // This will match patterns like:
  // status.err = 
  // this.err =
  // result.err =
  const errPropertyPattern = /(\w+)\.err\s*=\s*/g;
  
  content = content.replace(errPropertyPattern, (match, objectName) => {
    // Don't replace if it's a method call like logger.err
    if (objectName === 'logger' || objectName === 'console') {
      return match;
    }
    modified = true;
    return `${objectName}.error = `;
  });
  
  if (modified && content !== originalContent) {
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

async function findFiles() {
  const { execSync } = await import('child_process');
  
  // Find files that have .err property assignments
  const command = `grep -r "\\.err\\s*=" src/ --include="*.ts" --include="*.js" | cut -d: -f1 | sort -u`;
  
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    return output.trim().split('\n').filter(f => f);
  } catch (err) {
    console.error('Error finding files:', err.message);
    return [];
  }
}

async function main() {
  console.log('Fixing .err property assignments...');
  
  const files = await findFiles();
  console.log(`Found ${files.length} files with .err property assignments`);
  
  let fixedCount = 0;
  
  for (const filePath of files) {
    try {
      const wasFixed = await fixErrProperty(filePath);
      if (wasFixed) {
        console.log(`  ✓ Fixed: ${filePath}`);
        fixedCount++;
      }
    } catch (err) {
      console.error(`  ✗ Error processing ${filePath}:`, err.message);
    }
  }
  
  console.log(`\nFixed ${fixedCount} files`);
}

main().catch(console.error);