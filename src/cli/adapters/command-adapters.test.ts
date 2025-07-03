/**
 * Tests for command adapters
 */

import { describe, it, expect, vi } from 'vitest';
import { Command as CommanderCommand } from 'commander';
import { commanderToCliCore, commanderToCliffy } from './command-adapters.js';
import type { CommandContext } from '../cli-core.js';

describe('Command Adapters', () => {
  describe('commanderToCliCore', () => {
    it('should convert basic commander command to cli-core format', () => {
      const commanderCmd = new CommanderCommand('test')
        .description('Test command')
        .option('-f, --force', 'Force action')
        .option('-p, --port <port>', 'Port number', '3000');

      const cliCoreCmd = commanderToCliCore(commanderCmd);

      expect(cliCoreCmd.name).toBe('test');
      expect(cliCoreCmd.description).toBe('Test command');
      expect(cliCoreCmd.options).toHaveLength(2);
      expect(cliCoreCmd.options?.[0]).toEqual({
        name: 'force',
        short: 'f',
        description: 'Force action',
        type: 'boolean',
        default: undefined,
        required: false,
      });
      expect(cliCoreCmd.options?.[1]).toEqual({
        name: 'port',
        short: 'p',
        description: 'Port number',
        type: 'string',
        default: '3000',
        required: false,
      });
    });

    it('should convert action handler', async () => {
      const mockAction = vi.fn();
      const commanderCmd = new CommanderCommand('test')
        .description('Test command')
        .action(mockAction);

      const cliCoreCmd = commanderToCliCore(commanderCmd);
      const ctx: CommandContext = {
        args: ['arg1'],
        flags: { verbose: true },
      };

      await cliCoreCmd.action?.(ctx);

      expect(mockAction).toHaveBeenCalledWith(
        { verbose: true },
        commanderCmd
      );
    });

    it('should handle subcommands', () => {
      const subCmd = new CommanderCommand('sub')
        .description('Sub command');
      
      const commanderCmd = new CommanderCommand('parent')
        .description('Parent command')
        .addCommand(subCmd);

      const cliCoreCmd = commanderToCliCore(commanderCmd);

      expect(cliCoreCmd.subcommands).toHaveLength(1);
      expect(cliCoreCmd.subcommands?.[0].name).toBe('sub');
      expect(cliCoreCmd.subcommands?.[0].description).toBe('Sub command');
    });
  });

  describe('commanderToCliffy', () => {
    it('should convert basic commander command to cliffy format', () => {
      const commanderCmd = new CommanderCommand('test')
        .description('Test command')
        .option('-f, --force', 'Force action')
        .option('-p, --port <port>', 'Port number', '3000');

      const cliffyCmd = commanderToCliffy(commanderCmd);

      expect(cliffyCmd.getName()).toBe('test');
      expect(cliffyCmd.getDescription()).toBe('Test command');
      
      const options = cliffyCmd.getOptions();
      expect(options).toHaveLength(2);
      
      const forceOption = options.find(opt => opt.name === 'force');
      expect(forceOption).toBeDefined();
      expect(forceOption?.flags).toContain('-f');
      expect(forceOption?.flags).toContain('--force');
      
      const portOption = options.find(opt => opt.name === 'port');
      expect(portOption).toBeDefined();
      expect(portOption?.flags).toContain('-p');
      expect(portOption?.flags).toContain('--port');
      expect(portOption?.default).toBe('3000');
    });

    it('should convert arguments', () => {
      const commanderCmd = new CommanderCommand('test')
        .description('Test command')
        .arguments('<required> [optional]');

      const cliffyCmd = commanderToCliffy(commanderCmd);
      
      const args = cliffyCmd.getArguments();
      expect(args).toHaveLength(2);
      expect(args[0].name).toBe('required');
      expect(args[0].required).toBe(true);
      expect(args[1].name).toBe('optional');
      expect(args[1].required).toBe(false);
    });
  });
});