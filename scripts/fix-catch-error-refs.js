#!/usr/bin/env node
/**
 * Fix TypeScript TS2304 errors where catch blocks use different variable names
 * Finds patterns where catch(err) or catch(e) is used but error is referenced
 */

import { promises as fs } from 'fs';
import path from 'path';
import glob from 'glob';

async function fixCatchErrorReferences(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  
  // Pattern 1: catch (err) but references 'error'
  const catchErrPattern = /catch\s*\(\s*err\s*\)\s*{([^}]+)}/g;
  content = content.replace(catchErrPattern, (match, block) => {
    if (block.includes('error')) {
      modified = true;
      // Replace references to 'error' with 'err'
      const fixedBlock = block.replace(/\berror\b/g, 'err');
      return `catch (err) {${fixedBlock}}`;
    }
    return match;
  });
  
  // Pattern 2: catch (e) but references 'error'
  const catchEPattern = /catch\s*\(\s*e\s*\)\s*{([^}]+)}/g;
  content = content.replace(catchEPattern, (match, block) => {
    if (block.includes('error')) {
      modified = true;
      // Replace references to 'error' with 'e'
      const fixedBlock = block.replace(/\berror\b/g, 'e');
      return `catch (e) {${fixedBlock}}`;
    }
    return match;
  });
  
  // Pattern 3: catch blocks with multiline content
  const multilineCatchPattern = /catch\s*\(\s*(err|e)\s*\)\s*{([\s\S]*?)(\n\s*})/g;
  content = content.replace(multilineCatchPattern, (match, varName, block, ending) => {
    if (varName !== 'error' && block.includes('error')) {
      modified = true;
      // Replace references to 'error' with the caught variable name
      const fixedBlock = block.replace(/\berror\b/g, varName);
      return `catch (${varName}) {${fixedBlock}${ending}`;
    }
    return match;
  });
  
  if (modified) {
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

async function main() {
  console.log('Fixing catch block error references...');
  
  const tsFiles = await glob.glob('src/**/*.ts', { 
    ignore: ['**/node_modules/**', '**/*.test.ts', '**/*.spec.ts']
  });
  
  let fixedCount = 0;
  let processedCount = 0;
  
  for (const file of tsFiles) {
    processedCount++;
    try {
      const wasFixed = await fixCatchErrorReferences(file);
      if (wasFixed) {
        fixedCount++;
        console.log(`  Fixed: ${file}`);
      }
    } catch (err) {
      console.error(`  Error processing ${file}:`, err.message);
    }
    
    // Progress indicator
    if (processedCount % 10 === 0) {
      process.stdout.write('.');
    }
  }
  
  console.log(`\n\nProcessed ${processedCount} files, fixed ${fixedCount} files`);
  console.log('\nRunning typecheck to see remaining errors...');
}

main().catch(console.error);