import { describe, expect, it } from 'vitest';
import {
  AudioBufferLruCache,
  getDecodedAudioBufferBytes,
} from './AudioBufferLruCache';

interface FakeBuffer {
  id: string;
  length: number;
  numberOfChannels: number;
}

const makeBuffer = (id: string, bytes: number): FakeBuffer => ({
  id,
  length: bytes / Float32Array.BYTES_PER_ELEMENT,
  numberOfChannels: 1,
});

describe('AudioBufferLruCache', () => {
  it('accounts for decoded PCM bytes', () => {
    expect(
      getDecodedAudioBufferBytes({ length: 48_000, numberOfChannels: 2 }),
    ).toBe(384_000);
  });

  it('promotes reads and evicts the least recently used entry', () => {
    const cache = new AudioBufferLruCache<FakeBuffer>(12);
    const first = makeBuffer('first', 4);
    const second = makeBuffer('second', 4);
    const third = makeBuffer('third', 8);

    cache.set('first', first);
    cache.set('second', second);
    expect(cache.get('first')).toBe(first);
    cache.set('third', third);

    expect(cache.get('second')).toBeUndefined();
    expect(cache.get('first')).toBe(first);
    expect(cache.get('third')).toBe(third);
    expect(cache.sizeBytes).toBe(12);
  });

  it('plays safely with oversized buffers by declining to retain them', () => {
    const cache = new AudioBufferLruCache<FakeBuffer>(8);
    const oversized = makeBuffer('oversized', 12);

    expect(cache.set('oversized', oversized)).toBe(false);
    expect(cache.get('oversized')).toBeUndefined();
    expect(cache.sizeBytes).toBe(0);
  });
});
