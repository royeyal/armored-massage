import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      // src/index.html is the dev playground only — naming main.js as the sole
      // input keeps it out of dist, so nothing but the bundle ships.
      input: {
        main: resolve(__dirname, 'src/main.js'),
      },
      output: {
        entryFileNames: 'assets/main.[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/main.[hash].css';
          }
          return 'assets/[name].[hash][extname]';
        },
      },
      // GSAP and its plugins come from Webflow's own script tags as globals.
      // Bundling them would ship a second copy of GSAP and, worse, a second
      // ScrollTrigger instance that does not share the first one's scroll state.
      external: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText'],
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    sourcemap: false,
    // The Worker reads this manifest to map /main.js -> assets/main.<hash>.js.
    manifest: true,
    target: 'es2015',
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    open: true,
  },
});
