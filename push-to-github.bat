@echo off
set "PATH=C:\Program Files\Git\cmd;%PATH%"
echo ===================================================
echo     Pushing updates to GitHub...
echo ===================================================
git add .
git commit -m "Fix UTF-8 BOM in vectorStore.json for Turbopack compatibility"
git push origin main
echo.
echo Successfully pushed to GitHub!
pause
