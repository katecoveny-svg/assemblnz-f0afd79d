import { describe, it, expect } from "vitest";
import {
  checkSqlSafety,
  assertSqlSafe,
  SqlSafetyError,
  type SqlSafetyResult,
} from "./sqlSafety";

const issuesOf = (r: SqlSafetyResult): string[] =>
  r.ok === false ? r.issues.map((i) => i.code) : [];

describe("checkSqlSafety", () => {
  describe("UPDATE", () => {
    it("passes a well-formed UPDATE with WHERE", () => {
      const r = checkSqlSafety(
        "UPDATE users SET name = 'Kate' WHERE id = 'abc';",
      );
      expect(r.ok).toBe(true);
    });

    it("blocks UPDATE missing WHERE", () => {
      const r = checkSqlSafety("UPDATE users SET active = false");
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues.map((i) => i.code)).toContain("MISSING_WHERE");
      }
    });

    it("allows UPDATE without WHERE when @safe-no-where comment present", () => {
      const r = checkSqlSafety(
        "UPDATE users SET active = false; -- @safe-no-where",
      );
      expect(r.ok).toBe(true);
    });

    it("blocks UPDATE with truncated WHERE clause", () => {
      const r = checkSqlSafety("UPDATE users SET name = 'a' WHERE id =");
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues.map((i) => i.code)).toContain("TRAILING_OPERATOR");
      }
    });

    it("blocks UPDATE with empty SET clause", () => {
      const r = checkSqlSafety("UPDATE users SET WHERE id = '1'");
      expect(r.ok).toBe(false);
    });

    it("blocks UPDATE truncated mid-string", () => {
      const r = checkSqlSafety("UPDATE users SET name = 'Ka WHERE id = 1");
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues.map((i) => i.code)).toContain("UNBALANCED_QUOTES");
      }
    });

    it("blocks UPDATE ending in AND", () => {
      const r = checkSqlSafety(
        "UPDATE users SET x = 1 WHERE id = '1' AND",
      );
      expect(r.ok).toBe(false);
    });
  });

  describe("INSERT", () => {
    it("passes a well-formed INSERT", () => {
      const r = checkSqlSafety(
        "INSERT INTO users (id, name) VALUES ('1', 'Kate');",
      );
      expect(r.ok).toBe(true);
    });

    it("blocks INSERT with no VALUES", () => {
      const r = checkSqlSafety("INSERT INTO users (id, name)");
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues.map((i) => i.code)).toContain("INSERT_NO_VALUES");
      }
    });

    it("blocks INSERT with column/value arity mismatch", () => {
      const r = checkSqlSafety(
        "INSERT INTO users (id, name, email) VALUES ('1', 'Kate')",
      );
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues.map((i) => i.code)).toContain(
          "INSERT_COLUMN_VALUE_MISMATCH",
        );
      }
    });

    it("blocks INSERT with truncated VALUES", () => {
      const r = checkSqlSafety("INSERT INTO users (id, name) VALUES ('1',");
      expect(r.ok).toBe(false);
    });

    it("allows INSERT … SELECT", () => {
      const r = checkSqlSafety(
        "INSERT INTO archive (id, name) SELECT id, name FROM users WHERE active = false;",
      );
      expect(r.ok).toBe(true);
    });
  });

  describe("DELETE", () => {
    it("blocks DELETE missing WHERE", () => {
      const r = checkSqlSafety("DELETE FROM users");
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues.map((i) => i.code)).toContain("MISSING_WHERE");
      }
    });

    it("allows DELETE WHERE", () => {
      const r = checkSqlSafety("DELETE FROM users WHERE id = '1'");
      expect(r.ok).toBe(true);
    });
  });

  describe("structural checks", () => {
    it("flags unbalanced parens", () => {
      const r = checkSqlSafety(
        "INSERT INTO users (id, name VALUES ('1', 'Kate')",
      );
      expect(r.ok).toBe(false);
    });

    it("flags empty SQL", () => {
      const r = checkSqlSafety("");
      expect(r.ok).toBe(false);
    });

    it("ignores -- line comments correctly", () => {
      const r = checkSqlSafety(
        "UPDATE users SET name = 'a' WHERE id = '1'; -- update one row",
      );
      expect(r.ok).toBe(true);
    });

    it("ignores /* block comments */", () => {
      const r = checkSqlSafety(
        "UPDATE users /* fix typo */ SET name = 'a' WHERE id = '1'",
      );
      expect(r.ok).toBe(true);
    });
  });

  describe("assertSqlSafe", () => {
    it("throws on unsafe SQL", () => {
      expect(() => assertSqlSafe("UPDATE users SET x = 1")).toThrow(
        SqlSafetyError,
      );
    });

    it("does not throw on safe SQL", () => {
      expect(() =>
        assertSqlSafe("UPDATE users SET x = 1 WHERE id = '1'"),
      ).not.toThrow();
    });
  });
});
