@echo off
setlocal
cd /d "%~dp0www"
echo Iniciando o jogo em http://localhost:8000
start "" http://localhost:8000
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8000
) else (
  python -m http.server 8000
)
pause
