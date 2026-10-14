"use client";
import { useEffect, useRef, useState } from "react";
import {
  groceryQuestion,
  parseIngredientObservation,
  type IngredientRow,
} from "./ingredients";
import type { DoVisionResult } from "@/apps/do/shared/vision";
export type GroceryProvenance = {
  source: "photo" | "voice" | "sample" | "manual";
  model: string | null;
  imageHash: string | null;
  outputHash: string | null;
  createdAt: string | null;
  userEdited: boolean;
};
export const sampleProvenance: GroceryProvenance = {
  source: "sample",
  model: null,
  imageHash: null,
  outputHash: null,
  createdAt: null,
  userEdited: false,
};
export function GroceryPhoto({
  onApply,
}: {
  onApply: (
    rows: IngredientRow[],
    text: string,
    provenance: GroceryProvenance,
  ) => void;
}) {
  const [picture, setPicture] = useState(""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [result, setResult] = useState<DoVisionResult | null>(null),
    [draft, setDraft] = useState("");
  const request = useRef<AbortController | null>(null),
    generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
      request.current?.abort();
    },
    [],
  );
  function clear() {
    generation.current++;
    request.current?.abort();
    setPicture("");
    setResult(null);
    setDraft("");
    setConsent(false);
    setBusy(false);
    setNotice("Photo removed. No pantry changes were made.");
  }
  async function select(file: File) {
    const attempt = ++generation.current;
    request.current?.abort();
    setResult(null);
    setDraft("");
    setConsent(false);
    setPicture("");
    setBusy(true);
    setNotice("");
    try {
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > 10000000
      )
        throw new Error(
          "Choose a PNG, JPEG or WebP under 10 MB. Convert HEIC first.",
        );
      const bitmap = await createImageBitmap(file);
      try {
        const canvas = document.createElement("canvas"),
          scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx)
          throw new Error(
            "Image preview unavailable. Enter ingredients manually.",
          );
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL("image/jpeg", 0.85);
        if (data.length * 0.75 > 2000000)
          throw new Error(
            "Image remains too large. Crop it or choose a smaller image.",
          );
        if (attempt === generation.current) setPicture(data);
      } finally {
        bitmap.close();
      }
    } catch (e) {
      if (attempt === generation.current)
        setNotice(e instanceof Error ? e.message : "Cannot open this image.");
    } finally {
      if (attempt === generation.current) setBusy(false);
    }
  }
  async function observe() {
    if (!picture || !consent || busy) return;
    const attempt = ++generation.current,
      controller = new AbortController();
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
          question: groceryQuestion,
          purpose: "observation",
          consent: true,
        }),
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.message ||
            "Photo review unavailable. Enter ingredients manually.",
        );
      if (
        typeof body.text !== "string" ||
        body.text.length > 16000 ||
        !body.receipt ||
        typeof body.receipt.model !== "string" ||
        !body.receipt.model.trim() ||
        body.receipt.model.length > 150 ||
        typeof body.receipt.createdAt !== "string" ||
        body.receipt.createdAt.length > 50 ||
        ![body.receipt.imageHash, body.receipt.outputHash].every(
          (v) => typeof v === "string" && /^[a-f0-9]{64}$/i.test(v),
        ) ||
        !Number.isFinite(Date.parse(body.receipt.createdAt))
      )
        throw new Error(
          "Incomplete observation receipt. Nothing was applied; enter ingredients manually.",
        );
      if (attempt !== generation.current) return;
      setResult(body);
      setDraft(body.text);
      setNotice(
        "Review the observation. Candidate quantities remain unconfirmed.",
      );
    } catch (e) {
      if (attempt === generation.current)
        setNotice(
          controller.signal.aborted
            ? "Stopped. Nothing was applied."
            : e instanceof Error
              ? e.message
              : "Observation failed.",
        );
    } finally {
      if (attempt === generation.current) {
        setBusy(false);
        setConsent(false);
        request.current = null;
      }
    }
  }
  function synthetic() {
    clear();
    const text = JSON.stringify(
      {
        ingredients: [
          {
            name: "Tomatoes",
            amount: null,
            unit: "g",
            uncertainty:
              "Synthetic sample: weight is unknown. Enter your illustrative quantity.",
          },
          {
            name: "Aubergine",
            amount: 3,
            unit: "each",
            uncertainty:
              "Synthetic sample candidate count; confirm or correct.",
          },
          {
            name: "Basil",
            amount: 1,
            unit: "each",
            uncertainty:
              "Synthetic sample candidate bunch; confirm or correct.",
          },
        ],
      },
      null,
      2,
    );
    onApply(
      parseIngredientObservation(text, "photo").rows.map((r) => ({
        ...r,
        source: "sample",
      })),
      text,
      sampleProvenance,
    );
  }
  return (
    <section
      className="ld-grocery-photo"
      aria-label="Fridge and pantry photo review"
    >
      <h3>Show DO your fridge or pantry.</h3>
      <p>
        Choose a photo to preview on this device. Only after separate consent
        will the existing DO vision service send the image and grocery question
        to configured OpenAI, Anthropic or Google providers, with fallback if a
        provider fails. No retailer receives it. Avoid faces, addresses and
        private documents.
      </p>
      <label className="ld-file">
        Choose fridge or pantry photo
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label="Choose fridge or pantry photo"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void select(file);
            e.target.value = "";
          }}
        />
      </label>
      <button className="ld-text-button" onClick={synthetic} disabled={busy}>
        Use synthetic photo observations — no model call
      </button>
      {picture && (
        <>
          <div className="ld-photo-preview">
            {/* Local object/data preview only; never persisted. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={picture}
              alt="Your selected fridge or pantry photo, for your review"
            />
          </div>
          <label className="ld-check">
            <input
              type="checkbox"
              aria-label="Consent to grocery photo review"
              checked={consent}
              disabled={busy}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              Send this image and grocery question to the disclosed vision
              providers once. I understand that observations can be wrong and
              cannot verify food safety.
            </span>
          </label>
          <button
            className="ld-dark"
            disabled={!consent || busy}
            onClick={() => void observe()}
          >
            {busy ? "Reviewing photo…" : "Find ingredient candidates"}
          </button>
          <button className="ld-text-button" onClick={clear}>
            {busy ? "Cancel photo request" : "Remove photo"}
          </button>
        </>
      )}
      {notice && <p role="status">{notice}</p>}
      {result && (
        <>
          <label>
            Review the observation before mapping
            <textarea
              aria-label="Review photo observation"
              value={draft}
              maxLength={16000}
              rows={8}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
          <p>
            Model: {result.receipt.model}. Counts and weights are proposals;
            every ingredient needs your confirmation below.
          </p>
          <button
            className="ld-dark"
            onClick={() => {
              const parsed = parseIngredientObservation(draft, "photo");
              if (!parsed.rows.length) {
                setNotice(parsed.notice);
                return;
              }
              onApply(parsed.rows, draft, {
                source: "photo",
                model: result.receipt.model,
                imageHash: result.receipt.imageHash,
                outputHash: result.receipt.outputHash,
                createdAt: result.receipt.createdAt,
                userEdited: draft !== result.text,
              });
              setNotice(
                "Candidate rows replaced the pantry. Review and confirm each row below; no stock is approved yet.",
              );
            }}
          >
            Map observation to ingredient review
          </button>
        </>
      )}
    </section>
  );
}
