@echo off
echo ===================================================
echo   Sincronizando Restauracao com o GitHub
echo ===================================================
echo.

echo [1/2] Adicionando arquivos e criando commit...
git add .
git commit -m "chore: restaura vite.config.js e atualiza logo" >nul 2>&1
echo [OK] Commit criado!
echo.

echo [2/2] Enviando atualizacoes para o GitHub...
git push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo   TUDO PRONTO! O projeto foi atualizado com sucesso!
    echo   Link: https://github.com/LorenzoAntoneli/Homologacao-Torneio
    echo ===================================================
) else (
    echo.
    echo [AVISO] Se o push falhar por conta do historico, use o forcar-push novamente.
)

echo.
pause
