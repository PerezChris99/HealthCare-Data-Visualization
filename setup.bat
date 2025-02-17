@echo off

echo Creating virtual environment...
python -m venv env

echo Activating virtual environment...
env\Scripts\activate

echo Installing backend dependencies...
pip install -r backend\requirements.txt

echo Setup complete!
pause