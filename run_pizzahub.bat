@echo off
title Pizza Hub - Production Server
echo ===================================================
echo               PIZZA HUB PRODUCTION SERVER
echo ===================================================
echo.
echo Starting Django Backend with Integrated React SPA...
echo Application URL: http://127.0.0.1:8000
echo Admin Portal:    http://127.0.0.1:8000/admin
echo.
cd /d "%~dp0\backend"
python manage.py runserver 127.0.0.1:8000
pause
