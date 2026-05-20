import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Executa a cópia do logo de forma síncrona durante a inicialização do Vite
try {
  const sourcePath = 'c:/Users/lorenzo.antoneli/Desktop/logo-go.png'
  const destPath = path.resolve('src/assets/logo-go.png')
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath)
    console.log('Successfully copied logo-go.png to assets!')
  }
} catch (err) {
  console.error('Error copying logo file:', err)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
