"""Generate local-only credentials without printing or overwriting them."""
import secrets
from pathlib import Path

root = Path(__file__).resolve().parents[1]
target = root / ".env.pilot"
with target.open("x", encoding="utf-8") as stream:
    stream.write("POSTGRES_PASSWORD=" + secrets.token_hex(24) + "\n")
    stream.write("RABBITMQ_PASSWORD=" + secrets.token_hex(24) + "\n")
    stream.write("ADMIN_TOKEN=" + secrets.token_hex(32) + "\n")
    stream.write("PUBLIC_ORIGIN=http://localhost:8080\n")
print("Created .env.pilot. Credentials were not printed. Do not commit/share this file.")
