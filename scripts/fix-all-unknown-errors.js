#!/usr/bin/env node
/**
 * Fix all remaining unknown type errors by ensuring getErrorMessage is used
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';

async function ensureGetErrorMessageImport(content, filePath) {
  // Check if getErrorMessage is already imported
  if (!content.includes('getErrorMessage')) {
    // Find the right import path based on file location
    const depth = filePath.split('/').filter(p => p && p !== '.').length - 2; // -2 for src/...
    const importPath = depth > 0 ? '../'.repeat(depth) + 'utils/error-handler.js' : './utils/error-handler.js';
    
    // Find the last import statement
    const importRegex = /^import\s+.*?from\s+['"].*?['"];?\s*$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      
      // Add the getErrorMessage import after the last import
      const newImport = `\nimport { getErrorMessage } from '${importPath}';`;
      content = content.slice(0, lastImportIndex + lastImport.length) + 
                newImport + 
                content.slice(lastImportIndex + lastImport.length);
    } else {
      // No imports found, add at the beginning after any comments
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // Skip initial comments and empty lines
      while (insertIndex < lines.length && 
             (lines[insertIndex].trim() === '' || 
              lines[insertIndex].trim().startsWith('//') ||
              lines[insertIndex].trim().startsWith('/*') ||
              lines[insertIndex].trim().startsWith('*'))) {
        insertIndex++;
      }
      
      lines.splice(insertIndex, 0, `import { getErrorMessage } from '${importPath}';`);
      content = lines.join('\n');
    }
  }
  
  return content;
}

async function fixUnknownErrors(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // Ensure getErrorMessage is imported
  const contentWithImport = await ensureGetErrorMessageImport(content, filePath);
  if (contentWithImport !== content) {
    content = contentWithImport;
    modified = true;
  }
  
  // Fix all catch blocks to properly handle unknown errors
  const lines = content.split('\n');
  let inCatchBlock = false;
  let catchVarName = '';
  let braceDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we're entering a catch block
    const catchMatch = line.match(/catch\s*\(\s*(\w+)\s*\)/);
    if (catchMatch) {
      inCatchBlock = true;
      catchVarName = catchMatch[1];
      braceDepth = 0;
    }
    
    if (inCatchBlock) {
      // Track brace depth
      for (const char of line) {
        if (char === '{') braceDepth++;
        else if (char === '}') braceDepth--;
      }
      
      // Fix various error usage patterns
      if (catchVarName) {
        // Pattern 1: Direct usage in template literals
        const templatePattern = new RegExp(`\\$\\{${catchVarName}\\}`, 'g');
        if (line.match(templatePattern)) {
          lines[i] = line.replace(templatePattern, `\${getErrorMessage(${catchVarName})}`);
          modified = true;
        }
        
        // Pattern 2: .message access
        const messagePattern = new RegExp(`\\b${catchVarName}\\.message\\b`, 'g');
        if (line.match(messagePattern) && !line.includes('getErrorMessage')) {
          lines[i] = line.replace(messagePattern, `getErrorMessage(${catchVarName})`);
          modified = true;
        }
        
        // Pattern 3: Direct usage in console methods
        const consolePattern = new RegExp(`(console\\.(log|error|warn)\\([^)]*)(\\b${catchVarName}\\b)([^)]*\\))`, 'g');
        if (line.match(consolePattern) && !line.includes('getErrorMessage')) {
          lines[i] = line.replace(consolePattern, (match, prefix, method, varName, suffix) => {
            return `${prefix}getErrorMessage(${varName})${suffix}`;
          });
          modified = true;
        }
        
        // Pattern 4: String concatenation
        const concatPattern = new RegExp(`(['"\`].*?)\\s*\\+\\s*${catchVarName}\\b`, 'g');
        if (line.match(concatPattern)) {
          lines[i] = line.replace(concatPattern, `$1 + getErrorMessage(${catchVarName})`);
          modified = true;
        }
        
        // Pattern 5: Error in function arguments (but not error() function calls)
        const argPattern = new RegExp(`([a-zA-Z_$][a-zA-Z0-9_$]*\\s*\\([^)]*)(\\b${catchVarName}\\b)([^)]*\\))`, 'g');
        if (line.match(argPattern) && !line.includes('getErrorMessage') && !line.match(new RegExp(`\\b${catchVarName}\\s*\\(`))) {
          lines[i] = line.replace(argPattern, (match, prefix, varName, suffix) => {
            // Skip if it's the error function itself
            if (prefix.trim().endsWith('error')) return match;
            return `${prefix}getErrorMessage(${varName})${suffix}`;
          });
          modified = true;
        }
      }
      
      // Exit catch block when braces balance out
      if (braceDepth === 0 && line.includes('}')) {
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

async function findFilesWithUnknownErrors() {
  // Get all files that have TS18046 errors
  const command = `npx tsc --noEmit 2>&1 | grep "TS18046" | cut -d: -f1 | sort -u`;
  
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    return output.trim().split('\n').filter(f => f && f.endsWith('.ts'));
  } catch (err) {
    return [];
  }
}

async function main() {
  console.log('Finding and fixing remaining unknown type errors...');
  
  const files = await findFilesWithUnknownErrors();
  console.log(`Found ${files.length} files with unknown type errors`);
  
  let fixedCount = 0;
  
  for (const filePath of files) {
    try {
      const wasFixed = await fixUnknownErrors(filePath);
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