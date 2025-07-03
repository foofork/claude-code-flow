/**
 * VSCode Extension Bridge for Terminal Integration
 * 
 * This file provides the bridge between Claude-Flow and VSCode extension API
 * for terminal management and output capture.
 */

// import * as vscode from 'vscode'; // Disabled for non-VSCode environments

// VSCode type definitions for compatibility
declare global {
  type Thenable<T> = Promise<T>;
}

declare namespace vscode {
  interface Terminal {
    name: string;
    processId: Thenable<number | undefined>;
    creationOptions: TerminalOptions | ExtensionTerminalOptions;
    exitStatus: TerminalExitStatus | undefined;
    state: TerminalState;
    sendText(text: string, addNewLine?: boolean): void;
    show(preserveFocus?: boolean): void;
    hide(): void;
    dispose(): void;
  }

  interface TerminalOptions {
    name?: string;
    shellPath?: string;
    shellArgs?: string[] | string;
    cwd?: string | Uri;
    env?: { [key: string]: string | null | undefined };
    strictEnv?: boolean;
    hideFromUser?: boolean;
    message?: string;
    iconPath?: Uri | { light: Uri; dark: Uri } | ThemeIcon;
    color?: ThemeColor;
  }

  interface ExtensionTerminalOptions {
    name: string;
    pty: Pseudoterminal;
  }

  interface TerminalExitStatus {
    readonly code: number | undefined;
    readonly reason: TerminalExitReason;
  }

  interface TerminalState {
    readonly isInteractedWith: boolean;
  }

  interface ExtensionContext {
    subscriptions: { dispose(): any }[];
    workspaceState: Memento;
    globalState: Memento;
    extensionPath: string;
    extensionUri: Uri;
    environmentVariableCollection: EnvironmentVariableCollection;
  }

  interface EventEmitter<T> {
    event: Event<T>;
    fire(data: T): void;
    dispose(): void;
  }

  interface Event<T> {
    (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
  }

  interface Disposable {
    dispose(): any;
  }

  interface Memento {
    keys(): readonly string[];
    get<T>(key: string): T | undefined;
    get<T>(key: string, defaultValue: T): T;
    update(key: string, value: any): Thenable<void>;
  }

  interface Uri {
    scheme: string;
    authority: string;
    path: string;
    query: string;
    fragment: string;
    fsPath: string;
  }

  interface ThemeIcon {
    id: string;
    color?: ThemeColor;
  }

  interface ThemeColor {
    id: string;
  }

  interface Pseudoterminal {
    onDidWrite: Event<string>;
    onDidOverrideDimensions?: Event<TerminalDimensions | undefined>;
    onDidClose?: Event<number | void>;
    onDidChangeName?: Event<string>;
    open(initialDimensions: TerminalDimensions | undefined): void;
    close(): void;
    handleInput?(data: string): void;
    setDimensions?(dimensions: TerminalDimensions): void;
  }

  interface TerminalDimensions {
    columns: number;
    rows: number;
  }

  interface EnvironmentVariableCollection {
    readonly persistent: boolean;
    replace(variable: string, value: string): void;
    append(variable: string, value: string): void;
    prepend(variable: string, value: string): void;
    get(variable: string): EnvironmentVariableMutator | undefined;
    forEach(callback: (variable: string, mutator: EnvironmentVariableMutator, collection: EnvironmentVariableCollection) => any, thisArg?: any): void;
    delete(variable: string): void;
    clear(): void;
  }

  interface EnvironmentVariableMutator {
    readonly type: EnvironmentVariableMutatorType;
    readonly value: string;
  }

  enum EnvironmentVariableMutatorType {
    Replace = 1,
    Append = 2,
    Prepend = 3
  }

  enum TerminalExitReason {
    Unknown = 0,
    Shutdown = 1,
    Process = 2,
    User = 3,
    Extension = 4
  }

  namespace window {
    export function createTerminal(options?: TerminalOptions | ExtensionTerminalOptions): Terminal;
    export function showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined>;
    export function showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined>;
    export const onDidCloseTerminal: Event<Terminal>;
    export function registerTerminalProfileProvider(id: string, provider: any): Disposable;
  }

  class EventEmitter<T> {
    event: Event<T>;
    fire(data: T): void;
    dispose(): void;
    constructor();
  }
}

interface MockVSCode {
  Terminal: any;
  window: typeof vscode.window;
  EventEmitter: typeof vscode.EventEmitter;
}

// Create a mock vscode object for non-extension environments
const vscodeMock: MockVSCode | undefined = typeof window !== 'undefined' ? undefined : undefined;

/**
 * Terminal output processors registry
 */
const terminalOutputProcessors = new Map<string, (data: string) => void>();

/**
 * Active terminals registry
 */
const activeTerminals = new Map<string, any>();

/**
 * Terminal write emulators for output capture
 */
const terminalWriteEmulators = new Map<vscode.Terminal, vscode.EventEmitter<string>>();

/**
 * Initialize the VSCode terminal bridge
 */
export function initializeTerminalBridge(context: vscode.ExtensionContext): void {
  // Inject VSCode API into global scope for Claude-Flow
  (globalThis as any).vscode = vscode;

  // Register terminal output processor function
  (globalThis as any).registerTerminalOutputProcessor = (
    terminalId: string,
    processor: (data: string) => void
  ) => {
    terminalOutputProcessors.set(terminalId, processor);
  };

  // Override terminal creation to capture output
  const originalCreateTerminal = vscode.window.createTerminal;
  (vscode.window as any).createTerminal = function(options: vscode.TerminalOptions) {
    const terminal = originalCreateTerminal.call(vscode.window, options) as vscode.Terminal;
    
    // Create write emulator for this terminal
    const writeEmulator = new vscode.EventEmitter<string>();
    terminalWriteEmulators.set(terminal, writeEmulator);

    // Find terminal ID from name
    const match = options.name?.match(/Claude-Flow Terminal ([\w-]+)/);
    if (match) {
      const terminalId = match[1];
      activeTerminals.set(terminalId, terminal);
      
      // Set up output capture
      captureTerminalOutput(terminal, terminalId);
    }

    return terminal;
  };

  // Clean up on terminal close
  context.subscriptions.push(
    vscode.window.onDidCloseTerminal((terminal: vscode.Terminal) => {
      // Find and remove from registries
      for (const [id, term] of Array.from(activeTerminals.entries())) {
        if (term === terminal) {
          activeTerminals.delete(id);
          terminalOutputProcessors.delete(id);
          break;
        }
      }
      
      // Clean up write emulator
      const emulator = terminalWriteEmulators.get(terminal);
      if (emulator) {
        emulator.dispose();
        terminalWriteEmulators.delete(terminal);
      }
    })
  );
}

/**
 * Capture terminal output using various methods
 */
function captureTerminalOutput(terminal: vscode.Terminal, terminalId: string): void {
  // Method 1: Use terminal.sendText override to capture commands
  const originalSendText = terminal.sendText;
  (terminal as any).sendText = function(text: string, addNewLine?: boolean) {
    // Call original method
    originalSendText.call(terminal, text, addNewLine);
    
    // Process command
    const processor = terminalOutputProcessors.get(terminalId);
    if (processor && text) {
      // Simulate command echo
      processor(text + (addNewLine !== false ? '\n' : ''));
    }
  };

  // Method 2: Use proposed API if available
  if ('onDidWriteData' in terminal) {
    const writeDataEvent = (terminal as any).onDidWriteData;
    if (writeDataEvent) {
      writeDataEvent((data: string) => {
        const processor = terminalOutputProcessors.get(terminalId);
        if (processor) {
          processor(data);
        }
      });
    }
  }

  // Method 3: Use terminal renderer if available
  setupTerminalRenderer(terminal, terminalId);
}

/**
 * Set up terminal renderer for output capture
 */
function setupTerminalRenderer(terminal: vscode.Terminal, terminalId: string): void {
  // Check if terminal renderer API is available
  if (typeof vscode.window.registerTerminalProfileProvider === 'function') {
    // This is a more advanced method that requires additional setup
    // It would involve creating a custom terminal profile that captures output
    
    // For now, we'll use a simpler approach with periodic output checking
    let lastOutput = '';
    const checkOutput = setInterval(() => {
      // This is a placeholder - actual implementation would depend on
      // available VSCode APIs for reading terminal content
      
      // Check if terminal is still active
      if (!activeTerminals.has(terminalId)) {
        clearInterval(checkOutput);
      }
    }, 100);
  }
}

/**
 * Create a terminal with output capture
 */
export async function createCapturedTerminal(
  name: string,
  shellPath?: string,
  shellArgs?: string[]
): Promise<{
  terminal: vscode.Terminal;
  onData: vscode.Event<string>;
}> {
  const writeEmulator = new vscode.EventEmitter<string>();
  
  const terminal = vscode.window.createTerminal({
    name,
    shellPath,
    shellArgs,
  });

  terminalWriteEmulators.set(terminal, writeEmulator);

  return {
    terminal,
    onData: writeEmulator.event,
  };
}

/**
 * Send command to terminal and capture output
 */
export async function executeTerminalCommand(
  terminal: vscode.Terminal,
  command: string,
  timeout: number = 30000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writeEmulator = terminalWriteEmulators.get(terminal);
    if (!writeEmulator) {
      reject(new Error('No write emulator for terminal'));
      return;
    }

    let output = '';
    const marker = `__COMMAND_COMPLETE_${Date.now()}__`;
    
    // Set up output listener
    const disposable = writeEmulator.event((data: string) => {
      output += data;
      
      if (output.includes(marker)) {
        // Command completed
        disposable.dispose();
        const result = output.substring(0, output.indexOf(marker));
        resolve(result);
      }
    });

    // Set timeout
    const timer = setTimeout(() => {
      disposable.dispose();
      reject(new Error('Command timeout'));
    }, timeout);

    // Execute command with marker
    terminal.sendText(`${command} && echo "${marker}"`);
    
    // Clear timeout on success
    writeEmulator.event(() => {
      if (output.includes(marker)) {
        clearTimeout(timer);
      }
    });
  });
}

/**
 * Get terminal by ID
 */
export function getTerminalById(terminalId: string): vscode.Terminal | undefined {
  return activeTerminals.get(terminalId);
}

/**
 * Dispose all terminal resources
 */
export function disposeTerminalBridge(): void {
  // Clean up all terminals
  for (const terminal of Array.from(activeTerminals.values())) {
    terminal.dispose();
  }
  activeTerminals.clear();
  
  // Clean up processors
  terminalOutputProcessors.clear();
  
  // Clean up write emulators
  for (const emulator of Array.from(terminalWriteEmulators.values())) {
    emulator.dispose();
  }
  terminalWriteEmulators.clear();
}