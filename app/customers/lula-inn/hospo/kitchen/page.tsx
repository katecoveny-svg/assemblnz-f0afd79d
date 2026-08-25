import { LULA_BRAND } from '@/lib/customers/lula-inn/brand';
import {
  Container,
  PageHeader,
  Card,
  Grid,
  Stat,
  Section,
  Pill,
  Table,
  nzd,
} from '@/components/customers/lula-inn/ui';
import {
  MENU,
  STOCK,
  SUPPLIER_ORDERS,
  WASTAGE,
  gpPercent,
  type StockRow,
} from '@/lib/customers/lula-inn/demo-data';

const B = LULA_BRAND;

const STOCK_LOCATIONS: StockRow['location'][] = ['Fridge', 'Freezer', 'Dry store', 'Bar'];

function stockStatus(row: StockRow): 'green' | 'amber' | 'red' {
  if (row.onHand <= row.par * 0.5) return 'red';
  if (row.onHand < row.par) return 'amber';
  return 'green';
}

const SUPPLIER_STATUS_TONE: Record<(typeof SUPPLIER_ORDERS)[number]['status'], 'green' | 'amber'> = {
  Draft: 'amber',
  Sent: 'green',
  Delivered: 'green',
};

export default function KitchenPage() {
  const avgGp = Math.round(
    MENU.reduce((sum, item) => sum + gpPercent(item), 0) / MENU.length,
  );
  const belowParStock = STOCK.filter((s) => s.onHand < s.par);
  const draftOrders = SUPPLIER_ORDERS.filter((o) => o.status === 'Draft');
  const draftOrderValue = draftOrders.reduce((sum, o) => sum + o.total, 0);
  const wastageTotal = WASTAGE.reduce((sum, w) => sum + w.cost, 0);

  return (
    <Container>
      <PageHeader
        eyebrow="Food · menu · stock"
        title="Kitchen"
        intro="Menu costings, stock on hand and supplier orders in one place — so the pass, the cool room and the ordering cycle all read from the same numbers."
      />

      {/* KPI row */}
      <Grid min={168} gap={14} style={{ marginBottom: 30 }}>
        <Card pad={18}>
          <Stat value={String(MENU.length)} label="Dishes on menu" />
        </Card>
        <Card pad={18}>
          <Stat value={`${avgGp}%`} label="Average GP% across menu" tone={avgGp >= 65 ? 'green' : 'amber'} />
        </Card>
        <Card pad={18}>
          <Stat
            value={String(belowParStock.length)}
            label="Stock lines below par"
            tone={belowParStock.length ? 'amber' : 'green'}
          />
        </Card>
        <Card pad={18}>
          <Stat
            value={String(draftOrders.length)}
            label="Draft supplier orders"
            tone={draftOrders.length ? 'amber' : 'green'}
          />
        </Card>
      </Grid>

      {/* Menu builder */}
      <Section title="Menu builder" basis="Food Act 2014 · allergen labelling" demo>
        <Card>
          <Table
            columns={[
              { key: 'name', label: 'Dish' },
              { key: 'category', label: 'Category' },
              { key: 'price', label: 'Price', align: 'right' },
              { key: 'cost', label: 'Cost / serve', align: 'right' },
              { key: 'gp', label: 'GP%', align: 'right' },
              { key: 'allergens', label: 'Allergens' },
            ]}
            rows={MENU.map((item) => ({
              name: <span style={{ fontWeight: 700 }}>{item.name}</span>,
              category: item.category,
              price: nzd(item.price),
              cost: nzd(item.costPerServe, true),
              gp: (
                <span style={{ fontWeight: 700, color: gpPercent(item) >= 65 ? B.green : B.amber }}>
                  {gpPercent(item)}%
                </span>
              ),
              allergens: (
                <span style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {item.allergens.map((a) => (
                    <Pill key={a} tone={{ bg: B.sand, text: B.inkSoft }}>
                      {a}
                    </Pill>
                  ))}
                </span>
              ),
            }))}
          />
          <p style={{ fontSize: 12.5, color: B.inkSoft, margin: '12px 0 0', lineHeight: 1.55 }}>
            Allergen tags are mandatory under the Food Standards Code — every dish on the menu must declare
            the nine mandatory allergen groups where present.
          </p>
        </Card>
      </Section>

      {/* Stock levels */}
      <Section title="Stock levels" basis="fridge · freezer · dry · bar" demo>
        <Card>
          {STOCK_LOCATIONS.map((location, li) => {
            const rows = STOCK.filter((s) => s.location === location);
            if (!rows.length) return null;
            return (
              <div
                key={location}
                style={{
                  marginBottom: li < STOCK_LOCATIONS.length - 1 ? 16 : 0,
                  paddingBottom: li < STOCK_LOCATIONS.length - 1 ? 16 : 0,
                  borderBottom: li < STOCK_LOCATIONS.length - 1 ? `1px solid ${B.line}` : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--lula-mono), monospace',
                    fontSize: 12,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: B.brassDark,
                    marginBottom: 8,
                  }}
                >
                  {location}
                </div>
                {rows.map((s, i) => {
                  const status = stockStatus(s);
                  return (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 0',
                        borderBottom: i < rows.length - 1 ? `1px solid ${B.line}` : 'none',
                      }}
                    >
                      <span style={{ flex: 1, fontSize: 13.5, color: B.ink }}>{s.item}</span>
                      <span
                        style={{
                          fontFamily: 'var(--lula-mono), monospace',
                          fontSize: 12.5,
                          color: B.inkSoft,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {s.onHand}/{s.par} {s.unit}
                      </span>
                      <Pill status={status}>
                        {status === 'red' ? 'critical' : status === 'amber' ? 'below par' : 'in stock'}
                      </Pill>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Card>
      </Section>

      {/* Supplier orders */}
      <Section title="Supplier orders" basis="threshold alerts" demo>
        <Card>
          <Table
            columns={[
              { key: 'supplier', label: 'Supplier' },
              { key: 'category', label: 'Category' },
              { key: 'lines', label: 'Lines', align: 'right' },
              { key: 'total', label: 'Total', align: 'right' },
              { key: 'status', label: 'Status' },
            ]}
            rows={SUPPLIER_ORDERS.map((o) => ({
              supplier: <span style={{ fontWeight: 700 }}>{o.supplier}</span>,
              category: o.category,
              lines: String(o.lines),
              total: nzd(o.total, true),
              status: <Pill status={SUPPLIER_STATUS_TONE[o.status]}>{o.status}</Pill>,
            }))}
          />
          <p style={{ fontSize: 12.5, color: B.inkSoft, margin: '12px 0 0', lineHeight: 1.55 }}>
            Draft orders auto-populate from stock lines that have dropped below par — Sanford and Hancocks are
            both waiting on GM sign-off.
          </p>
        </Card>
      </Section>

      {/* Wastage log */}
      <Section title="Wastage log" demo>
        <Card>
          <Table
            columns={[
              { key: 'item', label: 'Item' },
              { key: 'qty', label: 'Qty' },
              { key: 'reason', label: 'Reason' },
              { key: 'cost', label: 'Cost', align: 'right' },
              { key: 'date', label: 'Date' },
            ]}
            rows={WASTAGE.map((w) => ({
              item: <span style={{ fontWeight: 700 }}>{w.item}</span>,
              qty: w.qty,
              reason: w.reason,
              cost: nzd(w.cost, true),
              date: w.date,
            }))}
          />
          <p style={{ fontSize: 12.5, color: B.inkSoft, margin: '12px 0 0', lineHeight: 1.55 }}>
            Total wastage this week: <strong style={{ color: B.red }}>{nzd(wastageTotal, true)}</strong>.
          </p>
        </Card>
      </Section>

      {/* Cost of goods */}
      <Section title="Cost of goods" demo={false}>
        <Card style={{ borderLeft: `4px solid ${B.brass}` }}>
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
            <Stat value={`${avgGp}%`} label="Average GP% across the menu" tone={avgGp >= 65 ? 'green' : 'amber'} />
            <Stat value={nzd(draftOrderValue, true)} label="Value sitting in draft supplier orders" tone="amber" />
            <Stat value={nzd(wastageTotal, true)} label="Wastage cost this week" tone="red" />
          </div>
          <p style={{ fontSize: 13.5, color: B.ink, margin: '14px 0 0', lineHeight: 1.55 }}>
            Menu is holding a healthy average margin, but {nzd(draftOrderValue, true)} of ordering is still
            sitting in draft and this week's wastage is trimming straight off the food-cost line — both are one
            approval away from being resolved.
          </p>
        </Card>
      </Section>
    </Container>
  );
}
