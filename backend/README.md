# AttendPulse YOLO11 + ByteTrack AI Backend

Enterprise computer vision microservice for multi-student automated facial attendance using **Ultralytics YOLO11**, **ByteTrack Multi-Object Tracking**, and **Zero-Latency Pipeline Buffer Flushing**.

---

## 🌟 Key Architecture & Capabilities

1. **YOLO11 Face Detection:**
   - Detects all student faces across varying distances (front row to back row) in a single pass.
   - Ultra-fast inference with native TensorRT, PyTorch, or ONNX runtimes.

2. **ByteTrack Multi-Object Tracking:**
   - Assigns persistent `Track ID`s (Track #1, Track #2, etc.) to each detected student.
   - Overcomes brief occlusions, hand gestures, and head turns using Kalman filter state prediction.
   - **Performance optimization:** Once a student's face is verified, recognition only runs once, saving 90%+ computational resources.

3. **Zero-Latency Pipeline Flushing:**
   - Dedicated threaded reader continually drains the camera socket buffer (`maxsize=1`).
   - Guarantees the vision engine always processes the freshest real-time frame with 0 ms buffer latency.

4. **Classroom Camera Ingestion:**
   - Local webcams (`source="0"`)
   - College IP / CCTV ceiling cameras (`rtsp://admin:pass@192.168.1.50:554/stream1`)
   - High-fidelity simulated multi-student classroom feed (`source="SIMULATED"`)

---

## 🚀 Quick Start

### Option A: Using `uv` (Recommended - Ultra Fast)
```bash
cd backend
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Option B: Using Standard Python
```bash
cd backend
chmod +x run_backend.sh
./run_backend.sh
```

The server will start at:
- **API Base:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **Live Video MJPEG Feed:** `http://localhost:8000/api/streams/video_feed`
- **WebSocket Telemetry:** `ws://localhost:8000/ws/live`

---

## 📡 REST & WebSocket API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System status, FPS, frame latency, active track count |
| `POST` | `/api/sessions/start` | Start attendance session for a class ID and camera source |
| `POST` | `/api/sessions/stop` | End active session and retrieve marked students list |
| `GET` | `/api/sessions/active` | Current active lecture session & marked counts |
| `POST` | `/api/students/enroll` | Enroll student face descriptor into the gallery |
| `GET` | `/api/students` | List all enrolled student profiles |
| `GET` | `/api/streams/video_feed` | Multipart MJPEG stream with overlaid ByteTrack boxes |
| `WebSocket` | `/ws/live` | 30 FPS telemetry stream for the React dashboard |

---

## 📹 Connecting Physical RTSP Ceiling Cameras

To connect a ceiling camera in a lecture hall:
```json
POST /api/sessions/start
{
  "class_id": "cls-1",
  "camera_source": "rtsp://admin:admin123@192.168.1.120:554/h264Preview_01_main",
  "confidence_threshold": 0.75,
  "topic": "CS301 Database Systems"
}
```
The backend will immediately connect to the RTSP camera stream, flush internal buffers, and begin marking student attendance.
