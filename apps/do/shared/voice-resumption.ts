/** Memory-only continuation of one admitted lease; never a new paid window. */
export class VoiceResumption {
  private handle: string | null = null;
  private used = new Set<string>();
  private revoked = false;
  private attempts = 0;
  constructor(readonly expiresAt: number, private now = Date.now) {}
  update(value: { resumable?: boolean; newHandle?: string }) {
    this.handle = !this.revoked && value.resumable === true && typeof value.newHandle === 'string' && value.newHandle.length > 0 && value.newHandle.length <= 16384 && !this.used.has(value.newHandle) ? value.newHandle : null;
  }
  async take(approve: () => Promise<{ resumeAllowed?: boolean; expiresAt?: number; reuseExistingToken?: boolean }>): Promise<string | null> {
    const handle = this.handle;
    this.handle = null;
    if (this.revoked || !handle || this.attempts >= 2 || this.now() >= this.expiresAt) return null;
    this.attempts++; this.used.add(handle);
    const result = await approve();
    if (this.revoked || this.now() >= this.expiresAt || result.resumeAllowed !== true || result.reuseExistingToken !== true || result.expiresAt !== this.expiresAt) return null;
    return handle;
  }
  revoke() { this.revoked = true; this.handle = null; this.used.clear(); }
}
