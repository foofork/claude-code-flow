#!/usr/bin/env node
/**
 * Claude-Flow Migration Tool
 * Helps existing projects migrate to optimized prompts and configurations
 */

import { Command } from 'commander';
import { MigrationRunner } from './migration-runner';
import { MigrationAnalyzer } from './migration-analyzer';
import { MigrationStrategy } from './types';
import { logger } from './logger';
import chalk from 'chalk';
import * as path from 'node:path';

import { getErrorMessage } from '../utils/error-handler.js';
const program = new Command();

program
  .name('claude-flow-migrate')
  .description('Migrate existing claude-flow projects to optimized prompts')
  .version('1.0.0');

program
  .command('analyze [path]')
  .description('Analyze existing project for migration readiness')
  .option('-d, --detailed', 'Show detailed analysis')
  .option('-o, --output <file>', 'Output analysis to file')
  .action(async (projectPath = '.', options) => {
    try {
      const analyzer = new MigrationAnalyzer();
      const analysis = await analyzer.analyze(path.resolve(projectPath));
      
      if (options.output) {
        await analyzer.saveAnalysis(analysis, options.output);
        logger.success(`Analysis saved to ${options.output}`);
      }
      
      analyzer.printAnalysis(analysis, options.detailed);
    } catch (err) {
      logger.error('Analysis failed:', err);
      process.exit(1);
    }
  });

program
  .command('migrate [path]')
  .description('Migrate project to optimized prompts')
  .option('-s, --strategy <type>', 'Migration strategy: full, selective, merge', 'selective')
  .option('-b, --backup <dir>', 'Backup directory', '.claude-backup')
  .option('-f, --force', 'Force migration without prompts')
  .option('--dry-run', 'Simulate migration without making changes')
  .option('--preserve-custom', 'Preserve custom commands and configurations')
  .option('--skip-validation', 'Skip post-migration validation')
  .action(async (projectPath = '.', options) => {
    try {
      const runner = new MigrationRunner({
        projectPath: path.resolve(projectPath),
        strategy: options.strategy as MigrationStrategy,
        backupDir: options.backup,
        force: options.force,
        dryRun: options.dryRun,
        preserveCustom: options.preserveCustom,
        skipValidation: options.skipValidation
      });
      
      await runner.run();
    } catch (err) {
      logger.error('Migration failed:', err);
      process.exit(1);
    }
  });

program
  .command('rollback [path]')
  .description('Rollback to previous configuration')
  .option('-b, --backup <dir>', 'Backup directory to restore from', '.claude-backup')
  .option('-t, --timestamp <time>', 'Restore from specific timestamp')
  .option('-f, --force', 'Force rollback without prompts')
  .action(async (projectPath = '.', options) => {
    try {
      const runner = new MigrationRunner({
        projectPath: path.resolve(projectPath),
        strategy: 'full',
        backupDir: options.backup,
        force: options.force
      });
      
      await runner.rollback(options.timestamp);
    } catch (err) {
      logger.error('Rollback failed:', err);
      process.exit(1);
    }
  });

program
  .command('validate [path]')
  .description('Validate migration was successful')
  .option('-v, --verbose', 'Show detailed validation results')
  .action(async (projectPath = '.', options) => {
    try {
      const runner = new MigrationRunner({
        projectPath: path.resolve(projectPath),
        strategy: 'full'
      });
      
      const isValid = await runner.validate(options.verbose);
      
      if (isValid) {
        logger.success('Migration validated successfully!');
      } else {
        logger.error('Migration validation failed');
        process.exit(1);
      }
    } catch (err) {
      logger.error('Validation failed:', err);
      process.exit(1);
    }
  });

program
  .command('list-backups [path]')
  .description('List available backups')
  .option('-b, --backup <dir>', 'Backup directory', '.claude-backup')
  .action(async (projectPath = '.', options) => {
    try {
      const runner = new MigrationRunner({
        projectPath: path.resolve(projectPath),
        strategy: 'full',
        backupDir: options.backup
      });
      
      await runner.listBackups();
    } catch (err) {
      logger.error('Failed to list backups:', err);
      process.exit(1);
    }
  });

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);