"""Regenerate public, original samples. Run only with provisioned local weights."""
import hashlib
import json
from pathlib import Path
import threading
import time
from engine import VoiceEngine, CATALOGUE

root = Path(__file__).resolve().parents[2]
script = "Hello, you've reached assembl. Let's find a time that works for you. Would Thursday afternoon suit, or would you prefer Friday morning?"
out = root / "public/do/voice/assembl"
out.mkdir(parents=True, exist_ok=True)
engine = VoiceEngine()
items = []
for preset in ("warm", "clear", "bright"):
    started = time.monotonic()
    audio, duration = engine.generate(script, preset, threading.Event())
    (out / (preset + ".wav")).write_bytes(audio)
    item = {"preset":preset, "duration":duration, "sha256":hashlib.sha256(audio).hexdigest(),
            "generationSeconds":round(time.monotonic()-started,3), "bytes":len(audio)}
    items.append(item)
    # Save after every option, so interrupted runs do not advertise missing audio.
    (out / "samples.json").write_text(json.dumps({"items":items,"accentReview":"pending","script":script,
        "model":CATALOGUE["model"],"revision":CATALOGUE["revision"],"runtime":"CPU BF16; Linux seccomp egress guard"},indent=2)+"\n")
    print(json.dumps(item), flush=True)
