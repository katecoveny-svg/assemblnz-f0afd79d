// ============================================================================
// SQL safety checker — detects truncated or malformed UPDATE/INSERT/DELETE
// statements before they are sent to the database.
//
// This is a defensive, conservative parser. It is NOT a full SQL grammar.
// Its only job: catch obvious truncation, missing WHERE, dangling clauses,
// unbalanced quotes/parens, and trailing operators that suggest a copy/paste
// or LLM-generated query was cut off mid-stream.
//
// Use:
//   const result = checkSqlSafety(sql);
//   if (!result.ok) throw new SqlSafetyError(result.issues);
//   // …or wrap calls with assertSqlSafe(sql)
// ============================================================================

export type SqlSafetyIssue = {
  code:
    | "EMPTY"
    | "UNBALANCED_QUOTES"
    | "UNBALANCED_PARENS"
    | "TRAILING_OPERATOR"
    | "MISSING_WHERE"
    | "DANGLING_WHERE"
    | "DANGLING_SET"
    | "INSERT_NO_VALUES"
    | "INSERT_COLUMN_VALUE_MISMATCH"
    | "TRUNCATED_STRING"
    | "TRUNCATED_KEYWORD"
    | "UNTERMINATED_STATEMENT";
  message: string;
};

export type SqlSafetyResult =
  | { ok: true; statementType: StatementType }
  | { ok: false; statementType: StatementType; issues: SqlSafetyIssue[] };

export type StatementType =
  | "UPDATE"
  | "INSERT"
  | "DELETE"
  | "SELECT"
  | "OTHER"
  | "EMPTY";

export class SqlSafetyError extends Error {
  readonly issues: SqlSafetyIssue[];
  constructor(issues: SqlSafetyIssue[]) {
    super(
      `SQL blocked by safety check:\n` +
        issues.map((i) => `  • [${i.code}] ${i.message}`).join("\n"),
    );
    this.name = "SqlSafetyError";
    this.issues = issues;
  }
}

// ---------------------------------------------------------------------------
// Strip comments and string literals so we can lex-check structure safely.
// Returns the cleaned SQL plus counts for downstream validation.
// ---------------------------------------------------------------------------
type StripResult = {
  cleaned: string;
  singleQuoteOpen: boolean;
  doubleQuoteOpen: boolean;
  dollarTagOpen: string | null;
};

const stripStringsAndComments = (sql: string): StripResult => {
  let out = "";
  let i = 0;
  let singleQuoteOpen = false;
  let doubleQuoteOpen = false;
  let dollarTagOpen: string | null = null;

  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];

    // -- line comment
    if (ch === "-" && next === "-") {
      const nl = sql.indexOf("\n", i);
      i = nl === -1 ? sql.length : nl;
      continue;
    }
    // /* block comment */
    if (ch === "/" && next === "*") {
      const end = sql.indexOf("*/", i + 2);
      i = end === -1 ? sql.length : end + 2;
      continue;
    }
    // $tag$ ... $tag$ dollar-quoted string (Postgres)
    if (ch === "$") {
      const m = sql.slice(i).match(/^\$([A-Za-z_][A-Za-z0-9_]*)?\$/);
      if (m) {
        const tag = m[0];
        const close = sql.indexOf(tag, i + tag.length);
        if (close === -1) {
          dollarTagOpen = tag;
          i = sql.length;
          continue;
        }
        out += " ";
        i = close + tag.length;
        continue;
      }
    }
    // 'string' — handle '' escape
    if (ch === "'") {
      i++;
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") {
          i += 2;
          continue;
        }
        if (sql[i] === "'") {
          i++;
          break;
        }
        i++;
      }
      if (i > sql.length || (sql[sql.length - 1] !== "'" && i >= sql.length)) {
        // we never found a closing quote
        // walking past end is the signal — set flag if last char wasn't a quote
        // (defensive: explicit re-check below)
      }
      out += " ";
      continue;
    }
    // "identifier" — Postgres quoted identifiers (also '' escape via "")
    if (ch === '"') {
      i++;
      while (i < sql.length) {
        if (sql[i] === '"' && sql[i + 1] === '"') {
          i += 2;
          continue;
        }
        if (sql[i] === '"') {
          i++;
          break;
        }
        i++;
      }
      out += " ";
      continue;
    }

    out += ch;
    i++;
  }

  // Detect unclosed quotes by re-scanning original for parity.
  singleQuoteOpen = countUnescapedQuotes(sql, "'") % 2 !== 0;
  doubleQuoteOpen = countUnescapedQuotes(sql, '"') % 2 !== 0;

  return { cleaned: out, singleQuoteOpen, doubleQuoteOpen, dollarTagOpen };
};

const countUnescapedQuotes = (sql: string, quote: "'" | '"'): number => {
  let n = 0;
  let i = 0;
  // Skip content inside comments to avoid false positives
  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (ch === "-" && next === "-") {
      const nl = sql.indexOf("\n", i);
      i = nl === -1 ? sql.length : nl;
      continue;
    }
    if (ch === "/" && next === "*") {
      const end = sql.indexOf("*/", i + 2);
      i = end === -1 ? sql.length : end + 2;
      continue;
    }
    if (ch === quote) {
      // doubled quote = escaped, skip both
      if (sql[i + 1] === quote) {
        i += 2;
        continue;
      }
      n++;
    }
    i++;
  }
  return n;
};

// ---------------------------------------------------------------------------
// Detect statement type from the first significant keyword.
// ---------------------------------------------------------------------------
const detectType = (cleaned: string): StatementType => {
  const trimmed = cleaned.trim().toUpperCase();
  if (!trimmed) return "EMPTY";
  if (trimmed.startsWith("UPDATE")) return "UPDATE";
  if (trimmed.startsWith("INSERT")) return "INSERT";
  if (trimmed.startsWith("DELETE")) return "DELETE";
  if (trimmed.startsWith("SELECT") || trimmed.startsWith("WITH")) return "SELECT";
  return "OTHER";
};

// ---------------------------------------------------------------------------
// Main check
// ---------------------------------------------------------------------------
export const checkSqlSafety = (rawSql: string): SqlSafetyResult => {
  const issues: SqlSafetyIssue[] = [];
  const sql = (rawSql ?? "").trim();

  if (!sql) {
    return {
      ok: false,
      statementType: "EMPTY",
      issues: [{ code: "EMPTY", message: "SQL is empty." }],
    };
  }

  const { cleaned, singleQuoteOpen, doubleQuoteOpen, dollarTagOpen } =
    stripStringsAndComments(sql);
  const statementType = detectType(cleaned);

  // 1. Unbalanced quotes — strongest signal of truncation
  if (singleQuoteOpen) {
    issues.push({
      code: "UNBALANCED_QUOTES",
      message: "Unterminated single quote ('). Statement appears truncated.",
    });
  }
  if (doubleQuoteOpen) {
    issues.push({
      code: "UNBALANCED_QUOTES",
      message: 'Unterminated double quote ("). Statement appears truncated.',
    });
  }
  if (dollarTagOpen) {
    issues.push({
      code: "TRUNCATED_STRING",
      message: `Unterminated dollar-quoted string ${dollarTagOpen}. Statement appears truncated.`,
    });
  }

  // 2. Unbalanced parentheses
  let parenDepth = 0;
  for (const ch of cleaned) {
    if (ch === "(") parenDepth++;
    else if (ch === ")") parenDepth--;
    if (parenDepth < 0) {
      issues.push({
        code: "UNBALANCED_PARENS",
        message: "Closing parenthesis without a matching opener.",
      });
      break;
    }
  }
  if (parenDepth > 0) {
    issues.push({
      code: "UNBALANCED_PARENS",
      message: `Unclosed parenthesis (${parenDepth} open). Statement appears truncated.`,
    });
  }

  // 3. Trailing operator / connector — strong sign of truncation
  const tail = cleaned.replace(/;?\s*$/, "").trim();
  const TRAILING_TOKENS =
    /(=|<>|!=|<=|>=|<|>|\+|-|\*|\/|,|\b(AND|OR|NOT|IN|LIKE|ILIKE|BETWEEN|ON|SET|WHERE|VALUES|FROM|JOIN|RETURNING)\b)$/i;
  if (TRAILING_TOKENS.test(tail)) {
    const m = tail.match(TRAILING_TOKENS)!;
    issues.push({
      code: "TRAILING_OPERATOR",
      message: `Statement ends with "${m[0]}" — looks truncated mid-clause.`,
    });
  }

  // 4. Truncated keyword (e.g. "WHE" instead of "WHERE")
  const SUSPECT_TRUNC = /\b(SEL|UPD|INS|DEL|FRO|WHE|VAL|RETU|JOI|GRO|ORDE|HAVI|CRE|ALT|DRO)\s*$/i;
  if (SUSPECT_TRUNC.test(tail)) {
    issues.push({
      code: "TRUNCATED_KEYWORD",
      message: "Statement ends with a partial keyword — looks truncated.",
    });
  }

  // 5. Statement-type specific checks
  if (statementType === "UPDATE") {
    checkUpdate(cleaned, issues);
  } else if (statementType === "DELETE") {
    checkDelete(cleaned, issues);
  } else if (statementType === "INSERT") {
    checkInsert(cleaned, issues);
  }

  // 6. Statement should normally terminate cleanly. Allow missing semicolon
  // (many drivers accept it), but flag if the body is suspiciously short.
  if (statementType !== "EMPTY" && cleaned.trim().length < 8) {
    issues.push({
      code: "UNTERMINATED_STATEMENT",
      message: "Statement body is too short to be valid.",
    });
  }

  if (issues.length > 0) {
    return { ok: false, statementType, issues };
  }
  return { ok: true, statementType };
};

// ---------------------------------------------------------------------------
// UPDATE-specific: must contain SET; must contain WHERE (or explicit override
// via -- @safe-no-where comment); SET clause must not be empty.
// ---------------------------------------------------------------------------
const checkUpdate = (cleaned: string, issues: SqlSafetyIssue[]) => {
  const upper = cleaned.toUpperCase();
  const hasSet = /\bSET\b/.test(upper);
  const hasWhere = /\bWHERE\b/.test(upper);
  const allowNoWhere = /--\s*@safe-no-where/i.test(cleaned);

  if (!hasSet) {
    issues.push({
      code: "DANGLING_SET",
      message: "UPDATE is missing a SET clause.",
    });
    return;
  }

  // SET clause body — between SET and WHERE/RETURNING/end
  const setMatch = cleaned.match(/\bSET\b([\s\S]*?)(\bWHERE\b|\bRETURNING\b|;?\s*$)/i);
  if (setMatch) {
    const body = setMatch[1].trim().replace(/;$/, "").trim();
    if (!body) {
      issues.push({
        code: "DANGLING_SET",
        message: "SET clause is empty.",
      });
    } else if (/[,=]\s*$/.test(body)) {
      issues.push({
        code: "TRAILING_OPERATOR",
        message: "SET clause ends with a dangling assignment.",
      });
    }
  }

  if (!hasWhere && !allowNoWhere) {
    issues.push({
      code: "MISSING_WHERE",
      message:
        "UPDATE is missing a WHERE clause. This would update every row. " +
        "If intentional, append the comment `-- @safe-no-where` to the SQL.",
    });
  }

  if (hasWhere) {
    const whereBody = cleaned
      .split(/\bWHERE\b/i)[1]
      ?.split(/\bRETURNING\b/i)[0]
      ?.replace(/;?\s*$/, "")
      .trim();
    if (!whereBody) {
      issues.push({
        code: "DANGLING_WHERE",
        message: "WHERE clause is empty.",
      });
    }
  }
};

// ---------------------------------------------------------------------------
// DELETE-specific: same WHERE rule as UPDATE.
// ---------------------------------------------------------------------------
const checkDelete = (cleaned: string, issues: SqlSafetyIssue[]) => {
  const upper = cleaned.toUpperCase();
  const hasWhere = /\bWHERE\b/.test(upper);
  const allowNoWhere = /--\s*@safe-no-where/i.test(cleaned);

  if (!hasWhere && !allowNoWhere) {
    issues.push({
      code: "MISSING_WHERE",
      message:
        "DELETE is missing a WHERE clause. This would remove every row. " +
        "If intentional, append the comment `-- @safe-no-where` to the SQL.",
    });
  }
  if (hasWhere) {
    const whereBody = cleaned
      .split(/\bWHERE\b/i)[1]
      ?.split(/\bRETURNING\b/i)[0]
      ?.replace(/;?\s*$/, "")
      .trim();
    if (!whereBody) {
      issues.push({
        code: "DANGLING_WHERE",
        message: "WHERE clause is empty.",
      });
    }
  }
};

// ---------------------------------------------------------------------------
// INSERT-specific: must have VALUES (...) or SELECT; column/value arity must
// match when both are explicit.
// ---------------------------------------------------------------------------
const checkInsert = (cleaned: string, issues: SqlSafetyIssue[]) => {
  const upper = cleaned.toUpperCase();
  const hasValues = /\bVALUES\b/.test(upper);
  const hasSelect = /\bSELECT\b/.test(upper);
  const hasDefaultValues = /\bDEFAULT\s+VALUES\b/.test(upper);

  if (!hasValues && !hasSelect && !hasDefaultValues) {
    issues.push({
      code: "INSERT_NO_VALUES",
      message: "INSERT has neither VALUES, SELECT, nor DEFAULT VALUES.",
    });
    return;
  }

  // Column / value arity check (best effort — only when columns explicit)
  const colMatch = cleaned.match(/\bINSERT\s+INTO\s+[^\s(]+\s*\(([^)]*)\)/i);
  const valMatch = cleaned.match(/\bVALUES\s*\(([^)]*)\)/i);
  if (colMatch && valMatch) {
    const cols = splitTopLevel(colMatch[1]);
    const vals = splitTopLevel(valMatch[1]);
    if (cols.length !== vals.length) {
      issues.push({
        code: "INSERT_COLUMN_VALUE_MISMATCH",
        message: `INSERT has ${cols.length} column(s) but ${vals.length} value(s) in the first row.`,
      });
    }
  }
};

// Split a comma-separated list ignoring commas inside nested parens.
const splitTopLevel = (s: string): string[] => {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
};

// ---------------------------------------------------------------------------
// Convenience wrapper — throws SqlSafetyError if the SQL is unsafe.
// ---------------------------------------------------------------------------
export const assertSqlSafe = (sql: string): void => {
  const result = checkSqlSafety(sql);
  if (result.ok === false) {
    throw new SqlSafetyError(result.issues);
  }
};
