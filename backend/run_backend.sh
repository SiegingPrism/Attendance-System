#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

export PATH="$HOME/.local/bin:$PATH"

echo "=========================================================="
echo " Starting AttendPulse YOLO11 + ByteTrack AI Backend Server"
echo "=========================================================="

# Check if uv or python3 is available
if command -v uv &> /dev/null; then
    echo "[Info] Using uv with Python 3.10 virtual environment..."
    if [ ! -d ".venv" ]; then
        uv venv --python 3.10 .venv
        uv pip install -r requirements.txt
    fi
    source .venv/bin/activate
    uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
elif command -v python3 &> /dev/null; then
    if [ ! -d "venv" ]; then
        echo "[Info] Setting up python3 virtual environment..."
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi
    python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "[Error] python3 or uv not found. Please install Python 3.9+."
    exit 1
fi
