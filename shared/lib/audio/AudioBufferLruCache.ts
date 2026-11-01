export interface DecodedAudioBufferLike {
  length: number;
  numberOfChannels: number;
}

interface CacheEntry<T extends DecodedAudioBufferLike> {
  buffer: T;
  bytes: number;
}

export function getDecodedAudioBufferBytes(
  buffer: DecodedAudioBufferLike,
): number {
  return buffer.length * buffer.numberOfChannels * Float32Array.BYTES_PER_ELEMENT;
}

/** A byte-bounded LRU cache for decoded PCM buffers. */
export class AudioBufferLruCache<T extends DecodedAudioBufferLike> {
  private readonly entries = new Map<string, CacheEntry<T>>();
  private usedBytes = 0;

  constructor(readonly maxBytes: number) {}

  get sizeBytes(): number {
    return this.usedBytes;
  }

  get size(): number {
    return this.entries.size;
  }

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.buffer;
  }

  set(key: string, buffer: T): boolean {
    const bytes = getDecodedAudioBufferBytes(buffer);
    const existing = this.entries.get(key);
    if (existing) {
      this.entries.delete(key);
      this.usedBytes -= existing.bytes;
    }

    if (bytes > this.maxBytes) return false;

    while (this.usedBytes + bytes > this.maxBytes) {
      const oldestKey = this.entries.keys().next().value as string | undefined;
      if (!oldestKey) break;
      const oldest = this.entries.get(oldestKey);
      this.entries.delete(oldestKey);
      if (oldest) this.usedBytes -= oldest.bytes;
    }

    this.entries.set(key, { buffer, bytes });
    this.usedBytes += bytes;
    return true;
  }
}
