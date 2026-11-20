@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PY=D:\Users\YsF\anaconda3\envs\shiftflow\python.exe"
if not exist "%PY%" set "PY=%USERPROFILE%\anaconda3\python.exe"
echo Python: %PY%
"%PY%" kontrol.py
echo.
echo Bitti. Pencereyi kapatabilirsin.
pause
