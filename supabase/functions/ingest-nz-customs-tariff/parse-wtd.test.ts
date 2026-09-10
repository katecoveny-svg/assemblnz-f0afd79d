// Run with:
//   deno test --allow-read supabase/functions/ingest-nz-customs-tariff/parse-wtd.test.ts
import { assertEquals, assertGreaterOrEqual } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { parseSectionLabel, parseWtdSections } from "./parse-wtd.ts";

const FIXTURE = new URL("./fixtures/wtd-index-snippet.html", import.meta.url);

Deno.test("parseSectionLabel expands chapter ranges and decodes entities", () => {
  const a = parseSectionLabel(
    "Section V, Chapters 25 &#x2013; 27: Salt, sulphur, earths and stone",
  );
  assertEquals(a?.roman, "V");
  assertEquals(a?.chapters, [25, 26, 27]);
  assertEquals(a?.title, "Salt, sulphur, earths and stone");

  const b = parseSectionLabel(
    "Section XXI, Chapters 97 - 98: Works of art, collectors&#x2019; pieces, and antiques",
  );
  assertEquals(b?.roman, "XXI");
  assertEquals(b?.chapters, [97, 98]);
  assertEquals(b?.title.includes("collectors'"), true);

  const c = parseSectionLabel(
    "Section III, Chapter 15: Animal or vegetable fats and oils",
  );
  assertEquals(c?.chapters, [15]);
});

Deno.test("parseWtdSections reads current download-block layout from fixture", async () => {
  const html = await Deno.readTextFile(FIXTURE);
  const { sections, docEffective } = parseWtdSections(html);

  assertEquals(docEffective, "1 July 2026");
  assertEquals(sections.length, 21);
  assertEquals(sections[0].roman, "I");
  assertEquals(sections[0].chapters, [1, 2, 3, 4, 5]);
  assertEquals(sections[0].pdfUrl, "https://www.customs.govt.nz/media/zzspaxr1/section-i.pdf");
  assertEquals(sections[0].title, "Live animals; animal products");
  assertEquals(sections[0].effective, null); // page has no per-section Effective line

  assertEquals(sections[7].roman, "VIII");
  assertEquals(sections[7].chapters, [41, 42, 43]);
  assertEquals(sections[20].roman, "XXI");
  assertEquals(sections[20].chapters, [97, 98]);
  assertEquals(sections[20].title.includes("collectors'"), true);
});

Deno.test("parseWtdSections still accepts legacy title= attribute layout", () => {
  const html = `
    <p>recent updates, effective 1 January 2026.</p>
    <a href="/media/old/section-viii.pdf"
       title="Section VIII, Chapters 41–43: Raw hides and skins, leather, furskins and articles thereof">
      Section VIII PDF
    </a>
    <a href="/media/old/section-i.pdf"
       title="Section I, Chapters 1-5: Live animals; animal products">PDF</a>
  `;
  // Force legacy path: no download-block__title, but title= attrs present.
  // Current path won't match; legacy path runs when sections.length === 0 after current.
  const { sections, docEffective } = parseWtdSections(html);
  assertEquals(docEffective, "1 January 2026");
  assertEquals(sections.length, 2);
  assertEquals(sections.map((s) => s.roman).sort(), ["I", "VIII"]);
  assertEquals(sections.find((s) => s.roman === "VIII")?.chapters, [41, 42, 43]);
});

Deno.test("parseWtdSections returns zero sections on empty / unrelated HTML", () => {
  const { sections, docEffective } = parseWtdSections("<html><body><p>hello</p></body></html>");
  assertEquals(sections.length, 0);
  assertEquals(docEffective, null);
});

Deno.test({
  name: "parseWtdSections finds ~21 sections on live customs.govt.nz HTML",
  // Network optional: skip if fetch fails (CI offline / customs blocked).
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    let html: string;
    try {
      const res = await fetch(
        "https://www.customs.govt.nz/business/tariffs/working-tariff-document/",
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; AssemblBot/1.0; +https://assembl.co.nz)",
            Accept: "text/html",
          },
        },
      );
      if (!res.ok) {
        console.warn(`live fetch HTTP ${res.status} — skipping`);
        return;
      }
      html = await res.text();
    } catch (err) {
      console.warn(`live fetch failed — skipping: ${(err as Error).message}`);
      return;
    }
    const { sections, docEffective } = parseWtdSections(html);
    assertGreaterOrEqual(sections.length, 15);
    assertEquals(sections.length, 21);
    console.log(
      `live WTD parse: ${sections.length} sections; docEffective=${docEffective}; ` +
        `first=${sections[0]?.roman} last=${sections[sections.length - 1]?.roman}`,
    );
  },
});
