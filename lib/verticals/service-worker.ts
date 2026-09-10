import type { Vertical } from './config';

/** Network-only. A self-contained offline page cannot expose a cached private shell. */
export function verticalWorker(v: Vertical): string {
  const html = `<!doctype html><html lang="en-NZ"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#240B21"><title>${v.name} · offline</title><style>body{margin:0;background:#fffdfb;color:#240b21;font:18px/1.65 system-ui;display:grid;min-height:100dvh;place-items:center}main{max-width:440px;padding:32px}small{letter-spacing:.12em}h1{font-size:44px;line-height:1.05;font-weight:500;letter-spacing:-.05em}a{color:inherit}button{font:inherit;background:#240b21;color:#fffdfb;border:0;border-radius:99px;padding:14px 24px;margin:16px 0}</style><main><small>${v.name} · assembl</small><h1>Ready when you reconnect.</h1><p>You are offline. Live chat needs an internet connection. No messages will be sent or queued while you are offline.</p><p>While you wait, collect the facts for your ${v.output.toLowerCase()}: what is happening, what is confirmed and what your ${v.reviewer.toLowerCase()} needs to check.</p><a href="/agents/${v.slug}/app">Try connecting again →</a></main></html>`;
  return `'use strict';
const BASE = ${JSON.stringify(`/agents/${v.slug}`)};
const OFFLINE = ${JSON.stringify(html)};
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || request.mode !== 'navigate' || url.origin !== self.location.origin) return;
  if (url.pathname !== BASE && !url.pathname.startsWith(BASE + '/')) return;
  event.respondWith(fetch(request).catch(() => new Response(OFFLINE, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
  })));
});`;
}
