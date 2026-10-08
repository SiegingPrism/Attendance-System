from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
import time

class CameraSourceType(str, Enum):
    WEBCAM = "WEBCAM"
    RTSP = "RTSP"
    HTTP_STREAM = "HTTP_STREAM"
    SIMULATED = "SIMULATED"

class StartSessionRequest(BaseModel):
    class_id: str = Field(..., description="College class ID (e.g. cls-1)")
    camera_source: str = Field("0", description="Camera index ('0'), RTSP URL, or 'SIMULATED'")
    source_type: CameraSourceType = CameraSourceType.WEBCAM
    confidence_threshold: float = Field(0.75, ge=0.5, le=0.99)
    topic: Optional[str] = "YOLO11 Automated Attendance Lecture"

class StopSessionResponse(BaseModel):
    session_id: str
    class_id: str
    total_marked: int
    duration_seconds: float
    marked_students: List[Dict[str, Any]]

class StudentEnrollment(BaseModel):
    student_id: str
    name: str
    roll_number: str
    semester: int
    division: str
    avatar_url: Optional[str] = None
    embedding: Optional[List[float]] = None
    photo_base64: Optional[str] = None

class TrackedFaceTelemetry(BaseModel):
    track_id: int
    bbox: List[float]  # [x1, y1, x2, y2]
    confidence: float
    matched_student_id: Optional[str] = None
    matched_student_name: Optional[str] = None
    match_score: Optional[float] = None
    is_verified: bool = False
    head_pose: Optional[Dict[str, float]] = None  # yaw, pitch, roll
    first_seen: float
    consecutive_hits: int

class SystemStatus(BaseModel):
    backend: str = "YOLO11 + ByteTrack Attendance Engine"
    version: str = "1.0.0"
    fps: float
    frame_latency_ms: float
    active_session_id: Optional[str] = None
    active_class_id: Optional[str] = None
    active_tracks_count: int
    total_marked_today: int
    camera_source: str
    loaded_models: Dict[str, str]
