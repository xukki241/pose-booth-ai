import base64
import io
import os
import unittest
from unittest.mock import patch
from PIL import Image
from pydantic import ValidationError
from config import Settings
from routers.score import KeypointInput
from services.images import decode_image
from services.scoring import score_pose_pair


class SafetyTests(unittest.TestCase):
    def test_invalid_environment_defaults(self):
        for key, value in [("AI_PROFILE", "bogus"), ("CONF_THRESHOLD", "2"), ("STUDIO_MAX_PERSONS", "0")]:
            with self.subTest(key=key), patch.dict(os.environ, {key: value}):
                with self.assertRaises(ValidationError):
                    Settings()

    def test_invalid_keypoints(self):
        for value in [float("nan"), float("inf")]:
            with self.assertRaises(ValidationError):
                KeypointInput(x=value, y=0)
        with self.assertRaises(ValidationError):
            KeypointInput(x=0, y=0, confidence=2)

    def test_red_stays_red(self):
        image = Image.new("RGB", (2, 2), "red")
        stream = io.BytesIO()
        image.save(stream, "PNG")
        decoded = decode_image(base64.b64encode(stream.getvalue()).decode())
        self.assertEqual(decoded.getpixel((0, 0)), (255, 0, 0))

    def test_invalid_image(self):
        for value in ["%%%", "", base64.b64encode(b"not an image").decode()]:
            with self.assertRaises(ValueError):
                decode_image(value)

    def test_invisible_target_does_not_score(self):
        user = [{"x": 0.5, "y": 0.5, "confidence": 1}] * 17
        target = [{"x": 0.5, "y": 0.5, "confidence": 0}] * 17
        self.assertEqual(score_pose_pair(user, target)["score"], 0)


if __name__ == "__main__":
    unittest.main()
