import { describe, expect, it } from 'vitest';
import { APICallError, NoOutputGeneratedError } from 'ai';
import { generationFailureDiagnostic } from './reasoning-diagnostics';
describe('closed generation diagnostics', () => {
  it('distinguishes deadlines and schema errors without copying exception data', () => {
    const error = new Error('private prompt, output and credential');
    expect(generationFailureDiagnostic(error, 'provider', true)).toEqual({ category: 'timeout' });
    expect(generationFailureDiagnostic(error, 'schema', false)).toEqual({ category: 'schema_validation' });
    expect(generationFailureDiagnostic(error, 'provider', false)).toEqual({ category: 'provider_or_sdk' });
    expect(generationFailureDiagnostic(new NoOutputGeneratedError({ message: error.message }), 'provider', false)).toEqual({ category: 'empty_output' });
  });
  it('retains only bounded HTTP status, not provider body, URL, headers or cause', () => {
    const error = new APICallError({ message: 'secret', url: 'https://private.invalid', requestBodyValues: { prompt: 'secret' }, statusCode: 400, responseBody: 'secret', responseHeaders: { authorization: 'secret' } });
    expect(generationFailureDiagnostic(error, 'provider', false)).toEqual({ category: 'provider_http', status: 400 });
  });
});
