import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// `npm run build` → production build (BrowserRouter, subpath-ready).
// `npm run build:preview` → portable static build (HashRouter, relative base) for
// hosts that cannot rewrite deep links to index.html.
export default defineConfig(({ mode }) => {
  const cliBase =
    process.argv.find((a) => a.startsWith('--base='))?.split('=')[1] ||
    (process.argv.indexOf('--base') !== -1 ? process.argv[process.argv.indexOf('--base') + 1] : undefined);
  const base = cliBase || process.env.VITE_BASE_PATH || process.env.BASE_URL || (mode === 'preview' ? './' : '/');

  return {
    base,
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    define: { __HASH_ROUTER__: JSON.stringify(mode === 'preview') },
    build: { target: 'es2020', cssCodeSplit: true },
  };
});
