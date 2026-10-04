"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Eye, MonitorUp, ImagePlus, X } from "lucide-react";
import {
  DO_VISION_IMAGE_BYTES,
  visionResultContext,
  type DoVisionResult,
} from "@/apps/do/shared/vision";
import { DoPhotoNotes } from "./DoPhotoNotes";
import styles from "./do-vision.module.css";

async function fitImage(
  source: CanvasImageSource,
  width: number,
  height: number,
) {
  if (!width || !height)
    throw new Error("No image was available. Try a screenshot instead.");
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1600 / Math.max(width, height));
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("Image preparation is unavailable in this browser.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const data = canvas.toDataURL("image/jpeg", 0.85);
  if (data.length * 0.75 > DO_VISION_IMAGE_BYTES)
    throw new Error("Use a smaller image or crop.");
  return data;
}

export function DoVision({ onUse, active = true, contextId = "do-vision-context" }: { onUse: (text: string) => boolean; active?: boolean; contextId?: string }) {
  const instance = useId();
  const [picture, setPicture] = useState("");
  const [question, setQuestion] = useState(
    "What can you see, and what would help with this work?",
  );
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [result, setResult] = useState<DoVisionResult | null>(null);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [canShare, setCanShare] = useState(false);
  const stream = useRef<MediaStream | null>(null);
  const request = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const approvedGeneration = useRef<number | null>(null);
  const captureGeneration = useRef<number | null>(null);
  const uploader = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const lifetimeGeneration = generation;
    const frame = requestAnimationFrame(() =>
      setCanShare(Boolean(navigator.mediaDevices?.getDisplayMedia)),
    );
    return () => {
      cancelAnimationFrame(frame);
      lifetimeGeneration.current++;
      request.current?.abort();
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);
  useEffect(() => {
    if (!active) {
      generation.current++; approvedGeneration.current = null; captureGeneration.current = null;
      request.current?.abort(); request.current = null;
      stream.current?.getTracks().forEach(track => track.stop()); stream.current = null;
    }
    const frame = requestAnimationFrame(() => {
      setConsent(approvedGeneration.current === generation.current);
      setBusy(Boolean(request.current && !request.current.signal.aborted));
      setCapturing(captureGeneration.current === generation.current);
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);
  function clear() {
    generation.current++;
    request.current?.abort();
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    setPicture("");
    setResult(null);
    setDraft("");
    setConsent(false);
    setNotice("Image removed. Screen sharing is off.");
  }
  function select(data: string) {
    setPicture(data);
    setConsent(false);
    setResult(null);
    setDraft("");
    setNotice(
      "One image ready. Review it before showing DO. Screen sharing is off.",
    );
  }
  async function upload(file: File) {
    const attempt = ++generation.current;
    captureGeneration.current = attempt;
    setCapturing(true);
    setNotice("");
    try {
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > 10_000_000
      )
        throw new Error(
          "Choose a PNG, JPEG or WebP under 10 MB. On a phone, a screenshot works well.",
        );
      const bitmap = await createImageBitmap(file);
      try {
        const data = await fitImage(bitmap, bitmap.width, bitmap.height);
        if (attempt === generation.current) select(data);
      } finally {
        bitmap.close();
      }
    } catch (error) {
      if (attempt === generation.current)
        setNotice(
          error instanceof Error
            ? error.message
            : "The image could not be opened. Try a screenshot.",
        );
    } finally {
      if (attempt === generation.current) { captureGeneration.current = null; setCapturing(false); }
    }
  }
  async function capture() {
    const attempt = ++generation.current;
    captureGeneration.current = attempt;
    setCapturing(true);
    setNotice("Choose the tab, window or screen you want to show.");
    let media: MediaStream | undefined;
    const video = document.createElement("video");
    try {
      media = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      if (attempt !== generation.current) return;
      stream.current = media;
      video.srcObject = media;
      video.muted = true;
      await Promise.race([
        video.play(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "The screen image was not ready. Try uploading a screenshot.",
                ),
              ),
            8_000,
          ),
        ),
      ]);
      if (attempt !== generation.current) return;
      const data = await fitImage(video, video.videoWidth, video.videoHeight);
      if (attempt === generation.current) select(data);
    } catch (error) {
      if (attempt === generation.current)
        setNotice(
          error instanceof DOMException && error.name === "NotAllowedError"
            ? "Screen sharing was cancelled. Nothing was captured."
            : "Screen sharing is unavailable here. Add a screenshot or image instead.",
        );
    } finally {
      media?.getTracks().forEach((track) => track.stop());
      video.pause();
      video.srcObject = null;
      stream.current = null;
      if (attempt === generation.current) { captureGeneration.current = null; setCapturing(false); }
    }
  }
  async function inspect() {
    if (!active || !picture || !consent || busy || approvedGeneration.current !== generation.current) return;
    const attempt = ++generation.current;
    approvedGeneration.current = null;
    setConsent(false);
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/do/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mimeType: "image/jpeg",
          data: picture.split(",")[1],
          question,
          consent,
        }),
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.message || "DO could not inspect this image.");
      if (attempt !== generation.current) return;
      setResult(body);
      setDraft(body.text);
      setNotice("DO’s observations are ready to check against the image.");
    } catch (error) {
      if (attempt === generation.current)
        setNotice(
          controller.signal.aborted
            ? "Stopped on this device. No observation was added to your task."
            : error instanceof Error
              ? error.message
              : "The image could not be inspected.",
        );
    } finally {
      if (attempt === generation.current) { request.current = null; approvedGeneration.current = null; setConsent(false); setBusy(false); }
    }
  }
  return (
    <details className={styles.vision} id={contextId} data-do-vision-context>
      <summary>
        <Eye size={20} />
        Photo
      </summary>
      <div className={styles.body}>
        <DoPhotoNotes active={active} />
        <div>
          <h3>Other image</h3>
          <p>
            Add one image. Check it before sharing.
          </p>
          <div className={styles.actions}>
            {canShare && (
              <>
              <button
                type="button"
                disabled={capturing || busy}
                onClick={() => void capture()}
              >
                <MonitorUp size={18} />
                Choose a tab or window
              </button>
              <small>One frame only.</small>
              </>
            )}
            <button
              type="button"
              disabled={capturing || busy}
              onClick={() => uploader.current?.click()}
            >
              <ImagePlus size={18} />
              Add image
            </button>
            <input
              ref={uploader}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Choose an image for DO"
              className={styles.file}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
                event.target.value = "";
              }}
            />
          </div>
        </div>
        {picture && (
          <div className={styles.review}>
            <figure>
              {/* The local data URL never uses a remote image service. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={picture} alt="The image you chose for DO to inspect" />
              <figcaption>
                Only this image will be shared.
                <button type="button" disabled={capturing} onClick={clear}>
                  <X size={15} />
                  Remove image
                </button>
              </figcaption>
            </figure>
            <div>
              <label htmlFor={`do-vision-question-${instance}`}>
                What should DO look for?
              </label>
              <textarea
                id={`do-vision-question-${instance}`}
                value={question}
                maxLength={2000}
                disabled={busy}
                onChange={(event) => {
                  setQuestion(event.target.value);
                  setConsent(false);
                  setResult(null);
                }}
                rows={3}
              />
              <label className={styles.consent}>
                <input
                  type="checkbox"
                  checked={consent}
                  disabled={busy}
                  onChange={(event) => { approvedGeneration.current = event.target.checked ? generation.current : null; setConsent(event.target.checked); }}
                />
                Send this image and question to assembl’s configured OpenAI, Anthropic
                or Google vision providers for one observation.
              </label>
              <div className={styles.actions}>
                <button
                  type="button"
                  disabled={!consent || question.trim().length < 3 || busy}
                  onClick={() => void inspect()}
                >
                  {busy ? "DO is looking…" : "Ask DO to look · 1 task"}
                </button>
                {busy && (
                  <button
                    type="button"
                    onClick={() => request.current?.abort()}
                  >
                    Stop
                  </button>
                )}
              </div>
              <small>
                Uses the existing three-task allowance. Nothing is clicked or
                changed in the image.
              </small>
            </div>
          </div>
        )}
        {result && (
          <div className={styles.result}>
            <label htmlFor={`do-vision-result-${instance}`}>
              Review and edit what DO saw
            </label>
            <textarea
              id={`do-vision-result-${instance}`}
              value={draft}
              rows={8}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={12000}
            />
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={() => {
                if (onUse(visionResultContext(draft)))
                  setNotice("Your reviewed observation was added to the task.");
              }}
            >
              Add reviewed observation to my task
            </button>
            <details>
              <summary>Observation receipt</summary>
              <p>{result.receipt.boundary}</p>
              <dl>
                <dt>Model</dt>
                <dd>{result.receipt.model}</dd>
                <dt>Image fingerprint</dt>
                <dd>{result.receipt.imageHash}</dd>
                <dt>Original output fingerprint</dt>
                <dd>{result.receipt.outputHash}</dd>
              </dl>
            </details>
          </div>
        )}
        <details>
          <summary>Photo details</summary>
          <p>Pages to text: PNG, JPEG or WebP · 10 MB per original · prepared at up to 1600 px and 2 MB. Convert HEIC to JPEG or use a screenshot. Each transcription sends one page once to one configured vision provider and uses one existing task. No automatic retry or provider fallback.</p>
          <p>Other image: screen sharing stops after one frame. On a phone or in an app without screen sharing, upload a screenshot or photo. Configured providers may be tried in order if one fails.</p>
          <p>Nothing is saved in browser storage or synced. Photos and text stay while this workspace is open, including switches between tools. Leaving or reloading loses them; download a backup first. Backups contain your photos and text, so keep them private.</p>
          <p>The downloaded document contains manually reviewed words, with no extra rewrite call. A provider’s normal ending never verifies a complete transcription.</p>
        </details>
        {notice && <p role="status">{notice}</p>}
      </div>
    </details>
  );
}
