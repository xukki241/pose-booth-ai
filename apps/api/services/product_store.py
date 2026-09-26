"""PostgreSQL owns sessions/jobs; only generated UUID filenames enter asset storage."""
import hashlib
import os
import secrets
from pathlib import Path
from uuid import UUID
import psycopg
from psycopg.rows import dict_row


def connect():
    return psycopg.connect(os.environ["DATABASE_URL"], connect_timeout=5, row_factory=dict_row)


def migrate():
    sql = (Path(__file__).resolve().parents[1] / "migrations" / "001_product.sql").read_text(encoding="utf-8")
    with connect() as db:
        db.execute("SELECT pg_advisory_xact_lock(82304001)")
        db.execute(sql)


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def admin_valid(token: str) -> bool:
    expected = os.getenv("ADMIN_TOKEN", "")
    return len(expected) >= 32 and secrets.compare_digest(token, expected)


def asset_path(asset_id: UUID | str, thumbnail: bool = False) -> Path:
    root = Path(os.environ["ASSET_DIR"]).resolve()
    root.mkdir(parents=True, exist_ok=True)
    name = str(UUID(str(asset_id))) + (".thumb.jpg" if thumbnail else ".jpg")
    path = root / name
    if not path.resolve().is_relative_to(root):
        raise ValueError("Asset outside storage")
    return path


def active_session(db, token: str, read_only: bool = False):
    hashed = token_hash(token)
    if read_only:
        return db.execute("SELECT * FROM booth_sessions WHERE (token_hash=%s OR share_token_hash=%s) AND expires_at>now() AND NOT revoked", (hashed, hashed)).fetchone()
    return db.execute("SELECT * FROM booth_sessions WHERE token_hash=%s AND expires_at>now() AND NOT revoked", (hashed,)).fetchone()


def expire_assets():
    # Explicit generated files only; never recurse or delete external/raw/training directories.
    with connect() as db:
        rows = db.execute("SELECT id FROM booth_sessions WHERE expires_at<=now() OR revoked FOR UPDATE SKIP LOCKED").fetchall()
        for row in rows:
            assets = db.execute("SELECT id FROM assets WHERE session_id=%s", (row["id"],)).fetchall()
            for asset in assets:
                for thumb in (False, True):
                    asset_path(asset["id"], thumb).unlink(missing_ok=True)
                asset_path(asset["id"], True).with_suffix('.pending').unlink(missing_ok=True)
            db.execute("DELETE FROM booth_sessions WHERE id=%s", (row["id"],))
