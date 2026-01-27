/**
 * Anki Converter Web Worker
 *
 * Runs conversion in a background thread to keep the UI responsive.
 * All processing happens locally - no network requests are made.
 *
 * @module features/AnkiConverter/lib/worker/conversionWorker
 */

import type {
  WorkerRequestMessage,
  WorkerResponseMessage,
  WorkerProgressMessage,
  WorkerSuccessMessage,
  WorkerErrorMessage,
} from './types';
import type { ConversionOptions, ProgressEvent } from '../../types';
import { ConversionError, ErrorCode } from '../../types';
import { createConversionPipeline } from '../conversionPipeline';

// Track active conversions for cancellation
const activeConversions = new Map<string, AbortController>();

/**
 * Post a message to the main thread
 */
function postResponse(message: WorkerResponseMessage): void {
  self.postMessage(message);
}

/**
 * Handle conversion request
 */
async function handleConvert(
  id: string,
  buffer: ArrayBuffer,
  filename: string | undefined,
  options: ConversionOptions,
): Promise<void> {
  // Create abort controller for this conversion
  const abortController = new AbortController();
  activeConversions.set(id, abortController);

  try {
    const pipeline = createConversionPipeline();

    // Forward progress events to main thread
    pipeline.on('progress', (event: ProgressEvent) => {
      // Check if cancelled
      if (abortController.signal.aborted) {
        return;
      }

      const progressMessage: WorkerProgressMessage = {
        type: 'progress',
        id,
        payload: {
          stage: event.stage,
          progress: event.progress,
          message: event.message,
        },
      };
      postResponse(progressMessage);
    });

    // Run conversion
    const result = await pipeline.convert(buffer, options);

    // Check if cancelled before sending result
    if (abortController.signal.aborted) {
      return;
    }

    // Send success message
    const successMessage: WorkerSuccessMessage = {
      type: 'success',
      id,
      payload: result,
    };
    postResponse(successMessage);
  } catch (error) {
    // Check if cancelled
    if (abortController.signal.aborted) {
      return;
    }

    // Send error message
    const errorMessage: WorkerErrorMessage = {
      type: 'error',
      id,
      payload: serializeError(error),
    };
    postResponse(errorMessage);
  } finally {
    // Cleanup
    activeConversions.delete(id);

    // Help garbage collection by clearing the buffer reference
    // The buffer is transferred, so this is mainly for clarity
  }
}

/**
 * Handle cancel request
 */
function handleCancel(id: string): void {
  const controller = activeConversions.get(id);
  if (controller) {
    controller.abort();
    activeConversions.delete(id);
  }
}

/**
 * Handle cleanup request - clear all memory
 */
function handleCleanup(): void {
  // Cancel all active conversions
  for (const [id, controller] of activeConversions) {
    controller.abort();
    activeConversions.delete(id);
  }

  // Post cleanup complete message
  postResponse({ type: 'cleanup-complete' });
}

/**
 * Serialize an error for transfer to main thread
 */
function serializeError(error: unknown): {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
} {
  if (error instanceof ConversionError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      recoverable: error.recoverable,
    };
  }

  if (error instanceof Error) {
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message,
      details: { name: error.name },
      recoverable: false,
    };
  }

  return {
    code: ErrorCode.UNKNOWN_ERROR,
    message: String(error),
    recoverable: false,
  };
}

/**
 * Message handler
 */
self.onmessage = (event: MessageEvent<WorkerRequestMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'convert':
      handleConvert(
        message.id,
        message.payload.buffer,
        message.payload.filename,
        message.payload.options,
      );
      break;

    case 'cancel':
      handleCancel(message.id);
      break;

    case 'cleanup':
      handleCleanup();
      break;
  }
};

// Signal that worker is ready
postResponse({ type: 'ready' });
