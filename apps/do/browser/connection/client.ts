import { CONNECTION_PROTOCOL, connectionSnapshot, type ConnectionCommand } from './protocol';
import type { ConnectionSnapshot } from './broker';
/** Per-window relay, no URLs/storage, no credentials or model endpoint. */
export function companionRequest(command: ConnectionCommand, signal?: AbortSignal): Promise<ConnectionSnapshot> {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    let timer: ReturnType<typeof setTimeout>;
    const cleanup = () => { clearTimeout(timer); window.removeEventListener('message', receive); signal?.removeEventListener('abort', abort); };
    const abort = () => { cleanup(); reject(new Error('Request cancelled.')); };
    const receive = (event: MessageEvent) => {
      const value = event.data;
      if (event.source !== window || event.origin !== location.origin || value?.protocol !== CONNECTION_PROTOCOL || value?.direction !== 'response' || value?.requestId !== requestId) return;
      cleanup();
      if (!value.ok || value.data?.protocol !== CONNECTION_PROTOCOL || typeof value.data.connected !== 'boolean') reject(new Error(typeof value.error === 'string' ? value.error.slice(0, 300) : 'Connection response unavailable.'));
      else { const parsed = connectionSnapshot.safeParse(value.data); if (!parsed.success) reject(new Error('Invalid companion response.')); else resolve(parsed.data); }
    };
    window.addEventListener('message', receive);
    timer = setTimeout(() => { cleanup(); reject(new Error('No companion connection in this browser window. Connect from desktop Chrome.')); }, 6000);
    if (signal?.aborted) { abort(); return; }
    signal?.addEventListener('abort', abort, { once: true });
    window.postMessage({ protocol: CONNECTION_PROTOCOL, direction: 'request', requestId, command }, location.origin);
  });
}
