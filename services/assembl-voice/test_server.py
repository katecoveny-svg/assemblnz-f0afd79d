import io
import threading
import time
import wave
import pytest
from fastapi.testclient import TestClient
from server import create_app, validate_input

SECRET = "test-only-" + "x" * 32
OWNER = "a" * 64
HEADERS = {"authorization":"Bearer " + SECRET,"x-assembl-owner":OWNER}
BODY = {"text":"Hello, this is a test.","presets":["warm"],"language":"en-NZ","consent":True}

class FakeEngine:
    def generate(self, text, preset, cancelled):
        b = io.BytesIO()
        with wave.open(b,"wb") as w:
            w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(b"\x00\x10" * 7200)
        return b.getvalue(), .3

def ready(client, job):
    for _ in range(100):
        r=client.get("/jobs/"+job,headers=HEADERS)
        if r.json()["state"] in ("ready","failed"): return r.json()
        time.sleep(.01)
    raise AssertionError("worker did not finish")

def test_secret_and_auth():
    with pytest.raises(RuntimeError): create_app(secret="short")
    with TestClient(create_app(FakeEngine,SECRET)) as c:
        assert c.get("/health").status_code==401
        assert c.get("/health",headers=HEADERS).status_code==200

@pytest.mark.parametrize("changes", [
    {"consent":False},{"language":"mi-NZ"},{"text":"x"*301},{"text":""},
    {"presets":["warm","warm"]},{"presets":["other"]},{"presets":[{}]},{"text":"bad\x00text"},{"unexpected":True},
])
def test_rejects_invalid_requests(changes):
    with pytest.raises((ValueError,TypeError)): validate_input({**BODY,**changes})

def test_ownership_download_delete_and_cache():
    with TestClient(create_app(FakeEngine,SECRET)) as c:
        r=c.post("/jobs",headers=HEADERS,json=BODY);assert r.status_code==202
        job=r.json()["id"];assert ready(c,job)["state"]=="ready"
        other={**HEADERS,"x-assembl-owner":"b"*64}
        for suffix in ("","/audio/warm"):
            assert c.get("/jobs/"+job+suffix,headers=other).status_code==404
        assert c.delete("/jobs/"+job,headers=other).status_code==404
        audio=c.get("/jobs/"+job+"/audio/warm",headers=HEADERS)
        assert audio.status_code==200 and audio.content[:4]==b"RIFF"
        assert "no-store" in audio.headers["cache-control"]
        assert c.delete("/jobs/"+job,headers=HEADERS).status_code==204
        assert c.get("/jobs/"+job+"/audio/warm",headers=HEADERS).status_code==404

def test_expiry_removes_script_and_audio():
    now=[1000.]
    app=create_app(FakeEngine,SECRET,clock=lambda:now[0])
    with TestClient(app) as c:
        job=c.post("/jobs",headers=HEADERS,json=BODY).json()["id"];ready(c,job)
        now[0]+=1801;app.state.expire()
        assert not app.state.jobs
        assert c.get("/jobs/"+job,headers=HEADERS).status_code==404

def test_per_owner_active_limit_and_cancellation():
    gate=threading.Event()
    class Slow(FakeEngine):
        def generate(self,text,preset,cancelled):
            gate.wait(1);return super().generate(text,preset,cancelled)
    with TestClient(create_app(Slow,SECRET)) as c:
        job=c.post("/jobs",headers=HEADERS,json=BODY).json()["id"]
        assert c.post("/jobs",headers=HEADERS,json=BODY).status_code==429
        assert c.delete("/jobs/"+job,headers=HEADERS).status_code==204
        gate.set()
        assert c.get("/jobs/"+job,headers=HEADERS).status_code==404

def test_hourly_limit_and_body_limit():
    with TestClient(create_app(FakeEngine,SECRET)) as c:
        for _ in range(4):
            r=c.post("/jobs",headers=HEADERS,json=BODY);assert r.status_code==202;ready(c,r.json()["id"])
        assert c.post("/jobs",headers=HEADERS,json=BODY).status_code==429
        assert c.post("/jobs",headers=HEADERS,content=b"x"*4097).status_code==413

def test_failure_exposes_no_script_or_exception():
    class Broken:
        def generate(self,*args): raise RuntimeError("secret internal failure")
    with TestClient(create_app(Broken,SECRET)) as c:
        job=c.post("/jobs",headers=HEADERS,json=BODY).json()["id"]
        data=ready(c,job);assert data["state"]=="failed" and data["outputs"]==[]
        assert "secret internal" not in str(data)
