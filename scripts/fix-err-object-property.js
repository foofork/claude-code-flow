#!/usr/bin/env node
/**
 * Fix object property patterns where err: should be error:
 * Also fix err.stack access on unknown types
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';

async function fixErrObjectProperty(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Pattern 1: Fix { err: ... } to { error: ... } in object literals
  const objectErrPattern = /\{\s*err\s*:\s*getErrorMessage\(/g;
  content = content.replace(objectErrPattern, (match) => {
    modified = true;
    return '{ error: getErrorMessage(';
  });
  
  // Pattern 2: Fix err.stack access where err is from catch block
  // Look for patterns in catch blocks where err.stack is accessed
  const catchBlockPattern = /catch\s*\(\s*err\s*\)\s*\{([\s\S]*?)\n\s*\}/g;
  
  content = content.replace(catchBlockPattern, (match, blockContent) => {
    if (blockContent.includes('err.stack')) {
      modified = true;
      // Replace err.stack with (err instanceof Error ? err.stack : undefined)
      const fixedBlock = blockContent.replace(/\berr\.stack\b/g, '(err instanceof Error ? err.stack : undefined)');
      return `catch (err) {${fixedBlock}\n  }`;
    }
    return match;
  });
  
  // Pattern 3: Fix standalone err.stack references
  const lines = content.split('\n');
  let inCatchBlock = false;
  let catchVarName = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we're entering a catch block
    const catchMatch = line.match(/catch\s*\(\s*(\w+)\s*\)/);
    if (catchMatch) {
      inCatchBlock = true;
      catchVarName = catchMatch[1];
    }
    
    // If in catch block and see var.stack access
    if (inCatchBlock && catchVarName && line.includes(`${catchVarName}.stack`)) {
      const stackPattern = new RegExp(`\\b${catchVarName}\\.stack\\b`, 'g');
      lines[i] = line.replace(stackPattern, `(${catchVarName} instanceof Error ? ${catchVarName}.stack : undefined)`);
      modified = true;
    }
    
    // Simple heuristic to detect end of catch block
    if (inCatchBlock && line.includes('}') && !line.includes('{')) {
      const currentIndent = line.search(/\S/);
      if (currentIndent === 0 || (i > 0 && currentIndent <= lines[i-1].search(/\S/))) {
        inCatchBlock = false;
        catchVarName = '';
      }
    }
  }
  
  if (modified) {
    content = lines.join('\n');
  }
  
  if (modified && content !== originalContent) {
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

async function findFiles() {
  // Find files that have err: patterns or err.stack
  const command1 = `grep -r "{ err:" src/ --include="*.ts" | cut -d: -f1 | sort -u`;
  const command2 = `grep -r "err\\.stack" src/ --include="*.ts" | cut -d: -f1 | sort -u`;
  
  try {
    const output1 = execSync(command1, { encoding: 'utf-8' }).trim();
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
  console.log('Fixing err object property patterns...');
  
  const files = await findFiles();
  console.log(`Found ${files.length} files to check`);
  
  let fixedCount = 0;
  
  for (const filePath of files) {
    try {
      const wasFixed = await fixErrObjectProperty(filePath);
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