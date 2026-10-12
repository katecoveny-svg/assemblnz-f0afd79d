"""Owned inference with official open weights; no external speech API."""
import io
import json
import os
from pathlib import Path
import time
import wave
from offline import restrict_inference_network

CATALOGUE = json.loads((Path(__file__).resolve().parents[2] / "lib/voice/assembl/catalogue.json").read_text())
PRESETS = {p["id"]: p for p in CATALOGUE["presets"]}

class VoiceEngine:
    def __init__(self):
        restrict_inference_network()
        import torch
        from qwen_tts import Qwen3TTSModel
        self.torch = torch
        torch.set_num_threads(min(8, os.cpu_count() or 1))
        model_dir = Path(os.environ["ASSEMBL_VOICE_MODEL_DIR"]).resolve()
        receipt = json.loads((model_dir / "assembl-model.json").read_text())
        if receipt != {"model": CATALOGUE["model"], "revision": CATALOGUE["revision"]}:
            raise RuntimeError("Provision the pinned official model first.")
        self.model = Qwen3TTSModel.from_pretrained(
            str(model_dir), device_map="cpu", dtype=torch.bfloat16,
            attn_implementation="eager", local_files_only=True,
        )

    def generate(self, text, preset, cancelled):
        if cancelled.is_set():
            raise RuntimeError("cancelled")
        import numpy as np
        from transformers import StoppingCriteria, StoppingCriteriaList
        started = time.monotonic()
        timed_out = False
        class Stop(StoppingCriteria):
            def __call__(self, input_ids, scores, **kwargs):
                nonlocal timed_out
                timed_out = time.monotonic() - started > 240
                return cancelled.is_set() or timed_out
        spec = PRESETS[preset]
        self.torch.manual_seed(spec["seed"])
        with self.torch.inference_mode():
            wavs, rate = self.model.generate_voice_design(
                text=text, language="English", instruct=spec["instruction"],
                max_new_tokens=375, stopping_criteria=StoppingCriteriaList([Stop()]),
            )
        if cancelled.is_set() or timed_out or time.monotonic() - started > 240:
            raise RuntimeError("generation stopped")
        audio = np.asarray(wavs[0], dtype=np.float32).reshape(-1)
        if rate != 24000 or not 0.2 <= len(audio) / rate <= 40 or not np.isfinite(audio).all() or float(np.max(np.abs(audio))) < 0.001:
            raise RuntimeError("No usable audio was generated.")
        buf = io.BytesIO()
        with wave.open(buf, "wb") as output:
            output.setnchannels(1); output.setsampwidth(2); output.setframerate(rate)
            output.writeframes((np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes())
        return buf.getvalue(), len(audio) / rate
