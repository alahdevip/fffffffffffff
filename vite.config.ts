import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProd = mode === 'production';

  return {
    server: {
      port: 3003,
      host: '0.0.0.0',
      // ⚡ HMR otimizado para dev fluido
      hmr: { overlay: false },
      proxy: {
        '/api': {
          target: `http://localhost:${env.API_PORT || 3005}`,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    // ⚡ esbuild: transpile JSX mais rápido (substitui babel em dev)
    esbuild: {
      // Remove console.log/warn/error em produção para melhor performance
      drop: isProd ? ['console', 'debugger'] : [],
      // Target moderno = código menor = carregamento mais rápido
      target: 'es2020',
    },
    plugins: [
      react({
        // ⚡ Babel somente para as features que esbuild não suporta
        babel: {
          plugins: [
            // Sem plugins extras = build mais rápido
          ]
        }
      })
    ],
    build: {
      // ⚡ Target moderno: browser atual = menos polyfills = bundle menor
      target: 'es2020',
      // ⚡ esbuild minificação (3-4x mais rápido que terser)
      minify: 'esbuild',
      // ⚡ CSS code split: CSS carregado paralelo ao JS
      cssCodeSplit: true,
      // ⚡ Source maps só em dev
      sourcemap: !isProd,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          // ⚡ Chunks otimizados: carregamento paralelo de dependências
          manualChunks: (id) => {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'ui-icons';
            }
            if (id.includes('node_modules/recharts')) {
              return 'charts';
            }
            if (id.includes('@ffmpeg')) {
              return 'ffmpeg-core';
            }
            if (id.includes('node_modules/@supabase')) {
              return 'supabase';
            }
          },
          // ⚡ Nomes com hash para cache perfeito
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
        },
      },
      chunkSizeWarningLimit: 1500,
      // ⚡ Reportar tamanho comprimido para análise
      reportCompressedSize: false, // Desabilitar para build mais rápido
    },
    // ⚡ Otimização de depêndencias: pre-bundle em dev
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
      esbuildOptions: {
        target: 'es2020',
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.ADMIN_PASSWORD': JSON.stringify(env.ADMIN_PASSWORD),
      'process.env.FB_PIXEL_ID': JSON.stringify(env.FB_PIXEL_ID),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
