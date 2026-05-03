/**
 * Generic table renderer — used when a widget reads directly from a
 * Supabase table (e.g. waihanga-subbie-status). Renders a compact
 * scrollable list with the first 3 string-y columns.
 */

export function LiveTableBody({ rows }: { rows: unknown[] }) {
  if (!rows.length) return null;
  const first = rows[0] as Record<string, unknown>;
  const cols = Object.keys(first).slice(0, 3);

  return (
    <div className="max-h-72 overflow-y-auto pr-1">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-muted-foreground font-mono uppercase tracking-wider">
            {cols.map((c) => (
              <th key={c} className="py-1.5 pr-2 font-normal">
                {c.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const row = r as Record<string, unknown>;
            return (
              <tr key={i} className="border-t border-border/40">
                {cols.map((c) => (
                  <td key={c} className="py-1.5 pr-2 text-foreground">
                    {formatCell(row[c])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}
