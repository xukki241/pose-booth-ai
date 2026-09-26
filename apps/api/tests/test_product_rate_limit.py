import os
import unittest
from unittest.mock import MagicMock, patch

import redis
from fastapi import HTTPException
from routers.product import rate_limit


class RateLimitTests(unittest.TestCase):
    def invoke(self, count=None, failure=None):
        client = MagicMock()
        client.__enter__.return_value = client
        client.eval.return_value = count
        client.eval.side_effect = failure
        with patch.dict(os.environ, {"REDIS_URL": "redis://fixture.invalid/0"}), \
             patch("routers.product.redis.Redis.from_url", return_value=client):
            try:
                rate_limit("fixture", 10)
            finally:
                client.__exit__.assert_called_once()

    def test_allowed_request_closes_client(self):
        self.invoke(count=10)

    def test_excess_is_429(self):
        with self.assertRaises(HTTPException) as caught:
            self.invoke(count=11)
        self.assertEqual(caught.exception.status_code, 429)

    def test_unavailable_redis_closes_client_and_fails_closed(self):
        with self.assertRaises(HTTPException) as caught:
            self.invoke(failure=redis.ConnectionError("fixture unavailable"))
        self.assertEqual(caught.exception.status_code, 503)


if __name__ == "__main__":
    unittest.main()
