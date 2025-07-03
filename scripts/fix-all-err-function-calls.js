#!/usr/bin/env node
/**
 * Fix all instances where err() is called as a function in catch blocks
 * This should be error() (the logging function) not err() (the caught variable)
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';

async function fixErrFunctionCalls(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Pattern to find catch blocks with err variable and err() function calls
  // This will match single line and multi-line catch blocks
  const catchBlockPattern = /catch\s*\(\s*err\s*\)\s*\{[\s\S]*?\n\s*\}/g;
  
  content = content.replace(catchBlockPattern, (match) => {
    // Check if block contains err() function calls (not err. or err as)
    if (match.match(/\berr\s*\(/)) {
      modified = true;
      // Replace err( with error( when it's a function call
      return match.replace(/\berr\s*\(/g, 'error(');
    }
    return match;
  });
  
  // Also handle simpler patterns where we can detect err() calls after catch(err)
  const lines = content.split('\n');
  let inCatchBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we're entering a catch block with err
    if (line.includes('catch (err)') || line.includes('catch(err)')) {
      inCatchBlock = true;
    }
    
    // Check if we're in a catch block and see err() call
    if (inCatchBlock && line.match(/\berr\s*\(/)) {
      lines[i] = line.replace(/\berr\s*\(/g, 'error(');
      modified = true;
    }
    
    // Simple heuristic to detect end of catch block
    if (inCatchBlock && line.includes('}') && !line.includes('{')) {
      // Check if this closing brace is at the same or lower indentation
      const currentIndent = line.search(/\S/);
      if (i > 0) {
        const prevIndent = lines[i-1].search(/\S/);
        if (currentIndent <= prevIndent) {
          inCatchBlock = false;
        }
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
  // Find all TypeScript files that have catch (err) patterns
  const command = `grep -r "catch (err)" src/ --include="*.ts" | cut -d: -f1 | sort -u`;
  
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    return output.trim().split('\n').filter(f => f);
  } catch (err) {
    console.error('Error finding files:', err.message);
    return [];
  }
}

async function main() {
  console.log('Fixing err() function calls in catch blocks...');
  
  const files = await findFiles();
  console.log(`Found ${files.length} files with catch (err) blocks`);
  
  let fixedCount = 0;
  
  for (const filePath of files) {
    try {
      const wasFixed = await fixErrFunctionCalls(filePath);
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