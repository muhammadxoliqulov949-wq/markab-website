import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    testTimeout: 15000,
    hookTimeout: 15000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      // server-only throws outside the Next.js rendering pipeline; in tests
      // we stub it to a no-op so server code can be imported directly.
      'server-only': path.resolve(__dirname, 'tests/_server-only-stub.js'),
    },
  },
});
