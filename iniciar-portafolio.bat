@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo Iniciando el portafolio en http://localhost:5173 ...
start "" http://localhost:5173
node portafolio\server.js
