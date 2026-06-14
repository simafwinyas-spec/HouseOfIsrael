@echo off
title House of Israel Assembly — Website Server
color 0A
cls

echo.
echo  ============================================================
echo     HOUSE OF ISRAEL ASSEMBLY — WEBSITE SERVER
echo  ============================================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed!
    echo.
    echo  Please install Node.js from: https://nodejs.org
    echo  Download the LTS version and install it.
    echo.
    pause
    exit /b 1
)

echo  Node.js detected. Checking dependencies...
echo.

:: Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo  Installing dependencies (first time only, please wait)...
    echo.
    npm install
    echo.
)

echo  ============================================================
echo   Website:    http://localhost:3000
echo   Admin:      http://localhost:3000/admin
echo   Username:   admin
echo   Password:   hoisrael2025
echo  ============================================================
echo.
echo  Press Ctrl+C to stop the server
echo.

node server.js

pause
