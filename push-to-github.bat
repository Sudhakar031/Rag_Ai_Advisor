@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo     HireKo -> GitHub Instant Push Tool
echo ===================================================
echo.

set "PATH=C:\Program Files\Git\cmd;%PATH%"

set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/hireko.git): "

if "%REPO_URL%"=="" (
    echo Error: No repository URL provided!
    pause
    exit /b 1
)

echo.
echo [1/4] Staging files...
git add .

echo [2/4] Committing changes...
git commit -m "Complete HireKo AI Product Advisor with 17 competitors"

echo [3/4] Setting main branch...
git branch -M main

echo [4/4] Setting remote and pushing to GitHub...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git push -u origin main --force

echo.
echo ===================================================
echo     Successfully pushed all files to GitHub!
echo ===================================================
pause
