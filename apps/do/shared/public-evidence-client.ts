/** Browser bridge sends a fixed public selector only, never workspace or transcript text. */
export async function callPublicEvidenceTool(args: Record<string, unknown> | undefined, consent: boolean, signal: AbortSignal, fetcher: typeof fetch = fetch) {
  if (!consent) return { status: 'consent_required', sources: [], message: 'End the call and review the Parliament source-sharing option first.' };
  if (signal.aborted || args?.topic !== 'parliament' || Object.keys(args).some(key => key !== 'topic')) throw new Error('invalid_evidence_request');
  const response = await fetcher('/api/do/public-evidence', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({topic:'parliament',consent:true}), signal,
  });
  if (!response.ok) throw new Error('evidence_unavailable');
  return await response.json() as Record<string, unknown>;
}
