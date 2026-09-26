"""Opt-in photo persistence; separate session tokens and operator credentials."""
import hashlib
import io
import os
import secrets
import shutil
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

import redis
import qrcode
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from services.images import decode_image
from services.product_store import active_session, admin_valid, asset_path, connect, token_hash

router = APIRouter(prefix="/api/v1")
bearer = HTTPBearer()


def token(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    return credentials.credentials


def admin(value: str = Depends(token)):
    if not admin_valid(value):
        raise HTTPException(403, "Operator access required")


def rate_limit(key: str, limit: int):
    try:
        cache = redis.Redis.from_url(os.environ["REDIS_URL"], socket_connect_timeout=1, socket_timeout=1)
        script = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n"
        count = cache.eval(script, 1, "limit:" + key)
        cache.close()
        if count > limit:
            raise HTTPException(429, "Rate limit exceeded")
    except redis.RedisError as exc:
        raise HTTPException(503, "Photo persistence temporarily unavailable") from exc


@router.post("/sessions")
def create_session(request: Request):
    rate_limit("session:" + (request.client.host if request.client else "unknown"), 10)
    session_id, secret = uuid4(), secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=24)
    with connect() as db:
        db.execute("INSERT INTO booth_sessions(id,token_hash,expires_at) VALUES (%s,%s,%s)", (session_id, token_hash(secret), expires))
    return {"id": str(session_id), "token": secret, "expires_at": expires, "training_allowed": False}


class PhotoInput(BaseModel):
    image: str = Field(max_length=11_184_850)
    client_key: UUID


@router.post("/assets")
def upload_photo(body: PhotoInput, secret: str = Depends(token)):
    rate_limit("upload:" + token_hash(secret), 30)
    try:
        image = decode_image(body.image)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    buffer = io.BytesIO()
    image.save(buffer, "JPEG", quality=92)  # strip original metadata/EXIF
    contents = buffer.getvalue()
    asset_id, job_id = uuid4(), uuid4()
    path = asset_path(asset_id)
    if shutil.disk_usage(path.parent).free < 20 * 1024**3:
        raise HTTPException(507, "Studio storage reserve reached")
    with connect() as db:
        session = active_session(db, secret)
        if not session:
            raise HTTPException(401, "Session expired or revoked")
        db.execute("SELECT id FROM booth_sessions WHERE id=%s FOR UPDATE", (session["id"],))
        if not active_session(db, secret):
            raise HTTPException(401, "Session expired or revoked")
        existing = db.execute("SELECT id,sha256 FROM assets WHERE session_id=%s AND client_key=%s", (session["id"], body.client_key)).fetchone()
        sha = hashlib.sha256(contents).hexdigest()
        if existing:
            if existing["sha256"] != sha:
                raise HTTPException(409, "Idempotency key used for different image")
            return {"id": str(existing["id"])}
        quota = db.execute("SELECT count(*) AS count, coalesce(sum(bytes),0) AS bytes FROM assets WHERE session_id=%s", (session["id"],)).fetchone()
        if quota["count"] >= 50 or quota["bytes"] + len(contents) > 200 * 1024**2:
            raise HTTPException(413, "Session photo quota reached")
        try:
            with path.open("xb") as stream:
                stream.write(contents)
            db.execute("INSERT INTO assets(id,session_id,bytes,sha256,client_key) VALUES (%s,%s,%s,%s,%s)",
                       (asset_id, session["id"], len(contents), sha, body.client_key))
            db.execute("INSERT INTO jobs(id,session_id,asset_id,kind) VALUES (%s,%s,%s,'thumbnail')", (job_id, session["id"], asset_id))
            db.execute("INSERT INTO job_outbox(job_id) VALUES (%s)", (job_id,))
            db.commit()
        except Exception:
            path.unlink(missing_ok=True)
            raise
    return {"id": str(asset_id), "job_id": str(job_id)}


@router.get("/gallery")
def gallery(secret: str = Depends(token)):
    with connect() as db:
        session = active_session(db, secret, read_only=True)
        if not session:
            raise HTTPException(401, "Session expired or revoked")
        rows = db.execute("SELECT id,created_at,bytes FROM assets WHERE session_id=%s ORDER BY created_at", (session["id"],)).fetchall()
        return {"assets": rows, "expires_at": session["expires_at"], "training_allowed": False}


@router.get("/assets/{asset_id}")
def download_photo(asset_id: UUID, thumbnail: bool = False, secret: str = Depends(token)):
    with connect() as db:
        session = active_session(db, secret, read_only=True)
        if not session or not db.execute("SELECT id FROM assets WHERE id=%s AND session_id=%s", (asset_id, session["id"])).fetchone():
            raise HTTPException(404, "Photo unavailable")
    path = asset_path(asset_id, thumbnail)
    if not path.is_file():
        raise HTTPException(404, "Photo unavailable")
    return FileResponse(path, media_type="image/jpeg", filename=f"posebooth-{asset_id}.jpg", headers={"Cache-Control": "no-store"})


@router.get("/jobs/{job_id}")
def job_status(job_id: UUID, secret: str = Depends(token)):
    with connect() as db:
        session = active_session(db, secret)
        row = db.execute("SELECT id,kind,status,attempts,error_code FROM jobs WHERE id=%s AND session_id=%s", (job_id, session["id"])).fetchone() if session else None
        if not row:
            raise HTTPException(404, "Job unavailable")
        return row


@router.post("/session/revoke")
def revoke(secret: str = Depends(token)):
    with connect() as db:
        db.execute("UPDATE booth_sessions SET revoked=true WHERE token_hash=%s", (token_hash(secret),))
    return {"revoked": True}


@router.post("/share/qr")
def share_qr(secret: str = Depends(token)):
    share_secret = secrets.token_urlsafe(32)
    with connect() as db:
        session = active_session(db, secret)
        if not session:
            raise HTTPException(401, "Session expired or revoked")
        db.execute("UPDATE booth_sessions SET share_token_hash=%s WHERE id=%s", (token_hash(share_secret), session["id"]))
    origin = os.environ["PUBLIC_ORIGIN"].rstrip("/")
    # Fragment is not sent in HTTP logs. Treat this bearer link like a password.
    qr = qrcode.make(origin + "/gallery#" + share_secret)
    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")
    return Response(buffer.getvalue(), media_type="image/png", headers={"Cache-Control": "no-store"})


@router.get("/admin/status", dependencies=[Depends(admin)])
def admin_status():
    with connect() as db:
        sessions = db.execute("SELECT count(*) AS count FROM booth_sessions WHERE expires_at>now() AND NOT revoked").fetchone()
        jobs = db.execute("SELECT status,count(*) AS count FROM jobs GROUP BY status").fetchall()
    return {"active_sessions": sessions["count"], "jobs": jobs, "training_collection_enabled": False}
