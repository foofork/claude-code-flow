#!/usr/bin/env node
/**
 * Fix remaining err property errors in object literals
 * Changes 'err' to 'error' in object property definitions
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';

async function fixErrProperties(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Pattern to fix object literals with err property
  // Match patterns like: { err: something }
  const objectErrPattern = /\{\s*((?:[^{}]|\{[^{}]*\})*?)err\s*:\s*([^,}]+)((?:[^{}]|\{[^{}]*\})*?)\}/g;
  
  content = content.replace(objectErrPattern, (match, before, value, after) => {
    // Skip if it's inside a type definition or interface
    const lineStart = content.lastIndexOf('\n', content.indexOf(match));
    const lineContent = content.substring(lineStart, content.indexOf(match));
    
    if (lineContent.includes('interface') || lineContent.includes('type ') || 
        lineContent.includes('extends') || lineContent.includes('implements')) {
      return match;
    }
    
    // Skip if it's a destructuring pattern
    if (before.includes(':') || after.includes(':')) {
      // More complex object, need to be careful
      // Only replace if it looks like an error object
      if (value.includes('getErrorMessage') || value.includes('Error') || 
          value.includes('message') || value.includes('stack')) {
        modified = true;
        return `{${before}error: ${value}${after}}`;
      }
    } else {
      // Simple object, likely safe to replace
      modified = true;
      return `{${before}error: ${value}${after}}`;
    }
    
    return match;
  });
  
  // Also fix simpler patterns in object returns
  content = content.replace(/return\s*\{\s*err\s*:\s*([^}]+)\s*\}/g, (match, value) => {
    modified = true;
    return `return { error: ${value} }`;
  });
  
  // Fix in object assignments
  content = content.replace(/=\s*\{\s*err\s*:\s*([^}]+)\s*\}/g, (match, value) => {
    modified = true;
    return `= { error: ${value} }`;
  });
  
  if (modified && content !== originalContent) {
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

async function findFilesWithErrProperties() {
  // Find files that have the TS2353 error about 'err' property
  const command = `npx tsc --noEmit 2>&1 | grep "TS2353.*'err'" | cut -d: -f1 | sort -u`;
  
  try {
    const output = execSync(command, { encoding: 'utf-8' }).trim();
    return output ? output.split('\n').filter(f => f && f.endsWith('.ts')) : [];
  } catch (err) {
    return [];
  }
}

async function main() {
  console.log('Finding and fixing remaining err property errors...');
  
  const files = await findFilesWithErrProperties();
  console.log(`Found ${files.length} files with err property errors`);
  
  let fixedCount = 0;
  
  for (const filePath of files) {
    try {
      const wasFixed = await fixErrProperties(filePath);
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