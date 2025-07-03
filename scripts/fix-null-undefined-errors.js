#!/usr/bin/env node
/**
 * Fix TypeScript null/undefined errors (TS18047 and TS18048)
 * Add null checks and optional chaining where needed
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';

async function fixNullUndefinedErrors(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Pattern 1: Fix object property access that might be null/undefined
  // Change: obj.property to obj?.property
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip import/export lines
    if (line.trim().startsWith('import') || line.trim().startsWith('export')) {
      continue;
    }
    
    // Pattern for property access that TypeScript complains about
    // Look for patterns like: variable.property where variable might be null
    const propertyAccessPattern = /\b(\w+)\.(\w+)\b/g;
    
    const matches = [...line.matchAll(propertyAccessPattern)];
    for (const match of matches) {
      const [fullMatch, varName, propName] = match;
      
      // Skip if already using optional chaining
      if (line.includes(`${varName}?.`)) continue;
      
      // Skip common safe patterns
      if (varName === 'console' || varName === 'process' || varName === 'Math' || 
          varName === 'JSON' || varName === 'Date' || varName === 'Array' ||
          varName === 'Object' || varName === 'String' || varName === 'Number') continue;
      
      // Skip 'this' references
      if (varName === 'this') continue;
      
      // Check if this line is flagged in TypeScript errors
      // For now, be conservative and only fix patterns that look like they could be null
      if (line.includes(`if (${varName}`) || line.includes(`if (!${varName}`) ||
          line.includes(`${varName} &&`) || line.includes(`${varName} ||`)) {
        // This suggests the variable is being checked, so might be null
        continue;
      }
      
      // Look for assignment patterns where the variable might be from a find/get operation
      const prevLines = lines.slice(Math.max(0, i - 5), i).join('\n');
      if (prevLines.includes(`.find(`) || prevLines.includes(`.get(`) || 
          prevLines.includes(`.getElementById(`) || prevLines.includes(`.querySelector(`)) {
        // Replace with optional chaining
        const newLine = line.replace(new RegExp(`\\b${varName}\\.${propName}\\b`), `${varName}?.${propName}`);
        if (newLine !== line) {
          lines[i] = newLine;
          modified = true;
        }
      }
    }
    
    // Pattern 2: Array access that might be undefined
    // Look for array[index] patterns
    const arrayAccessPattern = /\b(\w+)\[([^\]]+)\]/g;
    const arrayMatches = [...line.matchAll(arrayAccessPattern)];
    
    for (const match of arrayMatches) {
      const [fullMatch, arrayName, indexExpr] = match;
      
      // Skip if already has a null check
      if (line.includes(`${arrayName}?.[`)) continue;
      
      // Check if this looks like it could be null/undefined
      const prevLines = lines.slice(Math.max(0, i - 3), i).join('\n');
      if (prevLines.includes(`.find(`) || prevLines.includes(`.filter(`) || 
          prevLines.includes(`.map(`) || prevLines.includes('= []')) {
        // Might be safe, skip
        continue;
      }
      
      // If the array access is used in a way that suggests it might be undefined
      if (line.includes(`${fullMatch}.`) || line.includes(`${fullMatch}[`)) {
        const newLine = line.replace(new RegExp(`\\b${arrayName}\\[${indexExpr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`), `${arrayName}?.[${indexExpr}]`);
        if (newLine !== line) {
          lines[i] = newLine;
          modified = true;
        }
      }
    }
  }
  
  if (modified) {
    content = lines.join('\n');
  }
  
  // Pattern 3: Fix specific null check patterns
  // Add explicit null checks for common patterns
  content = content.replace(/const\s+(\w+)\s*=\s*([^;]+\.find\([^)]+\));/g, (match, varName, findExpr) => {
    // Check if there's already a null check after this
    const afterMatch = content.substring(content.indexOf(match) + match.length, content.indexOf(match) + match.length + 100);
    if (!afterMatch.includes(`if (${varName})`) && !afterMatch.includes(`if (!${varName})`)) {
      // No null check found, keep as is but flag for manual review
      return match;
    }
    return match;
  });
  
  if (modified && content !== originalContent) {
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

async function findFilesWithNullErrors() {
  // Get files with TS18047 and TS18048 errors
  const command1 = `npx tsc --noEmit 2>&1 | grep "TS18047" | cut -d: -f1 | sort -u`;
  const command2 = `npx tsc --noEmit 2>&1 | grep "TS18048" | cut -d: -f1 | sort -u`;
  
  try {
    const output1 = execSync(command1, { encoding: 'utf-8' }).trim();
    const output2 = execSync(command2, { encoding: 'utf-8' }).trim();
    
    const files1 = output1 ? output1.split('\n') : [];
    const files2 = output2 ? output2.split('\n') : [];
    
    // Combine and deduplicate
    const allFiles = [...new Set([...files1, ...files2])].filter(f => f && f.endsWith('.ts'));
    return allFiles;
  } catch (err) {
    return [];
  }
}

async function main() {
  console.log('Finding and fixing null/undefined errors...');
  
  const files = await findFilesWithNullErrors();
  console.log(`Found ${files.length} files with null/undefined errors`);
  
  let fixedCount = 0;
  
  for (const filePath of files) {
    try {
      const wasFixed = await fixNullUndefinedErrors(filePath);
      if (wasFixed) {
        console.log(`  ✓ Fixed: ${filePath}`);
        fixedCount++;
      }
    } catch (err) {
      console.error(`  ✗ Error processing ${filePath}:`, err.message);
    }
  }
  
  console.log(`\nFixed ${fixedCount} files`);
  
  // For files that couldn't be automatically fixed, show specific errors
  if (fixedCount < files.length) {
    console.log('\nRemaining files need manual fixes:');
    const remainingFiles = files.slice(0, 5); // Show first 5
    
    for (const file of remainingFiles) {
      console.log(`\n${file}:`);
      const errors = execSync(`npx tsc --noEmit 2>&1 | grep "${file}.*TS1804[78]" | head -3`, { encoding: 'utf-8' });
      console.log(errors);
    }
  }
}

main().catch(console.error);