"""Exercise the local gateway with generated pixels only; never reads customer photos."""
import argparse
import base64
import io
import json
import time
import urllib.request
import urllib.error
from uuid import uuid4
from PIL import Image


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--origin', default='http://localhost:8080')
    args = parser.parse_args()
    def request(path, body=None, token=None):
        headers = {'Content-Type': 'application/json'}
        if token: headers['Authorization'] = 'Bearer ' + token
        req = urllib.request.Request(args.origin + path, data=json.dumps(body).encode() if body is not None else None, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                data = response.read()
                return response.status, json.loads(data) if 'application/json' in response.headers.get('Content-Type', '') else data
        except urllib.error.HTTPError as error:
            return error.code, None
    _, health = request('/health')
    assert health['engine_ready'] and health['fp16_enabled'], health
    print('PASS GPU readiness:', health)
    buf = io.BytesIO(); Image.new('RGB', (96, 128), (150, 30, 70)).save(buf, 'PNG')
    image = base64.b64encode(buf.getvalue()).decode()
    status, analysis = request('/api/pose/analyze', {'image': image})
    assert status == 200 and 'persons' in analysis, (status, analysis)
    print('PASS inference on synthetic non-person fixture; not an accuracy benchmark')
    keypoints = [{'x': 0.5, 'y': i / 20, 'confidence': 0.9} for i in range(17)]
    assert request('/api/pose/score', {'user_keypoints': keypoints, 'target_keypoints': keypoints})[0] == 200
    assert request('/api/pose/suggest')[0] == 200
    assert request('/api/v1/admin/status', token='invalid')[0] == 403
    status, first = request('/api/v1/sessions', {})
    assert status == 200
    status, second = request('/api/v1/sessions', {})
    assert status == 200
    try:
        body = {'image': image, 'client_key': str(uuid4())}
        status, asset = request('/api/v1/assets', body, first['token'])
        assert status == 200, (status, asset)
        repeated = request('/api/v1/assets', body, first['token'])[1]
        assert repeated['id'] == asset['id'], 'idempotency failure'
        assert request('/api/v1/assets/' + asset['id'], token=second['token'])[0] == 404, 'IDOR'
        assert request('/api/v1/assets/' + asset['id'], token=first['token'])[0] == 200
        deadline = time.monotonic() + 30
        while time.monotonic() < deadline:
            status, job = request('/api/v1/jobs/' + asset['job_id'], token=first['token'])
            assert status == 200
            if job['status'] in {'succeeded', 'failed'}: break
            time.sleep(.5)
        assert job['status'] == 'succeeded', job
        assert request('/api/v1/assets/' + asset['id'] + '?thumbnail=true', token=first['token'])[0] == 200
        assert request('/api/v1/share/qr', {}, first['token'])[0] == 200
        assert request('/api/v1/gallery', token=first['token'])[1]['training_allowed'] is False
        request('/api/v1/session/revoke', {}, first['token'])
        assert request('/api/v1/assets/' + asset['id'], token=first['token'])[0] == 404
        print('PASS persistence, idempotency, cross-session isolation, RabbitMQ thumbnail, QR, revocation')
    finally:
        request('/api/v1/session/revoke', {}, first['token'])
        request('/api/v1/session/revoke', {}, second['token'])
    print('Generated test sessions revoked; worker removes fixture files. Physical cameras/24-hour soak not tested.')


if __name__ == '__main__':
    main()
