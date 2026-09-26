"""Internal HTTP boundary: product API never allocates GPU memory."""
import base64
import io
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError


class RemotePoseEngine:
    def __init__(self, origin):
        self.origin = origin.rstrip("/")
        self.fp16_enabled = False
        self.load_error = None

    def is_ready(self):
        try:
            with urlopen(self.origin + "/health", timeout=2) as response:
                health = json.load(response)
            self.fp16_enabled = health.get("fp16_enabled") is True
            return health.get("engine_ready") is True
        except (OSError, ValueError):
            self.fp16_enabled = False
            return False

    def predict(self, image):
        buffer = io.BytesIO()
        image.save(buffer, "JPEG", quality=95)
        body = json.dumps({"image": base64.b64encode(buffer.getvalue()).decode(), "max_persons": 10}).encode()
        try:
            with urlopen(Request(self.origin + "/api/pose/analyze", data=body, headers={"Content-Type": "application/json"}), timeout=5) as response:
                return json.load(response)["persons"]
        except HTTPError as exc:
            if exc.code == 429:
                raise BlockingIOError("GPU busy") from exc
            raise RuntimeError("GPU service unavailable") from exc
