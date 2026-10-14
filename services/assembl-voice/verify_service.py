"""Opt-in real-model HTTP proof. Provision weights first; never calls a speech API."""
import hashlib
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys
import time
import httpx

root = Path(__file__).resolve().parents[2]
secret = secrets.token_hex(32)
with socket.socket() as reserved:
    reserved.bind(("127.0.0.1", 0))
    port = reserved.getsockname()[1]
environment = {**os.environ, "ASSEMBL_VOICE_ENGINE_SECRET": secret}
headers = {"authorization": "Bearer " + secret, "x-assembl-owner": "a" * 64}
other = {**headers, "x-assembl-owner": "b" * 64}
process = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "server:create_app", "--factory", "--host", "127.0.0.1", "--port", str(port), "--no-access-log"],
    cwd=Path(__file__).parent, env=environment, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
)
try:
    with httpx.Client(base_url=f"http://127.0.0.1:{port}", timeout=10, trust_env=False) as client:
        for _ in range(60):
            if process.poll() is not None:
                raise RuntimeError("Voice service exited before readiness.")
            try:
                if client.get("/health", headers=headers).status_code == 200:
                    break
            except httpx.ConnectError:
                pass
            time.sleep(.5)
        assert client.get("/health").status_code == 401
        started = time.monotonic()
        response = client.post("/jobs", headers=headers, json={
            "text": "Hello, this is assembl. How can I help today?", "presets": ["clear"],
            "language": "en-NZ", "consent": True,
        })
        assert response.status_code == 202, response.status_code
        endpoint = "/jobs/" + response.json()["id"]
        assert client.get(endpoint, headers=other).status_code == 404
        deadline = started + 360
        while time.monotonic() < deadline:
            job = client.get(endpoint, headers=headers).json()
            if job["state"] in ("ready", "failed"):
                break
            time.sleep(1)
        assert job["state"] == "ready", job["state"]
        audio = client.get(endpoint + "/audio/clear", headers=headers)
        assert audio.status_code == 200 and audio.content[:4] == b"RIFF" and audio.content[8:12] == b"WAVE"
        digest = hashlib.sha256(audio.content).hexdigest()
        assert digest == job["outputs"][0]["sha256"]
        assert "no-store" in audio.headers["cache-control"]
        assert client.get(endpoint + "/audio/clear", headers=other).status_code == 404
        assert client.delete(endpoint, headers=other).status_code == 404
        assert client.delete(endpoint, headers=headers).status_code == 204
        assert client.get(endpoint + "/audio/clear", headers=headers).status_code == 404
        evidence = {
            "engine": "real pinned Qwen model on CPU", "network": "HTTP over loopback; inference egress denied",
            "elapsedSeconds": round(time.monotonic() - started, 3), "bytes": len(audio.content),
            "duration": job["outputs"][0]["duration"], "sha256": digest,
            "unauthenticatedRejected": True, "otherOwnerRejected": True, "downloadVerified": True,
            "deleteVerified": True, "liveSupabaseSession": False, "accentReview": "pending",
        }
        target = root / "docs/recovery/evidence/voice-http-proof.json"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(evidence, indent=2) + "\n")
        print(json.dumps(evidence))
finally:
    process.terminate()
    try:
        process.wait(timeout=20)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()
