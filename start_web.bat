@echo off
cd /d "%~dp0"
echo Dang khoi dong Web Nhat Ky...
start "" http://localhost:9999
node server.js
pause