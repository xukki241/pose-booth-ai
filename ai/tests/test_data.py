import json
import tempfile
import unittest
import zipfile
from pathlib import Path
from PIL import Image
from ai.research.data import connected_groups, inventory, release, safe_extract, validate_yolo_pose


class DataTests(unittest.TestCase):
    def test_transitive_subject_and_session_groups(self):
        rows = [{"subject_id": "a", "session_id": "1"}, {"subject_id": "b", "session_id": "1"}, {"subject_id": "b", "session_id": "2"}]
        self.assertEqual(len(connected_groups(rows)), 1)

    def test_zip_traversal_rejected_before_extract(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with zipfile.ZipFile(root / "bad.zip", "w") as z:
                z.writestr("good.jpg", b"x")
                z.writestr("../escape", b"bad")
            with self.assertRaises(ValueError):
                safe_extract(root / "bad.zip", root / "output")
            self.assertFalse((root / "output").exists())
            self.assertFalse((root / "escape").exists())

    def test_no_rights_is_quarantine(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            Image.new("RGB", (8, 8), "red").save(root / "a.png")
            report = inventory(root)
            self.assertEqual(report["images"][0]["status"], "quarantine")

    def test_release_reproducible_and_immutable(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            images, labels = root / "raw", root / "labels"
            images.mkdir(); labels.mkdir()
            meta = []
            for i, color in enumerate(("red", "green", "blue", "white", "black")):
                Image.new("RGB", (8, 8), color).save(images / f"{i}.png")
                (labels / f"{i}.txt").write_text("0 0.5 0.5 1 1 " + " ".join(["0.5 0.5 2"] * 17))
                meta.append({"path": f"{i}.png", "source": "test fixture", "training_allowed": True,
                             "rights_ref": "generated", "annotation_reviewed": True, "annotation_version": "1",
                             "subject_id": str(i), "session_id": str(i)})
            metadata = root / "metadata.jsonl"
            metadata.write_text("\n".join(json.dumps(r) for r in meta))
            manifest = inventory(images, metadata)
            first = release(manifest, labels, root / "v1")
            second = release(manifest, labels, root / "v2")
            self.assertEqual(first, second)
            self.assertEqual({r["split"] for r in first["images"]}, {"train", "val", "test"})
            with self.assertRaises(ValueError):
                release(manifest, labels, root / "v1")
            manifest["images"][0]["annotation_reviewed"] = False
            with self.assertRaises(ValueError):
                release(manifest, labels, root / "v3")

    def test_nan_label_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            label = Path(directory) / "a.txt"
            label.write_text("0 0.5 0.5 1 1 " + " ".join(["nan 0.5 2"] * 17))
            self.assertTrue(validate_yolo_pose(label))


if __name__ == "__main__":
    unittest.main()
