import { describe, expect, it } from 'vitest';
import { generationCompletion, transcriptionCompletion } from './completion';
const status = (finishReason: string, rawFinishReason?: string, body?: unknown) => transcriptionCompletion(generationCompletion({ finishReason, rawFinishReason, response: { body } }));
describe('sanitized provider ending for transcription', () => {
  it('detects token and context limits without a prompt continuation marker', () => {
    expect(status('length', 'max_output_tokens', { status: 'incomplete' }).status).toBe('incomplete');
    expect(status('length', 'max_tokens').status).toBe('incomplete');
    expect(status('length', 'model_context_window_exceeded').status).toBe('incomplete');
    expect(status('stop', undefined, { status: 'incomplete' }).status).toBe('incomplete');
    expect(status('stop', undefined, { status: 'completed', incomplete_details: { reason: 'max_output_tokens' } }).status).toBe('incomplete');
  });
  it('normal endings describe the provider, not verified image transcription', () => {
    expect(status('stop', undefined, { status: 'completed' }).status).toBe('provider-ended');
    expect(status('stop', 'end_turn').status).toBe('provider-ended');
    expect(status('stop', 'stop').status).toBe('provider-ended');
    expect(status('stop').status).toBe('unverified');
    expect(status('other').status).toBe('unverified');
    expect(transcriptionCompletion().status).toBe('unverified');
  });
  it('returns only whitelisted terminal metadata without payloads/secrets', () => {
    const value = generationCompletion({ finishReason: 'stop', rawFinishReason: 'secret reason', response: { body: { status: 'secret status', text: 'private text', incomplete_details: { reason: 'private reason' }, headers: { secret: 'private' } } } });
    expect(value).toEqual({ finishReason: 'stop', rawFinishReason: 'unknown', providerStatus: 'unknown', incompleteReason: 'unknown' });
    expect(status('content-filter', 'refusal').status).toBe('incomplete');
    expect(status('stop', 'end_turn', { status: 'failed' }).status).toBe('incomplete');
  });
});
