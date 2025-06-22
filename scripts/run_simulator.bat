@echo off
echo Landslide Early Warning System - Data Simulator
echo ===============================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Install requirements if needed
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing requirements...
pip install -r requirements.txt

echo.
echo Available commands:
echo.
echo 1. Test all risk levels: python simulate_data.py --mode test
echo 2. Single reading (aman): python simulate_data.py --risk aman --mode single
echo 3. Single reading (awas): python simulate_data.py --risk awas --mode single
echo 4. Single reading (waspada): python simulate_data.py --risk waspada --mode single
echo 5. Continuous aman: python simulate_data.py --risk aman --mode continuous --interval 5
echo 6. Continuous awas: python simulate_data.py --risk awas --mode continuous --interval 5
echo 7. Continuous waspada: python simulate_data.py --risk waspada --mode continuous --interval 5
echo.

REM Ask user for choice
set /p choice="Enter your choice (1-7) or press Enter for help: "

if "%choice%"=="1" (
    python simulate_data.py --mode test
) else if "%choice%"=="2" (
    python simulate_data.py --risk aman --mode single
) else if "%choice%"=="3" (
    python simulate_data.py --risk awas --mode single
) else if "%choice%"=="4" (
    python simulate_data.py --risk waspada --mode single
) else if "%choice%"=="5" (
    python simulate_data.py --risk aman --mode continuous --interval 5
) else if "%choice%"=="6" (
    python simulate_data.py --risk awas --mode continuous --interval 5
) else if "%choice%"=="7" (
    python simulate_data.py --risk waspada --mode continuous --interval 5
) else (
    echo.
    echo Usage examples:
    echo   python simulate_data.py --mode test
    echo   python simulate_data.py --risk aman --mode single
    echo   python simulate_data.py --risk awas --mode continuous --interval 3
    echo   python simulate_data.py --risk waspada --mode continuous --duration 60
    echo.
    echo Risk levels: aman (safe), awas (watch), waspada (alert)
    echo Modes: single, continuous, test
)

pause
