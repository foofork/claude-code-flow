#!/usr/bin/env node
/**
 * Fix event handler parameter types
 */

import { promises as fs } from 'fs';

async function fixEventHandlerTypes(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Pattern to fix event handler callbacks with unknown data parameter
  // Match patterns like: .on('event', (data) => { ... data.property ... })
  const eventHandlerPattern = /\.on\(['"]([\w:]+)['"],\s*\((\w+)\)\s*=>\s*\{([^}]+)\}/g;
  
  content = content.replace(eventHandlerPattern, (match, eventName, paramName, blockContent) => {
    // Check if the parameter is accessed with property notation
    if (blockContent.includes(`${paramName}.`)) {
      // Add type annotation as any
      modified = true;
      return `.on('${eventName}', (${paramName}: any) => {${blockContent}}`;
    }
    return match;
  });
  
  // Also handle multi-line arrow functions
  const multiLinePattern = /\.on\(['"]([\w:]+)['"],\s*\((\w+)\)\s*=>\s*\{/g;
  
  content = content.replace(multiLinePattern, (match, eventName, paramName) => {
    // Look ahead to see if this parameter is used with property access
    const afterMatch = content.substring(content.indexOf(match) + match.length);
    const nextClosingBrace = afterMatch.indexOf('}');
    const blockContent = afterMatch.substring(0, nextClosingBrace);
    
    if (blockContent.includes(`${paramName}.`)) {
      modified = true;
      return `.on('${eventName}', (${paramName}: any) => {`;
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
  console.log('Fixing event handler parameter types...');
  
  const files = [
    './src/communication/message-bus.ts',
    './src/resources/resource-manager.ts'
  ];
  
  let fixedCount = 0;
  
  for (const filePath of files) {
    try {
      const wasFixed = await fixEventHandlerTypes(filePath);
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