"""Private single-worker speech queue. Do not run with multiple uvicorn workers."""
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
import hashlib
import hmac
import json
import os
import re
import threading
import time
import uuid
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response, JSONResponse

PRESETS = ("warm", "clear", "bright")
TTL = 1800

@dataclass
class Job:
    id: str
    owner: str
    text: str
    presets: list
    created: float
    state: str = "queued"
    audio: dict = field(default_factory=dict)
    durations: dict = field(default_factory=dict)
    cancelled: threading.Event = field(default_factory=threading.Event)

def validate_input(data):
    if not isinstance(data, dict) or set(data) != {"text", "presets", "language", "consent"}:
        raise ValueError("Invalid fields.")
    text = data["text"]
    if not isinstance(text, str) or not 1 <= len(text.strip()) <= 300 or re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", text):
        raise ValueError("Use a script of 1–300 characters.")
    presets = data["presets"]
    if not isinstance(presets, list) or not 1 <= len(presets) <= 3 or any(p not in PRESETS for p in presets) or len(set(presets)) != len(presets):
        raise ValueError("Choose one to three different voices.")
    if data["language"] != "en-NZ" or data["consent"] is not True:
        raise ValueError("Confirm permission for English voice generation.")
    return text.strip(), presets

def create_app(engine_factory=None, secret=None, clock=time.time):
    token = secret or os.environ.get("ASSEMBL_VOICE_ENGINE_SECRET", "")
    if len(token) < 32:
        raise RuntimeError("Set a private ASSEMBL_VOICE_ENGINE_SECRET of at least 32 characters.")
    if engine_factory is None:
        from engine import VoiceEngine
        engine_factory = VoiceEngine
    lock = threading.RLock()
    jobs = {}
    history = []
    executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="assembl-voice")
    engine = None
    stop = threading.Event()

    def expire():
        now = clock()
        with lock:
            for key, job in list(jobs.items()):
                if now - job.created >= TTL:
                    job.cancelled.set()
                    del jobs[key]
            history[:] = [(o,t) for o,t in history if now-t < 3600]

    def janitor():
        while not stop.wait(15):
            expire()

    @asynccontextmanager
    async def lifespan(app):
        thread = threading.Thread(target=janitor, daemon=True)
        thread.start()
        yield
        stop.set()
        with lock:
            for job in jobs.values(): job.cancelled.set()
            jobs.clear()
        executor.shutdown(wait=True, cancel_futures=True)

    app = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
    app.state.jobs = jobs
    app.state.expire = expire

    @app.middleware("http")
    async def auth(request: Request, call_next):
        supplied = request.headers.get("authorization", "")
        owner = request.headers.get("x-assembl-owner", "")
        if not hmac.compare_digest(supplied, "Bearer " + token) or not re.fullmatch(r"[a-f0-9]{64}", owner):
            return JSONResponse({"message":"Unauthorised."}, status_code=401, headers={"Cache-Control":"no-store"})
        response = await call_next(request)
        response.headers["Cache-Control"] = "private, no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    def owned(job_id, request):
        expire()
        with lock:
            job = jobs.get(job_id)
            if not job or job.owner != request.headers["x-assembl-owner"]:
                raise HTTPException(404, "Job not found.")
            return job

    def public(job):
        return {"id":job.id, "state":job.state, "text":job.text, "presets":job.presets,
                "expiresAt":int((job.created + TTL) * 1000), "accentReview":"pending",
                "outputs":[{"preset":p,"duration":job.durations[p],"sha256":hashlib.sha256(data).hexdigest()}
                           for p,data in job.audio.items()]}

    def work(job):
        nonlocal engine
        try:
            with lock:
                if job.cancelled.is_set(): return
                job.state = "generating"
            if engine is None: engine = engine_factory()
            for preset in job.presets:
                if job.cancelled.is_set(): return
                audio, duration = engine.generate(job.text, preset, job.cancelled)
                if not isinstance(audio, bytes) or not audio.startswith(b"RIFF") or audio[8:12] != b"WAVE" or len(audio) > 2_000_000:
                    raise RuntimeError("Invalid generated audio.")
                with lock:
                    if job.cancelled.is_set(): return
                    job.audio[preset] = audio
                    job.durations[preset] = duration
            with lock: job.state = "ready"
        except Exception:
            # No scripts, owner IDs, model internals or credentials in public errors.
            with lock:
                job.audio.clear(); job.durations.clear(); job.state = "failed"

    @app.get("/health")
    def health():
        return {"available":True, "loaded":engine is not None, "language":"en-NZ", "accentReview":"pending"}

    @app.post("/jobs", status_code=202)
    async def create(request: Request):
        raw = bytearray()
        async for chunk in request.stream():
            raw.extend(chunk)
            if len(raw) > 4096: raise HTTPException(413, "Script too large.")
        try: text, presets = validate_input(json.loads(raw))
        except (ValueError, TypeError): raise HTTPException(400, "Check the script, voices, language and permission.")
        owner = request.headers["x-assembl-owner"]
        expire()
        with lock:
            active = [j for j in jobs.values() if j.state in ("queued","generating")]
            if len(active) >= 3 or any(j.owner == owner for j in active) or len(jobs) >= 12:
                raise HTTPException(429, "Queue is busy. Wait for the current job.")
            if sum(o == owner for o,t in history) >= 4 or len(history) >= 50:
                raise HTTPException(429, "Hourly generation limit reached.")
            job = Job(str(uuid.uuid4()), owner, text, presets, clock())
            jobs[job.id] = job; history.append((owner, clock()))
            executor.submit(work, job)
            return public(job)

    @app.get("/jobs/{job_id}")
    def get(job_id: str, request: Request):
        with lock: return public(owned(job_id, request))

    @app.delete("/jobs/{job_id}", status_code=204)
    def delete(job_id: str, request: Request):
        with lock:
            job = owned(job_id, request); job.cancelled.set(); del jobs[job_id]
        return Response(status_code=204)

    @app.get("/jobs/{job_id}/audio/{preset}")
    def audio(job_id: str, preset: str, request: Request):
        with lock:
            job = owned(job_id, request)
            if preset not in job.audio or job.state != "ready": raise HTTPException(404, "Audio not available.")
            return Response(job.audio[preset], media_type="audio/wav",
                            headers={"Content-Disposition":'inline; filename="assembl-' + preset + '.wav"'})
    return app
