#!/usr/bin/env node

/**
 * Script to batch replace error handling patterns with the new error handler utility
 * This fixes TS18046 errors across the codebase
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files with TS18046 errors
const getFilesWithErrors = () => {
  const output = execSync('npm run typecheck 2>&1 || true', { encoding: 'utf8' });
  const lines = output.split('\n');
  const fileErrors = new Map();
  
  lines.forEach(line => {
    const match = line.match(/^(.*?\.ts)\((\d+),(\d+)\): error TS18046: '(.+?)' is of type 'unknown'/);
    if (match) {
      const [, file, line, col, variable] = match;
      if (!fileErrors.has(file)) {
        fileErrors.set(file, []);
      }
      fileErrors.get(file).push({ line: parseInt(line), col: parseInt(col), variable });
    }
  });
  
  return fileErrors;
};

// Common error variable patterns
const errorPatterns = [
  // Direct error.message access
  { 
    pattern: /(\b(?:error|err|e|ex|exception))\s*\.\s*message\b/g,
    replacement: (match, varName) => `getErrorMessage(${varName})`
  },
  // String interpolation with error
  {
    pattern: /\$\{(\b(?:error|err|e|ex|exception))\s*\.\s*message\}/g,
    replacement: (match, varName) => `\${getErrorMessage(${varName})}`
  },
  // Direct error usage in strings
  {
    pattern: /`([^`]*)\$\{(\b(?:error|err|e|ex|exception))\}([^`]*)`/g,
    replacement: (match, before, varName, after) => `\`${before}\${getErrorMessage(${varName})}${after}\``
  },
  // console.error with error.message
  {
    pattern: /console\.error\(([^,]+),\s*(\b(?:error|err|e|ex|exception))\s*\.\s*message\)/g,
    replacement: (match, msg, varName) => `console.error(${msg}, getErrorMessage(${varName}))`
  },
  // Error in catch blocks
  {
    pattern: /catch\s*\(\s*(\w+)\s*\)\s*\{([^}]*)\1\.message/g,
    replacement: (match, varName, body) => {
      const newBody = body.replace(new RegExp(`\\b${varName}\\.message\\b`, 'g'), `getErrorMessage(${varName})`);
      return `catch (${varName}) {${newBody}getErrorMessage(${varName})`;
    }
  }
];

const processFile = async (filePath, filesWithErrors) => {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    
    // Check if file already imports error handler
    const hasImport = content.includes('getErrorMessage') || content.includes('error-handler');
    
    // Apply patterns
    errorPatterns.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // Handle specific variable.message patterns from our error list
    const fileErrors = filesWithErrors.get(filePath);
    if (fileErrors) {
      fileErrors.forEach(({ variable }) => {
        // Escape special regex characters in variable name
        const escapedVar = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Create patterns for this specific variable
        const patterns = [
          new RegExp(`\\b${escapedVar}\\s*\\.\\s*message\\b`, 'g'),
          new RegExp(`\\$\\{${escapedVar}\\s*\\.\\s*message\\}`, 'g'),
          new RegExp(`\\$\\{${escapedVar}\\}`, 'g'),
          new RegExp(`String\\(${escapedVar}\\)`, 'g')
        ];
        
        patterns.forEach(pattern => {
          const newContent = content
            .replace(pattern, (match) => {
              if (match.includes('.message')) {
                return `getErrorMessage(${variable})`;
              } else if (match.includes('${')) {
                return `\${getErrorMessage(${variable})}`;
              } else if (match.includes('String(')) {
                return `getErrorMessage(${variable})`;
              }
              return match;
            });
          
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }
        });
      });
    }
    
    // Add import if modified and doesn't have it
    if (modified && !hasImport) {
      // Find the right place to add import (after other imports)
      const importMatch = content.match(/((?:^import.*\n)*)/m);
      if (importMatch) {
        const imports = importMatch[0];
        const afterImports = content.slice(imports.length);
        
        // Check if it's a relative import path
        const isInUtils = filePath.includes('/utils/');
        const importPath = isInUtils ? './error-handler.js' : 
          path.relative(path.dirname(filePath), path.join(process.cwd(), 'src/utils/error-handler.js'))
            .replace(/\\/g, '/')
            .replace(/^(?!\.)/, './');
        
        content = imports + `import { getErrorMessage } from '${importPath}';\n` + afterImports;
      }
    }
    
    if (modified) {
      await fs.writeFile(filePath, content);
      console.log(`✅ Fixed error handling in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
};

// Main execution
const main = async () => {
  console.log('🔍 Finding files with TS18046 errors...');
  const filesWithErrors = getFilesWithErrors();
  
  console.log(`📊 Found ${filesWithErrors.size} files with unknown type errors`);
  
  let processedCount = 0;
  let fixedCount = 0;
  
  for (const [filePath] of filesWithErrors) {
    processedCount++;
    console.log(`\n[${processedCount}/${filesWithErrors.size}] Processing ${filePath}...`);
    
    const fixed = await processFile(filePath, filesWithErrors);
    if (fixed) fixedCount++;
  }
  
  console.log(`\n✅ Summary: Fixed ${fixedCount} out of ${filesWithErrors.size} files`);
  
  // Run typecheck again to see improvement
  console.log('\n🔍 Running typecheck to verify improvements...');
  const beforeCount = Array.from(filesWithErrors.values()).reduce((sum, errors) => sum + errors.length, 0);
  
  try {
    execSync('npm run typecheck 2>&1', { encoding: 'utf8' });
    console.log('✅ No more TypeScript errors!');
  } catch (error) {
    const output = error.stdout || error.output?.join('') || '';
    const afterCount = (output.match(/TS18046/g) || []).length;
    console.log(`📊 TS18046 errors reduced from ${beforeCount} to ${afterCount}`);
  }
};

main().catch(console.error);