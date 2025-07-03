#!/usr/bin/env node
/**
 * Fix err: property in object literals where it should be error:
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';

async function fixErrObjectProps(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Find lines with err: in object literals
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Pattern: err: something (in object literal context)
    if (line.includes('err:') && !line.includes('error:')) {
      // Check if this is in an object literal (not a type definition)
      const trimmedLine = line.trim();
      
      // Skip type definitions and interfaces
      if (trimmedLine.startsWith('interface') || 
          trimmedLine.startsWith('type ') ||
          trimmedLine.startsWith('export interface') ||
          trimmedLine.startsWith('export type')) {
        continue;
      }
      
      // Look for object literal context
      // Check previous lines for { or return { or = {
      let isObjectLiteral = false;
      for (let j = Math.max(0, i - 5); j < i; j++) {
        const prevLine = lines[j].trim();
        if (prevLine.endsWith('{') || prevLine.includes('return {') || 
            prevLine.includes('= {') || prevLine.includes('({')) {
          isObjectLiteral = true;
          break;
        }
      }
      
      if (isObjectLiteral || line.trim().startsWith('err:')) {
        // Replace err: with error:
        lines[i] = line.replace(/\berr:/g, 'error:');
        
        // Also fix "Unknown err" to "Unknown error"
        lines[i] = lines[i].replace(/'Unknown err'/g, "'Unknown error'");
        lines[i] = lines[i].replace(/"Unknown err"/g, '"Unknown error"');
        
        modified = true;
      }
    }
  }
  
  if (modified) {
    content = lines.join('\n');
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

async function findFilesWithErrObjectProps() {
  // Find all files that have 'err:' pattern
  const command = `grep -r "err:" src/ --include="*.ts" | grep -v "error:" | cut -d: -f1 | sort -u`;
  
  try {
    const output = execSync(command, { encoding: 'utf-8' }).trim();
    return output ? output.split('\n').filter(f => f && f.endsWith('.ts')) : [];
  } catch (err) {
    return [];
  }
}

async function main() {
  console.log('Finding and fixing err: object properties...');
  
  const files = await findFilesWithErrObjectProps();
  console.log(`Found ${files.length} files to check`);
  
  let fixedCount = 0;
  
  for (const filePath of files) {
    try {
      const wasFixed = await fixErrObjectProps(filePath);
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