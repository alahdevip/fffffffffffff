@echo off
setlocal
cd /d "%~dp0"

title STALKEA AI - Control Center

echo ===================================================
echo   STALKEA AI - REINICIALIZACAO COMPLETA
echo ===================================================

echo [1/5] Verificando dependencias...
if not exist "node_modules\" (
    echo [!] node_modules nao encontrado. Instalando dependencias...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [X] Erro ao instalar dependencias. Verifique sua conexao e o Node.js.
        pause
        exit /b %ERRORLEVEL%
    )
    echo OK: Dependencias instaladas.
) else (
    echo OK: node_modules ja existe.
)

echo [2/5] Finalizando processos antigos para evitar conflitos...
taskkill /f /im node.exe >nul 2>&1
echo OK: Processos Node encerrados.

echo [3/5] Iniciando Sistema Completo (API + Frontend)...
start "Stalkea AI - FULL SYSTEM" cmd /c "color D && title STALKEA FULL SYSTEM && echo Iniciando API e Frontend... && npm run dev:full"

echo.
echo ===================================================
echo   SISTEMA ESTA SENDO INICIADO!
echo   Aguarde o carregamento no terminal e no navegador.
echo ===================================================
timeout /t 8 >nul
start http://localhost:3003

echo.
echo [!] Mantenha as janelas do Servidor e do Frontend abertas.
echo [!] Pressione qualquer tecla para encerrar este script de controle.
pause >nul
