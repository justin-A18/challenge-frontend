import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  resolve: { alias: { '~': fileURLToPath(new URL('./app', import.meta.url)), '@mocks': fileURLToPath(new URL('../mocks', import.meta.url)) } },
  test: { environment: 'happy-dom', include: ['__tests__/unit/**/*.spec.ts'] },
});

