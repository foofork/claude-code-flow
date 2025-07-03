#!/usr/bin/env node
/**
 * Fix unknown type errors in src/cli/commands/index.ts
 * Add getErrorMessage import and use it in catch blocks
 */

import { promises as fs } from 'fs';
import path from 'path';

async function fixIndexUnknownErrors() {
  const filePath = './src/cli/commands/index.ts';
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Check if getErrorMessage is already imported
  if (!content.includes('getErrorMessage')) {
    // Find the last import statement
    const importRegex = /^import\s+.*?from\s+['"].*?['"];?\s*$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      
      // Add the getErrorMessage import after the last import
      const newImport = "\nimport { getErrorMessage } from '../../utils/error-handler.js';";
      content = content.slice(0, lastImportIndex + lastImport.length) + 
                newImport + 
                content.slice(lastImportIndex + lastImport.length);
      modified = true;
    }
  }
  
  // Fix patterns where error/err is used without getErrorMessage
  // Pattern 1: error.message or err.message
  const errorMessagePattern = /(\berror\.message\b|\berr\.message\b)(?!.*getErrorMessage)/g;
  content = content.replace(errorMessagePattern, (match) => {
    modified = true;
    const varName = match.includes('error.') ? 'error' : 'err';
    return `getErrorMessage(${varName})`;
  });
  
  // Pattern 2: Direct error usage in string templates or console logs
  const directErrorPattern = /(\$\{(error|err)\}|,\s*(error|err)\))/g;
  content = content.replace(directErrorPattern, (match, full, varName1, varName2) => {
    const varName = varName1 || varName2;
    if (match.includes('${')) {
      modified = true;
      return `\${getErrorMessage(${varName})}`;
    } else if (match.includes(',')) {
      modified = true;
      return `, getErrorMessage(${varName}))`;
    }
    return match;
  });
  
  // Pattern 3: error || 'fallback'
  const errorFallbackPattern = /\b(error|err)\s*\|\|\s*['"`]([^'"`]+)['"`]/g;
  content = content.replace(errorFallbackPattern, (match, varName, fallback) => {
    modified = true;
    return `getErrorMessage(${varName}, '${fallback}')`;
  });
  
  // Pattern 4: catch (error) or catch (err) blocks without proper typing
  const catchBlockPattern = /catch\s*\(\s*(error|err)\s*\)\s*\{/g;
  let catchMatches = [...content.matchAll(catchBlockPattern)];
  
  // Process catch blocks to ensure error usage is wrapped with getErrorMessage
  for (const match of catchMatches) {
    const startIndex = match.index + match[0].length;
    const varName = match[1];
    
    // Find the end of the catch block
    let braceCount = 1;
    let endIndex = startIndex;
    
    while (braceCount > 0 && endIndex < content.length) {
      if (content[endIndex] === '{') braceCount++;
      else if (content[endIndex] === '}') braceCount--;
      endIndex++;
    }
    
    // Extract catch block content
    const blockContent = content.substring(startIndex, endIndex - 1);
    
    // Check if the error is used without getErrorMessage
    if (blockContent.includes(varName) && !blockContent.includes('getErrorMessage')) {
      // This catch block needs fixing
      let fixedBlock = blockContent;
      
      // Fix console.error/log patterns
      const consolePattern = new RegExp(`(console\\.(error|log|warn)\\([^)]*)(${varName})([^)]*\\))`, 'g');
      fixedBlock = fixedBlock.replace(consolePattern, (match, prefix, method, var_, suffix) => {
        if (!match.includes('getErrorMessage')) {
          return `${prefix}getErrorMessage(${var_})${suffix}`;
        }
        return match;
      });
      
      // Fix error in template literals
      const templatePattern = new RegExp(`\\$\\{${varName}\\}`, 'g');
      fixedBlock = fixedBlock.replace(templatePattern, `\${getErrorMessage(${varName})}`);
      
      if (fixedBlock !== blockContent) {
        content = content.substring(0, startIndex) + fixedBlock + content.substring(endIndex - 1);
        modified = true;
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
  console.log('Fixing unknown type errors in src/cli/commands/index.ts...');
  
  try {
    const wasFixed = await fixIndexUnknownErrors();
    if (wasFixed) {
      console.log('  ✓ Fixed src/cli/commands/index.ts');
    } else {
      console.log('  No changes needed in src/cli/commands/index.ts');
    }
  } catch (err) {
    console.error('  ✗ Error processing file:', err.message);
  }
}

main().catch(console.error);