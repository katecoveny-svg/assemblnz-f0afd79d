"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, MonitorUp, ImagePlus, X } from "lucide-react";
import {
  DO_VISION_IMAGE_BYTES,
  visionResultContext,
  type DoVisionResult,
} from "@/apps/do/shared/vision";
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

export function DoVision({ onUse }: { onUse: (text: string) => boolean }) {
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
  const uploader = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setCanShare(Boolean(navigator.mediaDevices?.getDisplayMedia)),
    );
    return () => {
      cancelAnimationFrame(frame);
      generation.current++;
      request.current?.abort();
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);
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
      if (attempt === generation.current) setCapturing(false);
    }
  }
  async function capture() {
    const attempt = ++generation.current;
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
      if (attempt === generation.current) setCapturing(false);
    }
  }
  async function inspect() {
    if (!picture || !consent || busy) return;
    const attempt = ++generation.current;
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
      request.current = null;
      setBusy(false);
    }
  }
  return (
    <details className={styles.vision} id="do-vision-context">
      <summary>
        <Eye size={20} />
        Show DO <span>A screen, a screenshot or a photo</span>
      </summary>
      <div className={styles.body}>
        <div>
          <h3>Let DO look at this.</h3>
          <p>
            Choose one image. Check what is visible and remove anything you do
            not want to share.
          </p>
          <div className={styles.actions}>
            {canShare && (
              <button
                type="button"
                disabled={capturing || busy}
                onClick={() => void capture()}
              >
                <MonitorUp size={18} />
                Choose a tab or window
              </button>
            )}
            <button
              type="button"
              disabled={capturing || busy}
              onClick={() => uploader.current?.click()}
            >
              <ImagePlus size={18} />
              Add screenshot or photo
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
          <small>
            Screen sharing stops after one frame. On a phone or in an app
            without screen sharing, upload a screenshot or photo.
          </small>
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
              <label htmlFor="do-vision-question">
                What should DO look for?
              </label>
              <textarea
                id="do-vision-question"
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
                  onChange={(event) => setConsent(event.target.checked)}
                />
                Send this image and question to assembl’s configured vision
                providers for one observation.
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
            <label htmlFor="do-vision-result">
              Review and edit what DO saw
            </label>
            <textarea
              id="do-vision-result"
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
        {notice && <p role="status">{notice}</p>}
      </div>
    </details>
  );
}
