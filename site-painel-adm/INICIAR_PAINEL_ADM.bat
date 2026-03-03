@echo off
title PAINEL ADM - Stalkea AI (Dev Mode)
color 0a

echo ====================================================
echo      INICIANDO PAINEL ADMINISTRATIVO (DEV)
echo ====================================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo [AVISO] Dependencias nao encontradas. Instalando...
    call npm install
)

echo.
echo [INFO] Iniciando servidor de desenvolvimento...
echo.
call npm run dev

pause