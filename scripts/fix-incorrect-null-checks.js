#!/usr/bin/env node
/**
 * Fix incorrect null check patterns
 * Replace: if (!entry !== undefined && !entry !== null)
 * With: if (!entry)
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';

async function fixIncorrectNullChecks(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Pattern 1: Fix double negative null checks
  // !variable !== undefined && !variable !== null
  const incorrectPattern1 = /!\s*(\w+)\s*!==\s*undefined\s*&&\s*!\s*\1\s*!==\s*null/g;
  content = content.replace(incorrectPattern1, (match, varName) => {
    modified = true;
    return `!${varName}`;
  });
  
  // Pattern 2: Fix reverse order
  // !variable !== null && !variable !== undefined
  const incorrectPattern2 = /!\s*(\w+)\s*!==\s*null\s*&&\s*!\s*\1\s*!==\s*undefined/g;
  content = content.replace(incorrectPattern2, (match, varName) => {
    modified = true;
    return `!${varName}`;
  });
  
  // Pattern 3: Fix with extra parentheses
  // (!variable !== undefined) && (!variable !== null)
  const incorrectPattern3 = /\(!\s*(\w+)\s*!==\s*undefined\)\s*&&\s*\(!\s*\1\s*!==\s*null\)/g;
  content = content.replace(incorrectPattern3, (match, varName) => {
    modified = true;
    return `!${varName}`;
  });
  
  // Pattern 4: Fix single checks that are incorrect
  // !variable !== undefined or !variable !== null
  const incorrectPattern4 = /!\s*(\w+)\s*!==\s*(undefined|null)/g;
  content = content.replace(incorrectPattern4, (match, varName, type) => {
    // Only replace if it's not part of a larger expression
    const beforeMatch = content.substring(Math.max(0, content.indexOf(match) - 50), content.indexOf(match));
    const afterMatch = content.substring(content.indexOf(match) + match.length, Math.min(content.length, content.indexOf(match) + match.length + 50));
    
    // Check if it's a standalone condition
    if (!beforeMatch.includes('&&') && !beforeMatch.includes('||') && 
        !afterMatch.includes('&&') && !afterMatch.includes('||')) {
      modified = true;
      return `${varName} === ${type}`;
    }
    return match;
  });
  
  if (modified && content !== originalContent) {
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

async function findFilesWithIncorrectNullChecks() {
  // Search for the incorrect pattern in all TypeScript files
  const command = `grep -r "!.*!==.*undefined.*&&.*!.*!==.*null" src/ --include="*.ts" | cut -d: -f1 | sort -u`;
  const command2 = `grep -r "!.*!==.*null.*&&.*!.*!==.*undefined" src/ --include="*.ts" | cut -d: -f1 | sort -u`;
  
  try {
    const output1 = execSync(command, { encoding: 'utf-8' }).trim();
    const output2 = execSync(command2, { encoding: 'utf-8' }).trim();
    
    const files1 = output1 ? output1.split('\n') : [];
    const files2 = output2 ? output2.split('\n') : [];
    
    // Combine and deduplicate
    const allFiles = [...new Set([...files1, ...files2])].filter(f => f);
    return allFiles;
  } catch (err) {
    // grep returns exit code 1 if no matches found
    return [];
  }
}

async function main() {
  console.log('Finding and fixing incorrect null check patterns...');
  
  const files = await findFilesWithIncorrectNullChecks();
  console.log(`Found ${files.length} files with incorrect null checks`);
  
  let fixedCount = 0;
  
  for (const filePath of files) {
    try {
      const wasFixed = await fixIncorrectNullChecks(filePath);
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