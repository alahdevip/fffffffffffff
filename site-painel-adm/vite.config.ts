import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente do nível atual
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.PORT) || 3006, // Usa a porta do .env ou 3006 como padrão
      host: true // Permite acesso via IP na rede local
    },
    build: {
      chunkSizeWarningLimit: 1000,
    }
  };
});
