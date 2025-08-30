import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['cli.ts'],
  format: ['esm'],
  dts: false,
  shims: true,
  clean: true,
});
