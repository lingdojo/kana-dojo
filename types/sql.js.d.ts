/**
 * Type declarations for sql.js
 *
 * sql.js is a JavaScript SQL database library that uses Emscripten to compile
 * SQLite to WebAssembly.
 */

declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: typeof Database;
  }

  export interface Database {
    run(sql: string, params?: unknown[]): Database;
    exec(sql: string, params?: unknown[]): QueryExecResult[];
    each(
      sql: string,
      params: unknown[],
      callback: (row: unknown) => void,
      done: () => void,
    ): Database;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
    getRowsModified(): number;
    create_function(name: string, func: (...args: unknown[]) => unknown): void;
  }

  export interface Statement {
    bind(params?: unknown[]): boolean;
    step(): boolean;
    getColumnNames(): string[];
    get(params?: unknown[]): unknown[];
    getAsObject(params?: unknown[]): Record<string, unknown>;
    run(params?: unknown[]): void;
    reset(): void;
    free(): boolean;
  }

  export interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }

  export interface SqlJsConfig {
    locateFile?: (file: string) => string;
    wasmBinary?: ArrayBuffer;
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>;
}
