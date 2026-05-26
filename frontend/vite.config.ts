import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const frontendPort = Number(process.env.FRONTEND_PORT || 8080);
  const backendProxyTarget = process.env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:3001';
  const enableSourceMap = process.env.VITE_ENABLE_SOURCEMAP === 'true';

  return {
    server: {
      host: '::',
      port: frontendPort,
      hmr: {
        overlay: false,
      },
      proxy: {
        '/api': backendProxyTarget,
      },
    },
    preview: {
      host: '0.0.0.0',
      port: frontendPort,
    },
    plugins: [react(), splitVendorChunkPlugin(), mode === 'development' && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'es2020',
      sourcemap: enableSourceMap,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined;
            }

            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor';
            }

            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }

            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui-vendor';
            }

            return 'vendor';
          },
        },
      },
    },
  };
});
