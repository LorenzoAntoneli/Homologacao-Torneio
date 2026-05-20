const fs = require('fs');
const path = require('path');

const source = 'C:/Users/lorenzo.antoneli/Desktop/logo-go.png';
const dest = path.join(__dirname, 'frontend/src/assets/logo-go.png');

try {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log('Sucesso! O logo foi copiado para os arquivos do projeto em:');
    console.log(dest);
    console.log('Agora você pode commitá-lo e fazer o deploy no Netlify tranquilamente!');
  } else {
    console.error('Erro: Não encontramos o arquivo logo-go.png na Área de Trabalho.');
  }
} catch (err) {
  console.error('Erro ao copiar o arquivo:', err);
}
