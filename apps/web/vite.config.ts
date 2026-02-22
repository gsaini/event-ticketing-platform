import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ticketing/types': resolve(__dirname, '../../libs/shared/types/src/index.ts'),
      '@ticketing/utils': resolve(__dirname, '../../libs/shared/utils/src/index.ts'),
      '@ticketing/ui': resolve(__dirname, '../../libs/ui/src/index.ts'),
      '@ticketing/data-access': resolve(__dirname, '../../libs/data-access/src/index.ts'),
      '@ticketing/feature-auth': resolve(__dirname, '../../libs/features/auth/src/index.ts'),
      '@ticketing/feature-events': resolve(__dirname, '../../libs/features/events/src/index.ts'),
      '@ticketing/feature-booking': resolve(__dirname, '../../libs/features/booking/src/index.ts'),
      '@ticketing/feature-cart': resolve(__dirname, '../../libs/features/cart/src/index.ts'),
      '@ticketing/feature-checkout': resolve(__dirname, '../../libs/features/checkout/src/index.ts'),
      '@ticketing/feature-organizer': resolve(__dirname, '../../libs/features/organizer/src/index.ts'),
      '@ticketing/feature-admin': resolve(__dirname, '../../libs/features/admin/src/index.ts'),
      '@ticketing/feature-layout': resolve(__dirname, '../../libs/features/layout/src/index.ts'),
    },
  },
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
