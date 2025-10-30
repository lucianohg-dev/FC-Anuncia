// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/FC-Anuncia/', // Mantém o prefixo para o deploy do GitHub Pages
  
  // 💥 CONFIGURAÇÃO CRÍTICA PARA ACESSO REMOTO
  server: {
    host: '0.0.0.0', // Faz o servidor escutar em todas as interfaces de rede
    port: 5173      // Mantém a porta padrão ou a que você usa
  }
});