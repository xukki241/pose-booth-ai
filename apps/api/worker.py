"""Durable thumbnail jobs/outbox and expiry cleanup; no GPU or raw frames in RabbitMQ."""
import json
import logging
import os
import time
from uuid import UUID
import pika
from PIL import Image
from services.product_store import asset_path, connect, expire_assets, migrate

log = logging.getLogger("pose_worker")
QUEUE = "posebooth.thumbnail.v1"
DLQ = "posebooth.thumbnail.dead.v1"


def configure(channel):
    channel.queue_declare(queue=DLQ, durable=True)
    channel.queue_declare(queue=QUEUE, durable=True, arguments={"x-dead-letter-exchange": "", "x-dead-letter-routing-key": DLQ})
    channel.basic_qos(prefetch_count=1)
    channel.confirm_delivery()


def publish_outbox(channel):
    with connect() as db:
        rows = db.execute("SELECT id,job_id FROM job_outbox WHERE sent_at IS NULL ORDER BY id LIMIT 20 FOR UPDATE SKIP LOCKED").fetchall()
        for row in rows:
            channel.basic_publish(exchange="", routing_key=QUEUE, mandatory=True,
                                  body=json.dumps({"job_id": str(row["job_id"])}),
                                  properties=pika.BasicProperties(delivery_mode=2, content_type="application/json"))
            db.execute("UPDATE job_outbox SET sent_at=now() WHERE id=%s", (row["id"],))


def consume(channel, method, properties, body):
    try:
        job_id = UUID(json.loads(body)["job_id"])
    except (ValueError, KeyError, TypeError):
        channel.basic_nack(method.delivery_tag, requeue=False)
        return
    terminal_failure = False
    # Serialize duplicate deliveries. Crash before commit redelivers; thumbnail replacement is idempotent.
    with connect() as db:
        job = db.execute("SELECT j.*, s.expires_at>now() AND NOT s.revoked AS active FROM jobs j JOIN booth_sessions s ON s.id=j.session_id WHERE j.id=%s FOR UPDATE OF s,j", (job_id,)).fetchone()
        if job and job["status"] == "queued":
            if not job["active"]:
                db.execute("UPDATE jobs SET status='cancelled',updated_at=now() WHERE id=%s", (job_id,))
            else:
                try:
                    target = asset_path(job["asset_id"], True)
                    with Image.open(asset_path(job["asset_id"])) as image:
                        image.thumbnail((480, 480))
                        temp = target.with_suffix(".pending")
                        image.convert("RGB").save(temp, "JPEG", quality=80)
                        temp.replace(target)
                    db.execute("UPDATE jobs SET status='succeeded',attempts=attempts+1,updated_at=now() WHERE id=%s", (job_id,))
                except (OSError, ValueError):
                    attempt = job["attempts"] + 1
                    terminal_failure = attempt >= 3
                    db.execute("UPDATE jobs SET attempts=%s,status=%s,error_code='THUMBNAIL_FAILED',updated_at=now() WHERE id=%s", (attempt, "failed" if terminal_failure else "queued", job_id))
                    if not terminal_failure:
                        db.execute("INSERT INTO job_outbox(job_id) VALUES (%s)", (job_id,))
    if terminal_failure:
        channel.basic_nack(method.delivery_tag, requeue=False)
    else:
        channel.basic_ack(method.delivery_tag)


def main():
    logging.basicConfig(level=logging.INFO)
    migrate()
    expire_assets()
    delay = 1
    while True:
        connection = None
        try:
            params = pika.URLParameters(os.environ["RABBITMQ_URL"])
            params.heartbeat = 60
            params.blocked_connection_timeout = 10
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            configure(channel)
            channel.basic_consume(queue=QUEUE, on_message_callback=consume)
            delay = 1
            last_cleanup = 0.0
            while connection.is_open:
                publish_outbox(channel)
                connection.process_data_events(time_limit=1)
                if time.monotonic() - last_cleanup > 60:
                    expire_assets()
                    last_cleanup = time.monotonic()
        except KeyboardInterrupt:
            return
        except Exception:
            log.exception("Worker connection failed; retrying with bounded backoff")
            time.sleep(delay)
            delay = min(delay * 2, 30)
        finally:
            if connection and connection.is_open:
                connection.close()


if __name__ == "__main__":
    main()
