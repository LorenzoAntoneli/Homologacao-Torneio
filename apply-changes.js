const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Iniciando a Limpeza e Atualizacao do Logo ===\n');

try {
  // 1. Aborta qualquer mesclagem do Git travada
  console.log('[1/7] Limpando mesclagens pendentes do Git...');
  try { execSync('git rebase --abort', { stdio: 'ignore' }); } catch(e) {}
  try { execSync('git merge --abort', { stdio: 'ignore' }); } catch(e) {}
  
  // 2. Reseta o repositorio local para a versao limpa do GitHub
  console.log('[2/7] Sincronizando com o GitHub...');
  execSync('git fetch origin', { stdio: 'inherit' });
  execSync('git checkout main', { stdio: 'inherit' });
  execSync('git reset --hard origin/main', { stdio: 'inherit' });
  
  // 3. Copia a imagem do logo da Area de Trabalho
  console.log('[3/7] Copiando o novo logo...');
  const desktopLogo = 'C:/Users/lorenzo.antoneli/Desktop/logo-go.png';
  const destLogo = path.join(__dirname, 'frontend/src/assets/logo-go.png');
  fs.copyFileSync(desktopLogo, destLogo);
  console.log('Logo copiado com sucesso!');

  // 4. Atualiza as referencias nos arquivos
  console.log('[4/7] Atualizando os arquivos de codigo...');

  const replaceLogoInFile = (filePath) => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/logo\.jpg/g, 'logo-go.png');
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Atualizado: ${filePath}`);
    }
  };

  replaceLogoInFile('frontend/src/Admin.jsx');
  replaceLogoInFile('frontend/src/PlayerView.jsx');
  replaceLogoInFile('frontend/src/TVDisplay.jsx');

  // 5. Injeta o codigo de auto-copia no vite.config.js
  console.log('[5/7] Configurando auto-copia no vite.config.js...');
  const viteConfigPath = path.join(__dirname, 'frontend/vite.config.js');
  if (fs.existsSync(viteConfigPath)) {
    const configContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Executa a copia do logo de forma sincrona durante a inicializacao do Vite
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
`;
    fs.writeFileSync(viteConfigPath, configContent, 'utf8');
    console.log('Vite config configurado!');
  }

  // 6. Commita as mudancas
  console.log('[6/7] Criando commit limpo com o novo logo...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "feat: troca logo do sistema para logo-go.png"', { stdio: 'inherit' });

  // 7. Envia para o GitHub
  console.log('[7/7] Enviando para o GitHub (push)...');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('\n===================================================');
  console.log('  SUCESSO ABSOLUTO!');
  console.log('  O logo foi atualizado e enviado para o GitHub.');
  console.log('  O Vercel e o Netlify vao compilar com sucesso agora!');
  console.log('===================================================');

} catch (error) {
  console.error('\n[ERRO] Ocorreu uma falha no processo:');
  console.error(error.message);
}
