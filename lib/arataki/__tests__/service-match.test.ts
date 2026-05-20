import { describe, expect, it } from 'vitest';
import {
  buildServiceSalesMatch,
  findSalesConversation,
  parseSalesConversationsCsv,
  parseServiceAppointmentsCsv,
  scoreServiceSalesMatch,
  summariseMatches,
  type SalesConversationRow,
  type ServiceAppointmentRow,
} from '../service-match';

const appointment: ServiceAppointmentRow = {
  id: 'appt-1',
  tenant_id: 'tenant-1',
  customer_name: 'Mrs Chen',
  customer_email: 'mrs.chen@example.co.nz',
  customer_phone: '021 555 010',
  vehicle_year: 2018,
  vehicle_make: 'Subaru',
  vehicle_model: 'Outback',
  vehicle_plate: 'ABC123',
  km_current: 124000,
  appointment_at: '2026-05-21T22:00:00.000Z',
  reason: 'oil change',
  status: 'scheduled',
  raw_payload: { service_count: '3' },
};

const sales: SalesConversationRow = {
  id: 'sales-1',
  tenant_id: 'tenant-1',
  customer_name: 'Michelle Chen',
  customer_email: 'MRS.CHEN@example.co.nz',
  customer_phone: null,
  last_conversation_at: '2023-01-10T00:00:00.000Z',
  vehicle_purchased_year: 2018,
  vehicle_purchased_make: 'Subaru',
  vehicle_purchased_model: 'Outback',
  finance_provider: 'UDC',
  finance_term_months: 36,
  finance_end_at: '2026-06-10T00:00:00.000Z',
  warranty_end_at: '2026-06-20T00:00:00.000Z',
};

describe('service-to-sales matching', () => {
  it('scores all deterministic signals and tiers strong opportunities', () => {
    const result = scoreServiceSalesMatch(appointment, sales, new Date('2026-05-20T00:00:00.000Z'));

    expect(result.score).toBe(100);
    expect(result.tier).toBe('strong');
    expect(result.signals.map((signal) => signal.label)).toEqual([
      'Vehicle is 5+ years old',
      'Vehicle km over 100,000',
      'Warranty expires within 90 days',
      'Finance maturity within 60 days',
      'Last sales conversation over 24 months ago',
      'Customer service-loyal with 3+ services',
    ]);
  });

  it('matches service appointments to sales history by normalised email or phone', () => {
    expect(findSalesConversation(appointment, [sales])?.id).toBe('sales-1');
    expect(
      findSalesConversation({ ...appointment, customer_email: null, customer_phone: '(021) 555-010' }, [
        { ...sales, customer_email: null, customer_phone: '021555010' },
      ])?.id,
    ).toBe('sales-1');
  });

  it('builds draft-only opening and handoff text', () => {
    const match = buildServiceSalesMatch(appointment, sales, new Date('2026-05-20T00:00:00.000Z'));

    expect(match.openingLine).toContain("How's the 2018 Subaru Outback going");
    expect(match.followUpLine).toContain('sales floor');
    expect(match.handoffDraft).toContain('Please review before any customer contact');
    expect(summariseMatches([match, { ...match, tier: 'watch' }, { ...match, tier: 'routine' }])).toEqual({
      strong: 1,
      watch: 1,
      routine: 1,
      total: 3,
    });
  });

  it('parses service and sales CSV exports with NZ dates', () => {
    const serviceRows = parseServiceAppointmentsCsv(
      'Customer Name,Email,Phone,Year,Make,Model,Plate,KM,Appointment,Reason,Service Count\nMrs Chen,mrs.chen@example.co.nz,021 555 010,2018,Subaru,Outback,ABC123,"124,000",21/05/2026 10:00,oil change,3',
    );
    const salesRows = parseSalesConversationsCsv(
      'Customer Name,Email,Last Conversation At,Finance End,Warranty End\nMrs Chen,mrs.chen@example.co.nz,10/01/2023,10/06/2026,20/06/2026',
    );

    expect(serviceRows[0]).toMatchObject({
      customer_name: 'Mrs Chen',
      vehicle_year: 2018,
      km_current: 124000,
      appointment_at: '2026-05-21T10:00:00.000Z',
    });
    expect(salesRows[0]).toMatchObject({
      customer_name: 'Mrs Chen',
      last_conversation_at: '2023-01-10T00:00:00.000Z',
      finance_end_at: '2026-06-10T00:00:00.000Z',
      warranty_end_at: '2026-06-20T00:00:00.000Z',
    });
  });
});
