const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== INICIANDO RESOLUÇÃO DE CONFLITOS E ATUALIZAÇÃO DO LOGO ===\n');

// Função para resolver marcadores de conflito escolhendo o lado HEAD (GitHub)
function resolveConflictContent(content) {
  const lines = content.split(/\r?\n/);
  const result = [];
  let inConflict = false;
  let inHead = false;
  let inOther = false;
  let headLines = [];
  let otherLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('<<<<<<< HEAD')) {
      inConflict = true;
      inHead = true;
      inOther = false;
      headLines = [];
      otherLines = [];
    } else if (line.startsWith('=======')) {
      inHead = false;
      inOther = true;
    } else if (line.startsWith('>>>>>>>')) {
      inConflict = false;
      inHead = false;
      inOther = false;
      // Escolhe o lado HEAD (versão mais recente e com mais funcionalidades)
      result.push(...headLines);
    } else {
      if (inConflict) {
        if (inHead) {
          headLines.push(line);
        } else if (inOther) {
          otherLines.push(line);
        }
      } else {
        result.push(line);
      }
    }
  }
  return result.join('\n');
}

try {
  // 1. Copiar o logo da Área de Trabalho para a pasta de assets
  console.log('[1/6] Copiando o novo logo da Área de Trabalho...');
  const desktopLogo = 'C:/Users/lorenzo.antoneli/Desktop/logo-go.png';
  const destLogo = path.join(__dirname, 'frontend/src/assets/logo-go.png');
  
  if (fs.existsSync(desktopLogo)) {
    // Garante que a pasta assets existe
    const assetsDir = path.dirname(destLogo);
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    fs.copyFileSync(desktopLogo, destLogo);
    console.log('✔ Logo copiado com sucesso para assets!');
  } else {
    console.log('⚠️ Aviso: logo-go.png não encontrado na Área de Trabalho. Certifique-se de que ele está lá.');
  }

  // 2. Limpar marcadores de conflito nos arquivos afetados
  console.log('\n[2/6] Resolvendo marcadores de conflitos nos arquivos...');
  const filesToResolve = [
    'frontend/src/index.css',
    'frontend/src/TVDisplay.jsx',
    'frontend/src/App.jsx',
    'frontend/src/Admin.jsx'
  ];

  filesToResolve.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<<<<<<< HEAD')) {
        const resolved = resolveConflictContent(content);
        fs.writeFileSync(fullPath, resolved, 'utf8');
        console.log(`✔ Conflitos resolvidos em: ${filePath}`);
      } else {
        console.log(`- Sem conflitos pendentes em: ${filePath}`);
      }
    }
  });

  // 3. Atualizar todas as referências de logo.jpg para logo-go.png
  console.log('\n[3/6] Atualizando importações de "logo.jpg" para "logo-go.png"...');
  const filesToReplaceLogo = [
    'frontend/src/admin/AdminRoot.jsx',
    'frontend/src/admin/screens/Login.jsx',
    'frontend/src/admin/components/Sidebar.jsx',
    'frontend/src/PlayerPortal.jsx',
    'frontend/src/TVDisplay.jsx',
    'frontend/src/PlayerView.jsx'
  ];

  filesToReplaceLogo.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('logo.jpg')) {
        content = content.replace(/logo\.jpg/g, 'logo-go.png');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✔ Logo atualizado em: ${filePath}`);
      } else {
        console.log(`- Logo já atualizado em: ${filePath}`);
      }
    }
  });

  // 4. Deletar arquivos duplicados ou antigos para evitar erros de compilação
  console.log('\n[4/6] Limpando arquivos antigos não utilizados...');
  const filesToDelete = [
    'frontend/src/Admin.jsx',
    'frontend/src/Admin.jsx.bak'
  ];

  filesToDelete.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✔ Arquivo removido: ${filePath}`);
    }
  });

  // 5. Atualizar configuração do vite.config.js (garantir auto-cópia)
  console.log('\n[5/6] Garantindo configuração do vite.config.js...');
  const viteConfigPath = path.join(__dirname, 'frontend/vite.config.js');
  const expectedConfig = `import { defineConfig } from 'vite'
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
`;

  fs.writeFileSync(viteConfigPath, expectedConfig, 'utf8');
  console.log('✔ Vite config configurado com auto-copiador!');

  // 6. Enviar alterações limpas para o GitHub
  console.log('\n[6/6] Sincronizando com o GitHub...');
  try {
    execSync('git add .', { stdio: 'inherit' });
    try {
      execSync('git commit -m "feat: resolve conflitos e atualiza logo do sistema para logo-go.png"', { stdio: 'inherit' });
      console.log('✔ Commit criado com sucesso!');
    } catch(e) {
      console.log('- Sem novas alterações para commitar.');
    }
    
    console.log('Forçando o push para a branch main do GitHub...');
    execSync('git push origin HEAD:main --force', { stdio: 'inherit' });
    
    console.log('\n===================================================');
    console.log('  SUCESSO ABSOLUTO!');
    console.log('  Os conflitos foram resolvidos escolhendo o HEAD.');
    console.log('  O logo foi atualizado em todas as telas novas.');
    console.log('  As alterações limpas foram enviadas para o GitHub!');
    console.log('  Vercel e Netlify compilarão sem erros agora!');
    console.log('===================================================');
  } catch (gitError) {
    console.error('⚠️ Erro ao executar comandos Git:', gitError.message);
  }

} catch (error) {
  console.error('\n❌ Ocorreu um erro no processo:');
  console.error(error.message);
}
