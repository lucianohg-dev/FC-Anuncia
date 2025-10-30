import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    // ESSENCIAL para o deploy no GitHub Pages
    base: '/FC-Anuncia/', 
    
    plugins: [react()],
    
    // Mantenha esta parte se for importante para o seu desenvolvimento local
    server: {
        host: true, 
    },
})
