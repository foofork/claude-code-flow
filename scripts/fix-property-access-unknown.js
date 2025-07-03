#!/usr/bin/env node
/**
 * Fix property access on unknown types in catch blocks
 */

import { promises as fs } from 'fs';
import path from 'path';

async function fixPropertyAccessUnknown(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Fix err.code access pattern
  const errCodePattern = /\berr\.code\b/g;
  content = content.replace(errCodePattern, (match) => {
    // Check if this is in a catch block context
    const beforeMatch = content.substring(0, content.indexOf(match));
    if (beforeMatch.includes('catch') && beforeMatch.lastIndexOf('catch') > beforeMatch.lastIndexOf('}')) {
      modified = true;
      return '(err as any).code';
    }
    return match;
  });
  
  // Fix data property access in error contexts
  content = content.replace(/\bcatch\s*\(\s*(\w+)\s*\)\s*\{([\s\S]*?)\n\s*\}/g, (match, varName, blockContent) => {
    if (blockContent.includes(`${varName}.`) && varName !== 'err' && varName !== 'error') {
      // This is accessing properties on caught exception with non-standard name
      let fixedBlock = blockContent;
      
      // Replace property access with type assertion
      const propAccessPattern = new RegExp(`\\b${varName}\\.(\\w+)`, 'g');
      fixedBlock = fixedBlock.replace(propAccessPattern, `(${varName} as any).$1`);
      
      if (fixedBlock !== blockContent) {
        modified = true;
        return `catch (${varName}) {${fixedBlock}\n  }`;
      }
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
  console.log('Fixing property access on unknown types...');
  
  // Specific files with these issues
  const files = [
    './src/cli/init/directory-structure.ts',
    './src/cli/simple-cli.ts',
    './src/cli/ui/fallback-handler.ts',
    './src/communication/message-bus.ts',
    './src/resources/resource-manager.ts'
  ];
  
  let fixedCount = 0;
  
  for (const filePath of files) {
    try {
      const wasFixed = await fixPropertyAccessUnknown(filePath);
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