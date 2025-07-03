#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixTypeScriptErrors() {
  const fixes = [
    // Fix array to string assignments
    {
      file: 'src/cli/commands/enterprise.ts',
      find: /selectedFeatures: features\.filter\(f => f\)\.split\(','\)/g,
      replace: 'selectedFeatures: features.filter(f => f)'
    },
    // Fix missing properties in swarm-new.ts
    {
      file: 'src/cli/commands/swarm-new.ts',
      find: /agentProfile: \{[^}]*\}/g,
      replace: (match) => {
        if (!match.includes('defaultAutonomy')) {
          return match.replace('}', ', defaultAutonomy: 0.7, maxConcurrentTasks: 5, taskTimeout: 300000, memoryLimit: 512 * 1024 * 1024, supportedTaskTypes: ["research", "development", "analysis", "testing", "optimization"], requiredCapabilities: [], preferredModel: "claude-3", costLimit: 1000}');
        }
        return match;
      }
    },
    // Fix DeploymentEnvironment type issues
    {
      file: 'src/cli/commands/enterprise.ts',
      find: /provider: selectedProvider as any,/g,
      replace: 'provider: selectedProvider as "aws" | "gcp" | "azure" | "kubernetes" | "docker" | "custom",'
    },
    // Fix undefined checks
    {
      file: 'src/cli/commands/agent.ts',
      find: /value === '' \|\| value === undefined/g,
      replace: 'value === \'\' || value === undefined || value === null'
    },
    // Fix import paths
    {
      file: 'src/cli/ui/index.ts',
      find: /from '\.\/components\/(.+)\.js'/g,
      replace: 'from \'./components/$1.js\''
    },
    // Fix type assertions
    {
      file: 'src/cli/commands/index.ts',
      find: /resolve\(\{ success: true \}\)/g,
      replace: 'resolve({ success: true, data: undefined })'
    },
    // Fix task ID comparisons
    {
      file: 'src/agents/agent-manager.ts',
      find: /task\.id === taskId/g,
      replace: 'task.id.id === taskId'
    },
    // Fix agent ID comparisons
    {
      file: 'src/agents/agent-manager.ts',
      find: /agent\.id === agentId/g,
      replace: 'agent.id.id === agentId'
    },
    // Fix memory store calls
    {
      file: 'src/agents/agent-manager.ts',
      find: /this\.memory\.store\(/g,
      replace: 'await this.memory.store('
    },
    // Fix EventType literals
    {
      file: 'src/agents/agent-manager.ts',
      find: /'agent\.(\w+)'/g,
      replace: (match, p1) => {
        const eventMap = {
          'spawned': 'agent.created',
          'started': 'agent.started',
          'stopped': 'agent.stopped',
          'removed': 'agent.removed',
          'assigned': 'task.assigned',
          'completed': 'task.completed',
          'failed': 'task.failed'
        };
        return `'${eventMap[p1] || 'agent.updated'}'`;
      }
    }
  ];

  for (const fix of fixes) {
    try {
      const filePath = path.join('/workspaces/claude-code-flow', fix.file);
      let content = await fs.readFile(filePath, 'utf8');
      const originalContent = content;
      
      if (typeof fix.replace === 'function') {
        content = content.replace(fix.find, fix.replace);
      } else {
        content = content.replace(fix.find, fix.replace);
      }
      
      if (content !== originalContent) {
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`✅ Fixed ${fix.file}`);
      }
    } catch (err) {
      console.error(`❌ Error fixing ${fix.file}:`, err.message);
    }
  }

  // Fix common patterns across all TypeScript files
  const tsFiles = await findTypeScriptFiles('/workspaces/claude-code-flow/src');
  
  for (const file of tsFiles) {
    try {
      let content = await fs.readFile(file, 'utf8');
      const originalContent = content;
      
      // Fix error handling patterns
      content = content.replace(/catch \(error\) \{([^}]+)\}/g, (match, body) => {
        if (!body.includes('getErrorMessage')) {
          return match.replace('error', 'err').replace(/err\.message/g, 'getErrorMessage(err)');
        }
        return match;
      });
      
      // Fix undefined checks
      content = content.replace(/if \((!?)(\w+)\)/g, (match, negation, variable) => {
        if (content.includes(`${variable}: unknown`) || content.includes(`${variable}: any`)) {
          return `if (${negation}${variable} !== undefined && ${negation}${variable} !== null)`;
        }
        return match;
      });
      
      if (content !== originalContent) {
        await fs.writeFile(file, content, 'utf8');
        console.log(`✅ Fixed patterns in ${path.relative('/workspaces/claude-code-flow', file)}`);
      }
    } catch (err) {
      // Ignore errors for individual files
    }
  }
}

async function findTypeScriptFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files.push(...await findTypeScriptFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.ts') && !item.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

fixTypeScriptErrors().then(() => {
  console.log('✅ TypeScript error fixing complete');
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});