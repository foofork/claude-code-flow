#!/usr/bin/env node
/**
 * Fix TypeScript TS2304 errors where catch blocks use different variable names
 * Finds patterns where catch(err) or catch(e) is used but error is referenced
 */

import { promises as fs } from 'fs';
import path from 'path';

async function getAllTypeScriptFiles(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.includes('node_modules')) {
      await getAllTypeScriptFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function fixCatchErrorReferences(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // More comprehensive regex to handle catch blocks
  const catchPattern = /catch\s*\(\s*(err|e|ex|exception)\s*\)\s*{/g;
  let matches = [];
  let match;
  
  // Find all catch blocks
  while ((match = catchPattern.exec(content)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      varName: match[1]
    });
  }
  
  // Process from end to beginning to maintain indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const startIndex = m.index + m.length;
    
    // Find the matching closing brace
    let braceCount = 1;
    let endIndex = startIndex;
    
    while (braceCount > 0 && endIndex < content.length) {
      if (content[endIndex] === '{') braceCount++;
      else if (content[endIndex] === '}') braceCount--;
      endIndex++;
    }
    
    if (braceCount === 0) {
      const blockContent = content.substring(startIndex, endIndex - 1);
      
      // Check if block references 'error' when catch variable is different
      if (m.varName !== 'error' && blockContent.includes('error')) {
        // Replace 'error' with the actual catch variable
        const fixedBlock = blockContent.replace(/\berror\b/g, m.varName);
        
        if (fixedBlock !== blockContent) {
          content = content.substring(0, startIndex) + fixedBlock + content.substring(endIndex - 1);
          modified = true;
        }
      }
    }
  }
  
  if (modified && content !== originalContent) {
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

async function main() {
  console.log('Fixing catch block error references...');
  
  const tsFiles = await getAllTypeScriptFiles('./src');
  
  console.log(`Found ${tsFiles.length} TypeScript files to process`);
  
  let fixedCount = 0;
  let processedCount = 0;
  const fixedFiles = [];
  
  for (const file of tsFiles) {
    processedCount++;
    try {
      const wasFixed = await fixCatchErrorReferences(file);
      if (wasFixed) {
        fixedCount++;
        fixedFiles.push(file);
        console.log(`  ✓ Fixed: ${file}`);
      }
    } catch (err) {
      console.error(`  ✗ Error processing ${file}:`, err.message);
    }
    
    // Progress indicator every 25 files
    if (processedCount % 25 === 0) {
      console.log(`  ... processed ${processedCount}/${tsFiles.length} files`);
    }
  }
  
  console.log(`\n✅ Processed ${processedCount} files, fixed ${fixedCount} files`);
  
  if (fixedFiles.length > 0) {
    console.log('\nFixed files:');
    fixedFiles.forEach(f => console.log(`  - ${f}`));
  }
}

main().catch(console.error);