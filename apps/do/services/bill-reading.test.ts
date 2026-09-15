import { describe, expect, it } from 'vitest';
import { safeBillReading } from './bill-reading';
const reading = { category: 'broadband', currency: 'NZD', monthlyCost: 89, usage: 300, unit: 'Mbps', exitFee: null };
describe('bill figure boundaries', () => {
 it('keeps unknown exit fees unknown', () => expect(safeBillReading(reading).exitFee).toBeNull());
 it('does not turn foreign currency into NZ dollar savings', () => expect(safeBillReading({ ...reading, currency: 'other' })).toMatchObject({ monthlyCost: null, exitFee: null, usage: 300 }));
 it('does not turn data volume into download speed', () => expect(safeBillReading({ ...reading, unit: 'GB' }).usage).toBeNull());
 it('rejects unusable readings instead of consuming a task for blanks', () => expect(() => safeBillReading({ ...reading, monthlyCost: null, usage: null })).toThrow());
 it('rejects account identifiers in the output', () => expect(() => safeBillReading({ ...reading, accountNumber: 'private' })).toThrow());
 it('rejects implausible costs', () => expect(() => safeBillReading({ ...reading, monthlyCost: -5 })).toThrow());
});
