// This file contains global type declarations for modules that don't have TypeScript definitions

declare module '*.js' {
  const content: any;
  export default content;
  export * from content;
}

// Add module declarations for any modules that might be missing type definitions
declare module 'express-status-monitor';
declare module 'console-log-colors';
declare module 'bwip-js';
