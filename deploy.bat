@echo off
echo ===================================================
echo   Inicializando Git e Enviando para o GitHub
echo ===================================================
echo.

:: 1. Copia o logo da Área de Trabalho para o local correto
echo [1/5] Copiando o logo para assets...
copy "C:\Users\lorenzo.antoneli\Desktop\logo-go.png" "frontend\src\assets\logo-go.png" /Y

echo [OK] Logo copiado com sucesso!
echo.

:: 2. Inicializa o repositório Git se não existir
if not exist ".git" (
    echo [2/5] Inicializando repositorio Git...
    git init
    git branch -M main
    echo [OK] Git inicializado!
) else (
    echo [2/5] Git ja esta inicializado!
)
echo.

:: 3. Configura o remote origin
echo [3/5] Configurando o repositorio remoto do GitHub...
:: Remove origin se ja existir para evitar conflitos, depois adiciona
git remote remove origin >nul 2>&1
git remote add origin https://github.com/LorenzoAntoneli/Homologacao-Torneio.git
echo [OK] Repositorio remoto vinculado!
echo.

:: 4. Adiciona e faz commit
echo [4/5] Criando commit com os arquivos...
git add .
git commit -m "feat: atualiza logo do sistema para logo-go.png"
echo.

:: 5. Envia para o GitHub
echo [5/5] Enviando para o GitHub (push)...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo   SUCESSO! O projeto foi enviado para o GitHub!
    echo   Link: https://github.com/LorenzoAntoneli/Homologacao-Torneio
    echo   O Netlify iniciara o deploy automaticamente.
    echo ===================================================
) else (
    echo.
    echo [ERRO] Ocorreu um erro ao fazer o push para o GitHub.
    echo Verifique sua conexao e credenciais do Git.
)

echo.
pause
