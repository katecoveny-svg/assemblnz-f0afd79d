import { describe, expect, it } from 'vitest';
import {
  buildLoanCarSummary,
  isOverdue,
  normaliseLoanCarStatus,
  parseLoanCarsCsv,
  type LoanCarRow,
} from '../loan-cars';

const BASE_ROW: LoanCarRow = {
  id: 'loan-1',
  user_id: 'user-1',
  tenant_id: 'tenant-1',
  make: 'Suzuki',
  model: 'Swift',
  rego: 'ABC123',
  status: 'available',
  borrower_name: null,
  borrower_phone: null,
  return_date: null,
  expected_return_at: null,
  loan_started_at: null,
  linked_job_id: null,
  notes: null,
  created_at: '2026-05-20T00:00:00.000Z',
  updated_at: null,
};

describe('Arataki loan car helpers', () => {
  it('normalises common dealer status labels', () => {
    expect(normaliseLoanCarStatus('On Loan')).toBe('on_loan');
    expect(normaliseLoanCarStatus('loaned')).toBe('on_loan');
    expect(normaliseLoanCarStatus('checked out')).toBe('on_loan');
    expect(normaliseLoanCarStatus('Workshop')).toBe('maintenance');
    expect(normaliseLoanCarStatus('ready')).toBe('available');
  });

  it('parses quoted CSV rows and NZ date strings', () => {
    const rows = parseLoanCarsCsv(
      [
        'Make,Model,Rego,Status,Borrower Name,Borrower Phone,Return Date,Notes',
        'Suzuki,Swift,abc123,loaned,"Mrs Chen","021 555 010","23/05/2026 15:30","Waiting on oil change"',
      ].join('\n'),
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      make: 'Suzuki',
      model: 'Swift',
      rego: 'ABC123',
      status: 'on_loan',
      borrower_name: 'Mrs Chen',
      borrower_phone: '021 555 010',
      notes: 'Waiting on oil change',
    });
    expect(rows[0].expected_return_at).toBe('2026-05-23T15:30:00.000Z');
  });

  it('identifies overdue cars and writes an operator-first summary', () => {
    const now = new Date('2026-05-20T22:00:00.000Z');
    const rows: LoanCarRow[] = [
      {
        ...BASE_ROW,
        id: 'loan-1',
        status: 'on_loan',
        expected_return_at: '2026-05-20T20:00:00.000Z',
        borrower_name: 'Mrs Chen',
      },
      {
        ...BASE_ROW,
        id: 'loan-2',
        rego: 'DEF456',
        status: 'available',
      },
    ];

    expect(isOverdue(rows[0], now)).toBe(true);
    const summary = buildLoanCarSummary(rows, now);
    expect(summary.overdue).toBe(1);
    expect(summary.available).toBe(1);
    expect(summary.wardenDraft).toContain('Loan Car Warden flags 1 overdue return');
  });
});
