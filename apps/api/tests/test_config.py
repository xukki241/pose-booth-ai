import importlib
import os
import unittest
from unittest.mock import patch


class SettingsEnvironmentTests(unittest.TestCase):
    def _reload_config(self, values: dict[str, str]):
        with patch.dict(os.environ, values, clear=False):
            import config

            return importlib.reload(config)

    def test_studio_environment_is_bound(self):
        config = self._reload_config(
            {
                "AI_PROFILE": "studio",
                "MODEL_PATH": "C:/models/yolov8x-pose.pt",
                "DEVICE": "cuda:0",
                "USE_FP16": "true",
                "STUDIO_IMG_SIZE": "768",
                "STUDIO_MAX_PERSONS": "4",
                "DEBUG": "false",
                "CORS_ORIGINS": "http://localhost:3000,http://127.0.0.1:3000",
            }
        )

        self.assertEqual(config.settings.AI_PROFILE, "studio")
        self.assertEqual(config.settings.MODEL_PATH, "C:/models/yolov8x-pose.pt")
        self.assertEqual(config.settings.DEVICE, "cuda:0")
        self.assertTrue(config.settings.USE_FP16)
        self.assertEqual(config.settings.STUDIO_IMG_SIZE, 768)
        self.assertEqual(config.settings.STUDIO_MAX_PERSONS, 4)
        self.assertFalse(config.settings.DEBUG)
        self.assertEqual(len(config.settings.CORS_ORIGINS), 2)

    def test_invalid_boolean_is_rejected(self):
        with patch.dict(os.environ, {"USE_FP16": "sometimes"}, clear=False):
            with self.assertRaises(ValueError):
                import config

                importlib.reload(config)


if __name__ == "__main__":
    unittest.main()
