@echo off
echo ========================================
echo    ScrapWale Website - Quick Start
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/2] Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    echo.
    echo Dependencies installed successfully!
    echo.
) else (
    echo Dependencies already installed.
    echo.
)

echo [2/2] Starting development server...
echo.
echo The website will open automatically in your browser.
echo Press Ctrl+C to stop the server.
echo.
echo ========================================
echo.

call npm start
