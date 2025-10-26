<<<<<<< HEAD
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
    plugins: [react()],
    server: {
        host: true, 
    },
});
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
   base: '/Anuncia-FC/',
  plugins: [react()],
})
>>>>>>> 62a59e325edfe376931a8777da984985a91909aa
