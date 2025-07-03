/**
 * Unified command adapters for converting between different command frameworks
 */

import type { Command as CommanderCommand } from 'commander';
import type { Command as CliCoreCommand, CommandContext } from '../cli-core.js';
import { Command as CliffyCommand } from '@cliffy/command';

/**
 * Convert a Commander.js command to a cli-core command
 */
export function commanderToCliCore(commanderCmd: CommanderCommand): CliCoreCommand {
  // Extract options from commander command
  const options = commanderCmd.options.map(opt => ({
    name: opt.long?.replace(/^--/, '') || opt.name(),
    short: opt.short?.replace(/^-/, ''),
    description: opt.description,
    type: getOptionType(opt),
    default: opt.defaultValue,
    required: opt.required || false,
  }));

  // Create the cli-core command
  const cliCoreCmd: CliCoreCommand = {
    name: commanderCmd.name(),
    description: commanderCmd.description(),
    options,
    action: async (ctx: CommandContext) => {
      // Convert cli-core context to commander-style args
      const args = [...ctx.args];
      const opts: Record<string, any> = {};
      
      // Map flags to commander-style options
      for (const [key, value] of Object.entries(ctx.flags)) {
        opts[key] = value;
      }
      
      // Find the action handler from commander
      const actionHandler = (commanderCmd as any)._actionHandler;
      if (actionHandler) {
        await actionHandler(opts, commanderCmd);
      }
    },
  };

  // Handle subcommands recursively
  if (commanderCmd.commands && commanderCmd.commands.length > 0) {
    cliCoreCmd.subcommands = commanderCmd.commands.map(subcmd => 
      commanderToCliCore(subcmd as CommanderCommand)
    );
  }

  return cliCoreCmd;
}

/**
 * Convert a Commander.js command to a Cliffy command
 * This is used for src/cli/index.ts compatibility
 */
export function commanderToCliffy(commanderCmd: CommanderCommand): CliffyCommand {
  const cliffyCmd = new CliffyCommand()
    .name(commanderCmd.name())
    .description(commanderCmd.description());

  // Add arguments
  const args = (commanderCmd as any)._args || [];
  for (const arg of args) {
    if (arg.required) {
      cliffyCmd.arguments(`<${arg.name}:string>`);
    } else {
      cliffyCmd.arguments(`[${arg.name}:string]`);
    }
  }

  // Add options
  for (const option of commanderCmd.options) {
    const optionName = option.long?.replace(/^--/, '') || '';
    const shortFlag = option.short?.replace(/^-/, '');
    const type = getCliffyOptionType(option);
    
    let flagString = shortFlag ? `-${shortFlag}, ` : '';
    flagString += `--${optionName}`;
    
    if (type !== 'boolean') {
      flagString += ` <${optionName}:${type}>`;
    }
    
    const optionConfig: any = {
      default: option.defaultValue
    };
    
    if (option.required) {
      optionConfig.required = true;
    }
    
    cliffyCmd.option(flagString, option.description, optionConfig);
  }

  // Set action handler
  const actionHandler = (commanderCmd as any)._actionHandler;
  if (actionHandler) {
    cliffyCmd.action(async (options: any, ...args: any[]) => {
      // Convert Cliffy-style call to Commander-style
      const commanderOptions = { ...options };
      
      // Commander passes the command instance as the last argument
      await actionHandler(...args, commanderOptions, commanderCmd);
    });
  }

  // Handle subcommands recursively
  for (const subCmd of commanderCmd.commands) {
    cliffyCmd.command(subCmd.name(), commanderToCliffy(subCmd as CommanderCommand));
  }

  return cliffyCmd;
}

/**
 * Determine option type from commander option for cli-core
 */
function getOptionType(option: any): 'string' | 'boolean' | 'number' {
  if (option.negate || !option.required) {
    return 'boolean';
  }
  // Could be enhanced to detect number types from description or parseArg
  return 'string';
}

/**
 * Determine option type from commander option for Cliffy
 */
function getCliffyOptionType(option: any): string {
  // Check for boolean flags
  if (option.negate || (!option.required && !option.defaultValue)) {
    return 'boolean';
  }
  
  // Try to infer from option name or description
  const name = option.long || option.short || '';
  const desc = option.description || '';
  
  if (name.includes('port') || name.includes('count') || name.includes('number') ||
      desc.toLowerCase().includes('number')) {
    return 'number';
  }
  
  return 'string';
}