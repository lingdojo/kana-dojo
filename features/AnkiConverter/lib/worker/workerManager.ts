/**
 * Web Worker Manager for Anki Converter
 *
 * Manages the lifecycle of the conversion worker and provides
 * a clean API for the main thread to interact with it.
 *
 * @module features/AnkiConverter/lib/worker/workerManager
 */

import type {
  WorkerRequestMessage,
  WorkerResponseMessage,
  WorkerConvertMessage,
} from './types';
import type {
  ConversionOptions,
  ConversionResult,
  ProgressEvent,
} from '../../types';
import { ConversionError, ErrorCode } from '../../types';

/**
 * Callback types for conversion events
 */
export interface ConversionCallbacks {
  onProgress?: (event: ProgressEvent) => void;
  onError?: (error: ConversionError) => void;
}

/**
 * Pending conversion request
 */
interface PendingConversion {
  resolve: (result: ConversionResult) => void;
  reject: (error: ConversionError) => void;
  callbacks: ConversionCallbacks;
}

/**
 * Worker manager state
 */
interface WorkerManagerState {
  worker: Worker | null;
  ready: boolean;
  pendingConversions: Map<string, PendingConversion>;
  readyPromise: Promise<void> | null;
  readyResolve: (() => void) | null;
}

/**
 * Generate a unique ID for conversion requests
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create a worker manager instance
 */
export function createWorkerManager() {
  const state: WorkerManagerState = {
    worker: null,
    ready: false,
    pendingConversions: new Map(),
    readyPromise: null,
    readyResolve: null,
  };

  /**
   * Handle messages from the worker
   */
  function handleMessage(event: MessageEvent<WorkerResponseMessage>): void {
    const message = event.data;

    switch (message.type) {
      case 'ready':
        state.ready = true;
        if (state.readyResolve) {
          state.readyResolve();
          state.readyResolve = null;
        }
        break;

      case 'progress': {
        const pending = state.pendingConversions.get(message.id);
        if (pending?.callbacks.onProgress) {
          pending.callbacks.onProgress(message.payload);
        }
        break;
      }

      case 'success': {
        const pending = state.pendingConversions.get(message.id);
        if (pending) {
          state.pendingConversions.delete(message.id);
          pending.resolve(message.payload);
        }
        break;
      }

      case 'error': {
        const pending = state.pendingConversions.get(message.id);
        if (pending) {
          state.pendingConversions.delete(message.id);
          const error = new ConversionError(
            message.payload.code as ErrorCode,
            message.payload.message,
            message.payload.details,
            message.payload.recoverable,
          );
          if (pending.callbacks.onError) {
            pending.callbacks.onError(error);
          }
          pending.reject(error);
        }
        break;
      }

      case 'cleanup-complete':
        // Cleanup acknowledged
        break;
    }
  }

  /**
   * Handle worker errors
   */
  function handleError(event: ErrorEvent): void {
    console.error('Worker error:', event.message);

    // Reject all pending conversions
    for (const [id, pending] of state.pendingConversions) {
      const error = new ConversionError(
        ErrorCode.UNKNOWN_ERROR,
        `Worker error: ${event.message}`,
        { filename: event.filename, lineno: event.lineno },
        false,
      );
      if (pending.callbacks.onError) {
        pending.callbacks.onError(error);
      }
      pending.reject(error);
      state.pendingConversions.delete(id);
    }
  }

  /**
   * Initialize the worker
   */
  function initialize(): Promise<void> {
    if (state.worker) {
      if (state.ready) {
        return Promise.resolve();
      }
      return state.readyPromise || Promise.resolve();
    }

    // Check if we're in a browser environment with Worker support
    if (typeof Worker === 'undefined') {
      return Promise.reject(
        new ConversionError(
          ErrorCode.UNKNOWN_ERROR,
          'Web Workers are not supported in this environment',
          {},
          false,
        ),
      );
    }

    state.readyPromise = new Promise<void>(resolve => {
      state.readyResolve = resolve;
    });

    try {
      // Create worker using URL constructor for bundler compatibility
      // The actual worker file will be created by the build process
      state.worker = new Worker(
        new URL('./conversionWorker.ts', import.meta.url),
        { type: 'module' },
      );

      state.worker.onmessage = handleMessage;
      state.worker.onerror = handleError;
    } catch (error) {
      state.readyPromise = null;
      state.readyResolve = null;
      return Promise.reject(
        new ConversionError(
          ErrorCode.UNKNOWN_ERROR,
          `Failed to create worker: ${error instanceof Error ? error.message : String(error)}`,
          {},
          false,
        ),
      );
    }

    return state.readyPromise;
  }

  /**
   * Convert a file using the worker
   */
  async function convert(
    file: File | ArrayBuffer,
    options: ConversionOptions = {},
    callbacks: ConversionCallbacks = {},
  ): Promise<ConversionResult> {
    // Initialize worker if needed
    await initialize();

    if (!state.worker) {
      throw new ConversionError(
        ErrorCode.UNKNOWN_ERROR,
        'Worker not initialized',
        {},
        false,
      );
    }

    // Get buffer and filename
    let buffer: ArrayBuffer;
    let filename: string | undefined;

    if (file instanceof File) {
      buffer = await file.arrayBuffer();
      filename = file.name;
    } else {
      buffer = file;
    }

    // Create conversion request
    const id = generateId();

    return new Promise<ConversionResult>((resolve, reject) => {
      state.pendingConversions.set(id, {
        resolve,
        reject,
        callbacks,
      });

      const message: WorkerConvertMessage = {
        type: 'convert',
        id,
        payload: {
          buffer,
          filename,
          options,
        },
      };

      // Transfer the buffer to the worker for better performance
      state.worker!.postMessage(message, [buffer]);
    });
  }

  /**
   * Cancel an ongoing conversion
   */
  function cancel(id: string): void {
    if (!state.worker) return;

    const message: WorkerRequestMessage = {
      type: 'cancel',
      id,
    };
    state.worker.postMessage(message);

    // Also reject the pending promise
    const pending = state.pendingConversions.get(id);
    if (pending) {
      state.pendingConversions.delete(id);
      pending.reject(
        new ConversionError(
          ErrorCode.UNKNOWN_ERROR,
          'Conversion cancelled',
          {},
          false,
        ),
      );
    }
  }

  /**
   * Cleanup worker memory
   */
  function cleanup(): void {
    if (!state.worker) return;

    const message: WorkerRequestMessage = {
      type: 'cleanup',
    };
    state.worker.postMessage(message);
  }

  /**
   * Terminate the worker completely
   */
  function terminate(): void {
    if (!state.worker) return;

    // Reject all pending conversions
    for (const [id, pending] of state.pendingConversions) {
      pending.reject(
        new ConversionError(
          ErrorCode.UNKNOWN_ERROR,
          'Worker terminated',
          {},
          false,
        ),
      );
      state.pendingConversions.delete(id);
    }

    state.worker.terminate();
    state.worker = null;
    state.ready = false;
    state.readyPromise = null;
    state.readyResolve = null;
  }

  /**
   * Check if worker is ready
   */
  function isReady(): boolean {
    return state.ready;
  }

  /**
   * Check if worker is supported in current environment
   */
  function isSupported(): boolean {
    return typeof Worker !== 'undefined';
  }

  return {
    initialize,
    convert,
    cancel,
    cleanup,
    terminate,
    isReady,
    isSupported,
  };
}

/**
 * Worker manager type
 */
export type WorkerManager = ReturnType<typeof createWorkerManager>;

/**
 * Singleton worker manager instance
 */
let workerManagerInstance: WorkerManager | null = null;

/**
 * Get the singleton worker manager instance
 */
export function getWorkerManager(): WorkerManager {
  if (!workerManagerInstance) {
    workerManagerInstance = createWorkerManager();
  }
  return workerManagerInstance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetWorkerManager(): void {
  if (workerManagerInstance) {
    workerManagerInstance.terminate();
    workerManagerInstance = null;
  }
}
