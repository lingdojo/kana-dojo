import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.ts', '**/*.test.tsx']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  }
});
