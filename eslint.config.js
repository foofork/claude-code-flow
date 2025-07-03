import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  // Base JavaScript configuration
  js.configs.recommended,
  
  // TypeScript files configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      // TypeScript recommended rules (relaxed for initial setup)
      ...typescript.configs.recommended.rules,
      
      // Claude Code compatibility rules (relaxed)
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      
      // General rules
      'no-console': 'off', // Allow console logs for CLI tool
      'no-undef': 'off', // TypeScript handles this
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },
  
  // JavaScript files configuration (Node.js)
  {
    files: ['**/*.js', '**/*.mjs'],
    ignores: ['**/ui/**/*.js', '**/console/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js globals
        global: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      // Basic JavaScript rules
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },

  // Browser/UI JavaScript files (module-based)
  {
    files: ['**/ui/console/js/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module', // Console files use ES6 modules
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        WebSocket: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        performance: 'readonly',
        alert: 'readonly',
        confirm: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-control-regex': 'off', // Terminal escape sequences
      'no-undef': 'warn'
    }
  },

  // Other UI JavaScript files (script-based)
  {
    files: ['**/ui/**/*.js'],
    ignores: ['**/ui/console/js/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script', // Traditional script files
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        WebSocket: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-control-regex': 'off', // Terminal escape sequences
      'no-undef': 'warn'
    }
  },
  
  // Test files configuration
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', '**/tests/**/*'],
    languageOptions: {
      globals: {
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off'
    }
  },
  
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'bin/**',
      'coverage/**',
      '*.min.js',
      'benchmark/**/*.py',
      'examples/**/node_modules/**',
      'memory/node_modules/**',
      '.git/**',
      'claude-flow-*.tgz'
    ]
  }
];