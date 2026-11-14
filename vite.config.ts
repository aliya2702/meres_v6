import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// `npm run build` → production build (BrowserRouter, absolute base).
// `npm run build:preview` → portable static build (HashRouter, relative base) for
// hosts that cannot rewrite deep links to index.html.
export default defineConfig(({ mode }) => ({
  base: mode === 'preview' ? './' : '/meres_v6/',
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  define: { __HASH_ROUTER__: JSON.stringify(mode === 'preview') },
  build: { target: 'es2020', cssCodeSplit: true },
}));
