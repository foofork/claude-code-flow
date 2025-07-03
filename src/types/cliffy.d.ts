/**
 * Type declarations for @cliffy modules
 * These are Deno-specific modules that need type definitions for TypeScript
 */

declare module '@cliffy/ansi/colors' {
  export interface ColorFunction {
    (text: string): string;
    bold: ColorFunction;
    dim: ColorFunction;
    italic: ColorFunction;
    underline: ColorFunction;
    inverse: ColorFunction;
    hidden: ColorFunction;
    strikethrough: ColorFunction;
    black: ColorFunction;
    red: ColorFunction;
    green: ColorFunction;
    yellow: ColorFunction;
    blue: ColorFunction;
    magenta: ColorFunction;
    cyan: ColorFunction;
    white: ColorFunction;
    gray: ColorFunction;
    grey: ColorFunction;
    brightBlack: ColorFunction;
    brightRed: ColorFunction;
    brightGreen: ColorFunction;
    brightYellow: ColorFunction;
    brightBlue: ColorFunction;
    brightMagenta: ColorFunction;
    brightCyan: ColorFunction;
    brightWhite: ColorFunction;
    bgBlack: ColorFunction;
    bgRed: ColorFunction;
    bgGreen: ColorFunction;
    bgYellow: ColorFunction;
    bgBlue: ColorFunction;
    bgMagenta: ColorFunction;
    bgCyan: ColorFunction;
    bgWhite: ColorFunction;
    bgBrightBlack: ColorFunction;
    bgBrightRed: ColorFunction;
    bgBrightGreen: ColorFunction;
    bgBrightYellow: ColorFunction;
    bgBrightBlue: ColorFunction;
    bgBrightMagenta: ColorFunction;
    bgBrightCyan: ColorFunction;
    bgBrightWhite: ColorFunction;
  }
  
  export interface Colors {
    bold: ColorFunction;
    dim: ColorFunction;
    italic: ColorFunction;
    underline: ColorFunction;
    inverse: ColorFunction;
    hidden: ColorFunction;
    strikethrough: ColorFunction;
    black: ColorFunction;
    red: ColorFunction;
    green: ColorFunction;
    yellow: ColorFunction;
    blue: ColorFunction;
    magenta: ColorFunction;
    cyan: ColorFunction;
    white: ColorFunction;
    gray: ColorFunction;
    grey: ColorFunction;
    brightBlack: ColorFunction;
    brightRed: ColorFunction;
    brightGreen: ColorFunction;
    brightYellow: ColorFunction;
    brightBlue: ColorFunction;
    brightMagenta: ColorFunction;
    brightCyan: ColorFunction;
    brightWhite: ColorFunction;
    bgBlack: ColorFunction;
    bgRed: ColorFunction;
    bgGreen: ColorFunction;
    bgYellow: ColorFunction;
    bgBlue: ColorFunction;
    bgMagenta: ColorFunction;
    bgCyan: ColorFunction;
    bgWhite: ColorFunction;
    bgBrightBlack: ColorFunction;
    bgBrightRed: ColorFunction;
    bgBrightGreen: ColorFunction;
    bgBrightYellow: ColorFunction;
    bgBrightBlue: ColorFunction;
    bgBrightMagenta: ColorFunction;
    bgBrightCyan: ColorFunction;
    bgBrightWhite: ColorFunction;
    rgb24(text: string, color: number): string;
    bgRgb24(text: string, color: number): string;
    setColorEnabled(enabled: boolean): void;
  }
  
  export const colors: Colors;
}

declare module '@cliffy/command' {
  export interface CommandOptions {
    default?: any;
  }

  export interface GlobalOptions {
    default?: string;
  }

  export class Command<T = any> {
    constructor();
    name(name: string): this;
    version(version: string): this;
    description(desc: string): this;
    alias(alias: string): this;
    aliases(...aliases: string[]): this;
    arguments(args: string): this;
    option(flags: string, desc: string, opts?: CommandOptions): this;
    globalOption(flags: string, desc: string, opts?: GlobalOptions): this;
    meta(key: string, value: string): this;
    example(desc: string, cmd: string): this;
    action(fn: (options: T, ...args: any[]) => void | Promise<void>): this;
    command(name: string, command: Command): this;
    command(name: string, desc?: string): Command;
    parse(args?: string[]): Promise<any>;
    showHelp(): void;
    getHelp(): string;
    help(opts?: any): this;
    versionOption(flags: string, desc: string, opts?: any): this;
    helpOption(flags: string, desc: string, opts?: any): this;
  }
}

declare module '@cliffy/table' {
  export interface TableOptions {
    border?: boolean;
    maxColWidth?: number;
    minColWidth?: number;
    padding?: number;
    indent?: number;
    align?: 'left' | 'right' | 'center';
    chars?: any;
  }

  export class Table<T extends any[] = any[]> {
    constructor(data?: T[]);
    static from<T extends any[]>(data: T[]): Table<T>;
    header(row: string[]): this;
    body(rows: T[]): this;
    push(row: T): this;
    clone(): Table<T>;
    toString(): string;
    render(): string;
    border(enable: boolean): this;
    align(direction: 'left' | 'right' | 'center'): this;
    padding(padding: number): this;
    indent(indent: number): this;
    maxColWidth(width: number): this;
    minColWidth(width: number): this;
    chars(chars: any): this;
  }
}

declare module '@cliffy/prompt' {
  export interface PromptOptions {
    message: string;
    default?: any;
    validate?: (value: any) => boolean | string | Promise<boolean | string>;
    hint?: string;
    suggestions?: string[];
    list?: boolean;
    info?: boolean;
  }

  export interface SelectOptions extends PromptOptions {
    options: Array<string | { name: string; value: any }>;
    maxRows?: number;
    indent?: string;
    listPointer?: string;
    searchLabel?: string;
    search?: boolean;
  }

  export interface ConfirmOptions extends PromptOptions {
    default?: boolean;
  }

  export interface InputOptions extends PromptOptions {
    minLength?: number;
    maxLength?: number;
  }

  export function prompt(options: PromptOptions[]): Promise<Record<string, any>>;
  export function Input(options: InputOptions): Promise<string>;
  export function Number(options: PromptOptions): Promise<number>;
  export function Secret(options: PromptOptions): Promise<string>;
  export function Confirm(options: ConfirmOptions): Promise<boolean>;
  export function Toggle(options: PromptOptions): Promise<boolean>;
  export function Select<T = string>(options: SelectOptions): Promise<T>;
  export function Checkbox<T = string>(options: SelectOptions): Promise<T[]>;
  export function List(options: PromptOptions): Promise<string[]>;
}