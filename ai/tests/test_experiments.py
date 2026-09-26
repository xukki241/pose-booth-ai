import json
import tempfile
import unittest
from pathlib import Path
from PIL import Image
from ai.research.data import inventory, release
from ai.research.experiments import compare, dataset_config, train


class ExperimentGuards(unittest.TestCase):
    def test_dry_run_and_reject_yaml_execution_hooks(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); raw = root / 'raw'; labels = root / 'labels'
            raw.mkdir(); labels.mkdir()
            Image.new('RGB', (8, 8), 'blue').save(raw / 'image.png')
            (labels / 'image.txt').write_text('0 0.5 0.5 1 1 ' + ' '.join(['0.5 0.5 2'] * 17))
            meta = root / 'metadata.jsonl'
            meta.write_text(json.dumps({'path': 'image.png', 'source': 'synthetic test', 'rights_ref': 'generated',
                'training_allowed': True, 'subject_id': 'a', 'session_id': '1', 'annotation_reviewed': True, 'annotation_version': '1'}))
            release(inventory(raw, meta), labels, root / 'v1', smoke=True)
            dataset = root / 'v1/dataset.yaml'
            # Dry-run hashes a fixture checkpoint but must never load it as pickle/model.
            model = root / 'fixture.pt'; model.write_bytes(b'not a model; dry-run only')
            planned = train(model, dataset, root / 'run', execute=False)
            self.assertFalse(planned['executed'])
            self.assertFalse((root / 'run').exists())
            dataset.write_text(dataset.read_text() + '\ndownload: "exec should never run"\n')
            with self.assertRaises(ValueError): dataset_config(dataset)

    def test_compare_requires_same_protocol(self):
        baseline = {'dataset': {'manifest_sha256': 'a', 'smoke_only': False}, 'split': 'val', 'imgsz': 640, 'pose_map50_95': .5}
        result = compare(baseline, {**baseline, 'pose_map50_95': .6})
        self.assertAlmostEqual(result['pose_map50_95_delta'], .1)
        self.assertFalse(result['production_approved'])
        with self.assertRaises(ValueError): compare(baseline, {**baseline, 'split': 'test'})


if __name__ == '__main__': unittest.main()
