import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// "npm run dev:https" liga HTTPS local (modo https): libera o microfone ao abrir pelo IP da rede.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'https' ? [basicSsl()] : [])],
  // host: true faz o servidor aceitar localhost e 127.0.0.1 (IPv4 e IPv6).
  server: { host: true, port: 5173 },
  // Railway: o preview serve o build em 0.0.0.0:$PORT e aceita o dominio gerado (*.up.railway.app).
  preview: { host: true, allowedHosts: true },
}))