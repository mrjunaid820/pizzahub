@echo off
title Pizza Hub - Full Dev Environment
echo ===================================================
echo             PIZZA HUB FULL DEV ENVIRONMENT
echo ===================================================
echo.
echo Launching Django REST API on port 8000...
start "Pizza Hub Django Backend (Port 8000)" cmd /k "cd /d %~dp0\backend && python manage.py runserver 127.0.0.1:8000"

echo Launching Vite React Frontend on port 5173...
start "Pizza Hub React Frontend (Port 5173)" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo ===================================================
echo Services successfully started:
echo - Frontend Development (HMR): http://localhost:5173
echo - Backend API & Integrated UI: http://127.0.0.1:8000
echo - Staff Operations Portal:     http://localhost:5173/admin
echo - Django Admin Site:           http://127.0.0.1:8000/django-admin
echo ===================================================
echo.
