# assembl owned voice engine
Original synthetic voice options on Assembl infrastructure using official Qwen open weights. No ElevenLabs key, account or API is used. This is not a reverse-engineered proprietary voice model.

## Run locally (Linux / Python 3.12)
1. Create a private virtual environment.
2. Install torch==2.8.0 and torchaudio==2.8.0 from https://download.pytorch.org/whl/cpu.
3. Install requirements.txt. Install the host libseccomp2 library.
4. Run `python provision.py --output /private/path/assembl-model`. This explicitly downloads the pinned official model before inference.
5. Set ASSEMBL_VOICE_MODEL_DIR to that directory. Set ASSEMBL_VOICE_ENGINE_SECRET to a random secret of at least 32 characters; never commit it.
6. From this folder run `uvicorn server:create_app --factory --host 127.0.0.1 --port 8791 --workers 1`.
7. In the Next.js server set ASSEMBL_VOICE_ENGINE_URL and the same ASSEMBL_VOICE_ENGINE_SECRET. Use HTTPS for a remote engine and a private network/reverse proxy. Only loopback HTTP is accepted locally.

The inference worker applies Linux seccomp before importing ML libraries: outbound connect/send syscalls are denied. HF offline flags and telemetry disabling supplement that OS boundary. Provisioning is a separate online operation. Do not remove this guard to make a download or telemetry call succeed during inference.

## Contract and limits
Authenticated Next.js routes derive a pseudonymous owner key and forward requests. Private jobs: 300 characters, one to three fixed voice designs, one active job per owner, three active globally, four requests per owner/hour, 50/hour globally, 12 retained jobs. One worker only: quotas and jobs are process-local. A 30-minute TTL and janitor remove scripts/audio. Restart clears them. Delete cancels remaining work and discards results. Do not scale this process horizontally without shared queue/quotas/storage.

No raw script logging. Job IDs are unguessable but never substitute for ownership checks. Audio stays private unless the owner deliberately downloads/shares it. The browser does not receive service credentials. Model generation is bounded to 375 tokens and a cooperative 240-second stopping condition; this is not an OS-level hard timeout. Host-level CPU/memory supervision is still required for deployment.

## Voice truth
Warm, Clear and Bright are original text-designed options that request NZ English pronunciation. Their accent and pronunciation need human listening review; identity can vary between scripts. Qwen's listed languages do not include te reo Māori. The API accepts en-NZ only and does not market Māori support. No real-person voice samples or voice cloning are used. Telephone calls, iMessage delivery and avatar generation are not implemented here.

Source: https://github.com/QwenLM/Qwen3-TTS and https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign (Apache-2.0). Pinned model/revision and prompts live in lib/voice/assembl/catalogue.json. Weights and runtime caches do not belong in Git.

Run tests: `python -m pytest services/assembl-voice -q` from the repository root. Runtime speech generation needs a separate evidence run with the real model. No production deployment is authorised by this recovery.
