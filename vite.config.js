import { defineConfig } from 'vite';
import { resolve } from 'path';
import yaml from '@rollup/plugin-yaml';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [yaml(), cssInjectedByJsPlugin()],
  build: {
    outDir: 'dist-lib',
    
    lib: {
      entry: resolve(__dirname, 'src/lib/cookieconsent.js'),
      name: 'CookieConsent', 
      formats: ['iife'], 
      fileName: () => 'cookieconsent.js'
    },
    copyPublicDir: false,
  }
});
