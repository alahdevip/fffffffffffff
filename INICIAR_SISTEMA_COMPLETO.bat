@echo off
title STALKEA AI - SISTEMA COMPLETO
color 0B
cls

echo ==================================================
echo           STALKEA.AI - PAINEL DE CONTROLE
echo ==================================================
echo.
echo  [!] Preparando ambiente...
echo.

:: Matar processos antigos para evitar erro de porta (3003, 3005 e 3006)
echo  [1/4] Liberando portas do sistema...
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3003).OwningProcess -Force" 2>nul
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3005).OwningProcess -Force" 2>nul
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3006).OwningProcess -Force" 2>nul

echo  [2/4] Iniciando SERVIDOR DE DADOS (Porta 3005)...
start /min "API STALKEA" cmd /c "node server.js"

echo  [3/4] Iniciando PAINEL ADMINISTRATIVO (Porta 3006)...
start /min "ADMIN STALKEA" cmd /c "cd site-painel-adm && npm run dev"

echo  [4/4] Iniciando INTERFACE DO SITE (Porta 3003)...
echo.
echo  --------------------------------------------------
echo    O SITE ABRIRA EM SEU NAVEGADOR EM ALGUNS SEGUNDOS
echo    MANTENHA ESTA JANELA ABERTA PARA FUNCIONAR
echo    - Site: http://localhost:3003
echo    - Admin: http://localhost:3006
echo  --------------------------------------------------
echo.

:: Inicia o Vite (Frontend)
npm run dev

