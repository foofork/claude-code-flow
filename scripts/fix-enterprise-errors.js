#!/usr/bin/env node
/**
 * Fix enterprise.ts error function calls
 * Replace err() calls with error() calls in catch blocks
 */

import { promises as fs } from 'fs';
import path from 'path';

async function fixEnterpriseErrors(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Pattern to find catch blocks with err variable and err() function calls
  const catchBlockPattern = /catch\s*\(\s*err\s*\)\s*{([^}]+)}/g;
  
  content = content.replace(catchBlockPattern, (match, blockContent) => {
    // Check if block contains err() function calls (not err. or err as)
    if (blockContent.match(/\berr\s*\(/)) {
      modified = true;
      // Replace err( with error( when it's a function call
      const fixedBlock = blockContent.replace(/\berr\s*\(/g, 'error(');
      return `catch (err) {${fixedBlock}}`;
    }
    return match;
  });
  
  // Also handle multiline catch blocks
  const multilineCatchPattern = /catch\s*\(\s*err\s*\)\s*{([\s\S]*?)(\n\s*})(?=\s*(catch|finally|$|\w))/g;
  
  content = content.replace(multilineCatchPattern, (match, blockContent, ending) => {
    if (blockContent.match(/\berr\s*\(/)) {
      modified = true;
      const fixedBlock = blockContent.replace(/\berr\s*\(/g, 'error(');
      return `catch (err) {${fixedBlock}${ending}`;
    }
    return match;
  });
  
  if (modified && content !== originalContent) {
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

async function main() {
  console.log('Fixing enterprise.ts error function calls...');
  
  const filePath = './src/cli/commands/enterprise.ts';
  
  try {
    const wasFixed = await fixEnterpriseErrors(filePath);
    if (wasFixed) {
      console.log(`  ✓ Fixed: ${filePath}`);
    } else {
      console.log(`  No changes needed in: ${filePath}`);
    }
  } catch (err) {
    console.error(`  ✗ Error processing ${filePath}:`, err.message);
  }
}

main().catch(console.error);