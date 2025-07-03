#!/usr/bin/env node
/**
 * Fix remaining TypeScript TS18046 unknown type errors
 * Ensures proper use of getErrorMessage for error handling
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

async function fixUnknownErrors(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  // First ensure getErrorMessage is imported if needed
  const hasGetErrorMessage = content.includes('getErrorMessage');
  const hasErrorUsage = content.match(/\berr\b(?!or)/g);
  const needsImport = !hasGetErrorMessage && hasErrorUsage;
  
  if (needsImport && content.includes('catch')) {
    // Add import if not present
    if (!content.includes("import { getErrorMessage }")) {
      // Find the last import line
      const importMatch = content.match(/(import[^;]+from\s+['"][^'"]+['"];?\s*\n)(?!import)/);
      if (importMatch) {
        const lastImport = importMatch.index + importMatch[0].length;
        content = content.slice(0, lastImport) + 
          "import { getErrorMessage } from '../utils/error-handler.js';\n" + 
          content.slice(lastImport);
        modified = true;
      }
    }
  }
  
  // Pattern 1: Direct err.message usage
  content = content.replace(/\bconsole\.error\([^,]+,\s*err\s*\)/g, (match) => {
    modified = true;
    return match.replace(/err\s*\)/, 'getErrorMessage(err))');
  });
  
  // Pattern 2: err.message access
  content = content.replace(/\berr\.message\b/g, (match) => {
    modified = true;
    return 'getErrorMessage(err)';
  });
  
  // Pattern 3: Direct err usage in template literals
  content = content.replace(/\${err}/g, (match) => {
    modified = true;
    return '${getErrorMessage(err)}';
  });
  
  // Pattern 4: String(err)
  content = content.replace(/String\(err\)/g, (match) => {
    modified = true;
    return 'getErrorMessage(err)';
  });
  
  // Pattern 5: err as Error casting followed by .message
  content = content.replace(/\(err\s+as\s+Error\)\.message/g, (match) => {
    modified = true;
    return 'getErrorMessage(err)';
  });
  
  // Pattern 6: Direct error logging
  content = content.replace(/logger\.(error|warn|info)\(([^,]+),\s*{\s*err\s*}\)/g, (match, method, message) => {
    modified = true;
    return `logger.${method}(${message}, { error: getErrorMessage(err) })`;
  });
  
  // Pattern 7: throw err without message
  content = content.replace(/throw err;/g, (match) => {
    // Check if it's in a catch block
    const beforeMatch = content.substring(Math.max(0, content.indexOf(match) - 100), content.indexOf(match));
    if (beforeMatch.includes('catch')) {
      modified = true;
      return 'throw new Error(getErrorMessage(err));';
    }
    return match;
  });
  
  if (modified && content !== originalContent) {
    // Fix import path based on file location
    const depth = filePath.split(path.sep).filter(p => p === 'src' || p.includes('src/')).length;
    const importPath = depth > 1 ? '../'.repeat(depth - 1) + 'utils/error-handler.js' : './utils/error-handler.js';
    content = content.replace(/from '\.\.\/utils\/error-handler\.js'/, `from '${importPath}'`);
    
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

async function main() {
  console.log('Fixing remaining unknown type errors...');
  
  const tsFiles = await getAllTypeScriptFiles('./src');
  
  console.log(`Found ${tsFiles.length} TypeScript files to process`);
  
  let fixedCount = 0;
  let processedCount = 0;
  const fixedFiles = [];
  
  for (const file of tsFiles) {
    processedCount++;
    try {
      const wasFixed = await fixUnknownErrors(file);
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
    console.log('\nFixed unknown type errors in:');
    fixedFiles.forEach(f => console.log(`  - ${f}`));
  }
}

main().catch(console.error);