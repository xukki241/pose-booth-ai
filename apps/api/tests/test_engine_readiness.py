import unittest
from unittest.mock import patch, MagicMock

from core.engine import YOLOv8PoseEngine


class EngineReadinessTests(unittest.TestCase):
    def test_cuda_request_is_not_reported_ready_without_cuda(self):
        with (
            patch("core.engine.settings.DEVICE", "cuda:0"),
            patch("core.engine.HAS_TORCH_YOLO", True),
            patch("core.engine.torch", MagicMock(cuda=MagicMock(is_available=MagicMock(return_value=False)))),
        ):
            engine = YOLOv8PoseEngine()

        self.assertFalse(engine.is_ready())
        self.assertIn("CUDA device requested", engine.load_error or "")

    def test_missing_dependencies_are_not_ready(self):
        with patch('core.engine.HAS_TORCH_YOLO', False):
            engine = YOLOv8PoseEngine()
        self.assertFalse(engine.is_ready())
        self.assertFalse(engine.fp16_enabled)


if __name__ == "__main__":
    unittest.main()
