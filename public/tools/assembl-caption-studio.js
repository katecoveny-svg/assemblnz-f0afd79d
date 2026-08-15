(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  root.AssemblCaptionStudio = api;
  api.start();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PLATFORMS = [
    {
      id: "linkedin",
      label: "linkedin",
      note: "considered · short paragraphs",
    },
    {
      id: "instagram",
      label: "instagram",
      note: "visual-first · clear opening",
    },
    {
      id: "facebook",
      label: "facebook",
      note: "warm · conversational",
    },
    {
      id: "x",
      label: "x",
      note: "concise · 280 characters max",
    },
    {
      id: "tiktok",
      label: "tiktok",
      note: "direct · spoken rhythm",
    },
    {
      id: "youtube",
      label: "youtube",
      note: "title + description",
    },
  ];

  const DEFAULTS = {
    moment:
      "An application, order or claim is being processed. The customer is waiting.",
    outcome:
      "assembl checks what is missing and prepares a clear brief for the named person handling the next step.",
  };

  const HOOKS = {
    assembl: [
      "The customer is waiting. Preparation does not have to.",
      "The system is processing. The customer can still progress.",
      "A genuine wait can still produce one useful consequence.",
    ],
    kate: [
      "I keep noticing the same problem inside otherwise good customer journeys.",
      "I’m interested in the moments businesses still treat as dead space.",
      "One thing I keep coming back to: customers should not have to stand still because a system is processing.",
    ],
  };

  const CTA = {
    explain: [
      "Bring us one wait. We’ll show you what could happen inside it.",
      "Show us where customers wait.",
      "What do you wish could simply be assembl’d?",
    ],
    showcase: [
      "See the demonstrator, then tell us which part of the journey should be useful next.",
      "Bring us one real wait. We’ll make the next step visible.",
      "What would a better-prepared handoff change for your customers?",
    ],
    invite: [
      "Show us where your customers wait.",
      "Bring us one wait. We’ll show you what could happen inside it.",
      "What do you wish could simply be assembl’d?",
    ],
    build: [
      "I’d love to know which wait you would start with.",
      "If this brings a wait in your own business to mind, tell me.",
      "What do you wish could simply be assembl’d?",
    ],
  };

  const PURPOSE_LINES = {
    assembl: {
      explain:
        "The useful part is not more interaction. It is a better-prepared next step.",
      showcase:
        "The demonstrator makes the wait, preparation, review and human handoff visible.",
      invite:
        "The starting point is one real wait, one useful action and one named person who remains in control.",
      build:
        "We are building this one bounded journey at a time, then testing what genuinely helps.",
    },
    kate: {
      explain:
        "That’s the kind of friction I’m building assembl to change.",
      showcase:
        "I built this demonstrator to make the wait, preparation, review and human handoff visible.",
      invite:
        "I start with one real wait, one useful action and one named person who remains in control.",
      build:
        "I’m building it one bounded journey at a time, then testing what actually helps.",
    },
  };

  const STATUS = {
    demonstrator: {
      full:
        "This is a demonstrator. It shows what could be prepared, not a claim about a live client system.",
      short: "Demonstrator only. It is not a live client system.",
      tiny: "Demo only.",
    },
    proposed: {
      full:
        "This is a proposed assembl concept. The workflow and commercial effect would need to be tested.",
      short: "Proposed assembl concept. It still needs to be tested.",
      tiny: "Proposed concept.",
    },
    established: {
      full:
        "This is an established assembl capability. A person still reviews the consequential next step, and the evidence record stays visible.",
      short: "Established capability, with human review and evidence.",
      tiny: "Verified capability.",
    },
  };

  function clean(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function sentence(value) {
    const text = clean(value);
    if (!text) return "";
    return /[.!?…]$/.test(text) ? text : text + ".";
  }

  function truncate(value, max) {
    const text = clean(value);
    if (text.length <= max) return text;
    const slice = text.slice(0, Math.max(1, max - 1));
    const boundary = slice.lastIndexOf(" ");
    return (boundary > max * 0.6 ? slice.slice(0, boundary) : slice).trim() + "…";
  }

  function firstSentence(value) {
    const text = sentence(value);
    const match = text.match(/^.*?[.!?…](?:\s|$)/);
    return match ? match[0].trim() : text;
  }

  function joinParagraphs(parts) {
    return parts.filter(Boolean).join("\n\n");
  }

  function choose(list, variation) {
    return list[Math.abs(Number(variation) || 0) % list.length];
  }

  function hashtags(platform, enabled) {
    if (!enabled) return "";
    const sets = {
      linkedin: "#assembl #customerexperience #newzealandbusiness",
      instagram: "#assembl #customerexperience #makewaitinguseful",
      facebook: "#assembl #customerexperience",
      x: "#assembl",
      tiktok: "#assembl #customerexperience #businesstok",
      youtube: "#assembl #customerexperience",
    };
    return sets[platform] || "#assembl";
  }

  function getOptions(options) {
    const source = options || {};
    const voice = source.voice === "kate" ? "kate" : "assembl";
    const purpose = Object.prototype.hasOwnProperty.call(
      PURPOSE_LINES[voice],
      source.purpose
    )
      ? source.purpose
      : "explain";
    const truth = Object.prototype.hasOwnProperty.call(STATUS, source.truth)
      ? source.truth
      : "demonstrator";

    return {
      moment: sentence(source.moment || DEFAULTS.moment),
      outcome: sentence(source.outcome || DEFAULTS.outcome),
      voice,
      purpose,
      truth,
      includeHashtags: source.includeHashtags !== false,
      variation: Number(source.variation) || 0,
    };
  }

  function generateCaptions(options) {
    const data = getOptions(options);
    const hook = choose(HOOKS[data.voice], data.variation);
    const purposeLine = PURPOSE_LINES[data.voice][data.purpose];
    const status = STATUS[data.truth];
    const cta = choose(CTA[data.purpose], data.variation);
    const founderBridge =
      data.voice === "kate"
        ? "The technology matters, but the human consequence matters more."
        : "";

    const linkedin = joinParagraphs([
      hook,
      data.moment,
      data.voice === "kate" ? purposeLine : data.outcome,
      data.voice === "kate" ? data.outcome : purposeLine,
      founderBridge,
      status.full,
      cta,
      hashtags("linkedin", data.includeHashtags),
    ]);

    const instagram = joinParagraphs([
      hook,
      joinParagraphs([data.moment, data.outcome]),
      purposeLine,
      status.short,
      cta,
      hashtags("instagram", data.includeHashtags),
    ]);

    const facebook = joinParagraphs([
      hook,
      data.moment + " " + data.outcome,
      purposeLine,
      status.full,
      cta,
      hashtags("facebook", data.includeHashtags),
    ]);

    const xHook =
      data.voice === "kate"
        ? "I keep noticing customer waits that could be more useful."
        : "A genuine wait can still produce one useful next step.";
    const xCta =
      data.purpose === "invite"
        ? "Where do your customers wait?"
        : "Which wait would you start with?";
    const xSuffix = [
      status.tiny,
      xCta,
      hashtags("x", data.includeHashtags),
    ]
      .filter(Boolean)
      .join(" ");
    let xMoment = truncate(firstSentence(data.moment), 68);
    let xOutcome = truncate(data.outcome, 88);
    let x = joinParagraphs([xHook, xMoment, xOutcome, xSuffix]);
    if (x.length > 280) {
      xOutcome = truncate(xOutcome, Math.max(42, 88 - (x.length - 280)));
      x = joinParagraphs([xHook, xMoment, xOutcome, xSuffix]);
    }
    if (x.length > 280) {
      xMoment = truncate(xMoment, Math.max(36, 68 - (x.length - 280)));
      x = joinParagraphs([xHook, xMoment, xOutcome, xSuffix]);
    }

    const tiktok = joinParagraphs([
      truncate(hook, 100),
      data.moment + " " + data.outcome,
      data.voice === "kate"
        ? "This is the kind of everyday friction I want assembl to make useful."
        : "Make the wait useful. Keep the customer in control.",
      status.short,
      truncate(cta, 80),
      hashtags("tiktok", data.includeHashtags),
    ]);

    const youtubeTitle =
      data.voice === "kate"
        ? truncate("Why I’m building assembl for the moments customers wait", 70)
        : truncate("make the wait useful. | assembl", 70);
    const youtube = joinParagraphs([
      youtubeTitle,
      data.moment + " " + data.outcome,
      purposeLine,
      status.full,
      cta,
      hashtags("youtube", data.includeHashtags),
    ]);

    return {
      linkedin,
      instagram,
      facebook,
      x,
      tiktok,
      youtube,
    };
  }

  function escapeAttribute(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function fieldMarkup() {
    return `
      <div class="acs-caption-fields">
        <label class="acs-caption-field acs-caption-field--wide">
          <span>THE REAL MOMENT</span>
          <textarea data-caption-input="moment" rows="3" placeholder="Name the genuine customer wait."></textarea>
        </label>
        <label class="acs-caption-field acs-caption-field--wide">
          <span>WHAT GETS PREPARED</span>
          <textarea data-caption-input="outcome" rows="3" placeholder="Name the useful output and the human handoff."></textarea>
        </label>
        <label class="acs-caption-field">
          <span>VOICE</span>
          <select data-caption-input="voice">
            <option value="assembl">assembl brand</option>
            <option value="kate">Kate’s founder voice</option>
          </select>
        </label>
        <label class="acs-caption-field">
          <span>PURPOSE</span>
          <select data-caption-input="purpose">
            <option value="explain">explain the idea</option>
            <option value="showcase">share a demonstrator</option>
            <option value="invite">invite one wait</option>
            <option value="build">build in public</option>
          </select>
        </label>
        <label class="acs-caption-field">
          <span>TRUTH STATUS · CHOOSE WHAT IS TRUE</span>
          <select data-caption-input="truth">
            <option value="demonstrator">demonstrator</option>
            <option value="proposed">proposed concept</option>
            <option value="established">verified capability</option>
          </select>
        </label>
        <label class="acs-caption-check">
          <input type="checkbox" data-caption-input="hashtags" checked>
          <span>include restrained hashtags</span>
        </label>
      </div>
    `;
  }

  function cardsMarkup() {
    return PLATFORMS.map(function (platform) {
      return `
        <article class="acs-caption-card" data-caption-card="${escapeAttribute(
          platform.id
        )}">
          <div class="acs-caption-card__head">
            <div>
              <p>${escapeAttribute(platform.note)}</p>
              <h3>${escapeAttribute(platform.label)}</h3>
            </div>
            <span data-caption-count="${escapeAttribute(platform.id)}">0 CHARS</span>
          </div>
          <textarea
            data-caption-output="${escapeAttribute(platform.id)}"
            aria-label="${escapeAttribute(platform.label)} caption"
            spellcheck="true"
          ></textarea>
          <div class="acs-caption-card__foot">
            <span>editable before you copy</span>
            <button type="button" data-caption-copy="${escapeAttribute(
              platform.id
            )}">COPY</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function styleMarkup() {
    return `
      <style>
        #assembl-caption-studio,
        #assembl-caption-studio * {
          box-sizing: border-box;
        }
        #assembl-caption-studio {
          --acs-plum: #240B21;
          --acs-ink: #2E2C2C;
          --acs-paper: #FFFDFB;
          --acs-chalk: #F5F1F2;
          --acs-rose: #E9BCA9;
          width: 100%;
          color: var(--acs-chalk);
          background: #120510;
          padding: 8px clamp(18px, 4vw, 56px) 96px;
          font-family: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .acs-caption-inner {
          width: min(1060px, 100%);
          margin: 0 auto;
          padding: clamp(28px, 5vw, 54px);
          border: 1px solid rgba(233, 188, 169, 0.28);
          background: var(--acs-plum);
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.24);
        }
        .acs-caption-eyebrow,
        .acs-caption-field > span,
        .acs-caption-card__head p,
        .acs-caption-card__head > span,
        .acs-caption-card__foot,
        .acs-caption-check,
        .acs-caption-status {
          font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .acs-caption-eyebrow {
          margin: 0 0 18px;
          color: var(--acs-rose);
          font-size: 11px;
        }
        .acs-caption-title {
          max-width: 760px;
          margin: 0;
          color: var(--acs-paper);
          font-size: clamp(32px, 5vw, 64px);
          font-weight: 500;
          letter-spacing: -0.045em;
          line-height: 0.98;
          text-transform: lowercase;
        }
        .acs-caption-intro {
          max-width: 660px;
          margin: 24px 0 0;
          color: rgba(245, 241, 242, 0.78);
          font-size: 16px;
          line-height: 1.55;
        }
        .acs-caption-fields {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 38px;
        }
        .acs-caption-field,
        .acs-caption-check {
          min-width: 0;
        }
        .acs-caption-field--wide {
          grid-column: span 3;
        }
        .acs-caption-field > span {
          display: block;
          margin-bottom: 8px;
          color: rgba(245, 241, 242, 0.62);
          font-size: 9px;
          line-height: 1.4;
        }
        .acs-caption-field textarea,
        .acs-caption-field select {
          width: 100%;
          min-height: 48px;
          border: 1px solid rgba(233, 188, 169, 0.28);
          border-radius: 0;
          color: var(--acs-paper);
          background: rgba(18, 5, 16, 0.52);
          padding: 13px 14px;
          font: 14px/1.5 "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          outline: none;
        }
        .acs-caption-field textarea {
          resize: vertical;
        }
        .acs-caption-field textarea:focus,
        .acs-caption-field select:focus,
        .acs-caption-check:focus-within {
          border-color: var(--acs-rose);
          box-shadow: 0 0 0 2px rgba(233, 188, 169, 0.16);
        }
        .acs-caption-check {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 48px;
          align-self: end;
          padding: 0 12px;
          border: 1px solid rgba(233, 188, 169, 0.2);
          color: rgba(245, 241, 242, 0.68);
          font-size: 9px;
          line-height: 1.4;
        }
        .acs-caption-check input {
          width: 16px;
          height: 16px;
          accent-color: var(--acs-rose);
        }
        .acs-caption-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 18px 0 0;
        }
        .acs-caption-actions button,
        .acs-caption-card__foot button {
          min-height: 42px;
          border: 1px solid rgba(233, 188, 169, 0.5);
          border-radius: 0;
          color: var(--acs-paper);
          background: transparent;
          padding: 10px 15px;
          font: 500 10px/1 "IBM Plex Mono", ui-monospace, monospace;
          letter-spacing: 0.08em;
          cursor: pointer;
        }
        .acs-caption-actions button:first-child {
          border-color: var(--acs-rose);
          color: var(--acs-plum);
          background: var(--acs-rose);
        }
        .acs-caption-actions button:hover,
        .acs-caption-actions button:focus-visible,
        .acs-caption-card__foot button:hover,
        .acs-caption-card__foot button:focus-visible {
          border-color: var(--acs-paper);
          color: var(--acs-plum);
          background: var(--acs-paper);
          outline: none;
        }
        .acs-caption-status {
          min-height: 18px;
          margin: 12px 0 0;
          color: rgba(245, 241, 242, 0.58);
          font-size: 9px;
        }
        .acs-caption-results {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 30px;
        }
        .acs-caption-card {
          display: flex;
          min-width: 0;
          min-height: 340px;
          flex-direction: column;
          background: var(--acs-paper);
          color: var(--acs-ink);
        }
        .acs-caption-card__head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 18px 12px;
          border-bottom: 1px solid rgba(46, 44, 44, 0.12);
        }
        .acs-caption-card__head p {
          margin: 0 0 5px;
          color: rgba(46, 44, 44, 0.54);
          font-size: 8px;
          line-height: 1.4;
        }
        .acs-caption-card__head h3 {
          margin: 0;
          font-size: 23px;
          font-weight: 500;
          letter-spacing: -0.025em;
          line-height: 1;
          text-transform: lowercase;
        }
        .acs-caption-card__head > span {
          color: rgba(46, 44, 44, 0.5);
          font-size: 8px;
          white-space: nowrap;
        }
        .acs-caption-card__head > span[data-over-limit="true"] {
          color: #8A3D49;
        }
        .acs-caption-card textarea {
          width: 100%;
          min-height: 230px;
          flex: 1;
          resize: vertical;
          border: 0;
          outline: 0;
          color: var(--acs-ink);
          background: transparent;
          padding: 18px;
          font: 14px/1.55 "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .acs-caption-card textarea:focus {
          box-shadow: inset 0 0 0 2px rgba(138, 80, 92, 0.34);
        }
        .acs-caption-card__foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 18px;
          border-top: 1px solid rgba(46, 44, 44, 0.12);
          color: rgba(46, 44, 44, 0.5);
          font-size: 8px;
        }
        .acs-caption-card__foot button {
          min-height: 34px;
          border-color: rgba(46, 44, 44, 0.34);
          color: var(--acs-ink);
          padding: 8px 11px;
        }
        @media (max-width: 780px) {
          #assembl-caption-studio {
            padding-inline: 12px;
          }
          .acs-caption-inner {
            padding: 28px 18px;
          }
          .acs-caption-fields,
          .acs-caption-results {
            grid-template-columns: 1fr;
          }
          .acs-caption-field--wide {
            grid-column: auto;
          }
          .acs-caption-card {
            min-height: 310px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          #assembl-caption-studio *,
          #assembl-caption-studio *::before,
          #assembl-caption-studio *::after {
            scroll-behavior: auto !important;
            transition: none !important;
          }
        }
      </style>
    `;
  }

  function copyText(text) {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopy(text);
      });
    }
    return fallbackCopy(text);
  }

  function fallbackCopy(text) {
    return new Promise(function (resolve, reject) {
      try {
        const helper = document.createElement("textarea");
        helper.value = text;
        helper.setAttribute("readonly", "");
        helper.style.cssText =
          "position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none";
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand("copy");
        helper.remove();
        if (copied) resolve();
        else reject(new Error("Copy was not available."));
      } catch (error) {
        reject(error);
      }
    });
  }

  function mount() {
    if (typeof document === "undefined" || !document.body) return false;
    if (document.getElementById("assembl-caption-studio")) return true;
    const routeMode =
      typeof window !== "undefined"
        ? String(window.location.hash || "").replace(/^#/, "")
        : "";
    if (routeMode === "studio") return true;

    const pageText = clean(document.body.textContent);
    if (
      pageText.indexOf("CREATIVE STUDIO") === -1 ||
      pageText.indexOf("PNG STILL") === -1
    ) {
      return false;
    }

    const section = document.createElement("section");
    section.id = "assembl-caption-studio";
    section.setAttribute("aria-labelledby", "assembl-caption-title");
    section.innerHTML =
      styleMarkup() +
      `
        <div class="acs-caption-inner">
          <p class="acs-caption-eyebrow">CAPTIONS · SIX SOCIAL VARIANTS</p>
          <h2 class="acs-caption-title" id="assembl-caption-title">write from one real moment.</h2>
          <p class="acs-caption-intro">
            Start with what is actually happening and what assembl prepares next.
            The studio adapts the length, rhythm and invitation for each platform
            without changing the truth.
          </p>
          ${fieldMarkup()}
          <div class="acs-caption-actions">
            <button type="button" data-caption-action="generate">GENERATE SIX CAPTIONS</button>
            <button type="button" data-caption-action="variation">NEW VARIATION</button>
            <button type="button" data-caption-action="copy-all">COPY ALL</button>
            <button type="button" data-caption-action="download">DOWNLOAD .TXT</button>
          </div>
          <p class="acs-caption-status" data-caption-status aria-live="polite"></p>
          <div class="acs-caption-results">
            ${cardsMarkup()}
          </div>
        </div>
      `;

    document.body.appendChild(section);

    if (routeMode === "captions") {
      Array.from(document.body.children).forEach(function (child) {
        if (child !== section) child.style.display = "none";
      });
      document.body.style.margin = "0";
      document.body.style.minHeight = "100vh";
      document.body.style.background = "#120510";
      section.style.paddingTop = "28px";
    }

    const moment = section.querySelector('[data-caption-input="moment"]');
    const outcome = section.querySelector('[data-caption-input="outcome"]');
    const voice = section.querySelector('[data-caption-input="voice"]');
    const purpose = section.querySelector('[data-caption-input="purpose"]');
    const truth = section.querySelector('[data-caption-input="truth"]');
    const hashtagInput = section.querySelector('[data-caption-input="hashtags"]');
    const statusLine = section.querySelector("[data-caption-status]");
    let variation = 0;

    moment.value = DEFAULTS.moment;
    outcome.value = DEFAULTS.outcome;

    function announce(message) {
      statusLine.textContent = message;
    }

    function readOptions() {
      return {
        moment: moment.value,
        outcome: outcome.value,
        voice: voice.value,
        purpose: purpose.value,
        truth: truth.value,
        includeHashtags: hashtagInput.checked,
        variation,
      };
    }

    function updateCount(platform) {
      const output = section.querySelector(
        '[data-caption-output="' + platform + '"]'
      );
      const count = section.querySelector(
        '[data-caption-count="' + platform + '"]'
      );
      if (!output || !count) return;
      count.textContent = output.value.length + " CHARS";
      count.dataset.overLimit =
        platform === "x" && output.value.length > 280 ? "true" : "false";
    }

    function render(message) {
      const generated = generateCaptions(readOptions());
      PLATFORMS.forEach(function (platform) {
        const output = section.querySelector(
          '[data-caption-output="' + platform.id + '"]'
        );
        output.value = generated[platform.id];
        updateCount(platform.id);
      });
      announce(message || "Six on-brand drafts generated. Review before publishing.");
    }

    function allText() {
      return PLATFORMS.map(function (platform) {
        const output = section.querySelector(
          '[data-caption-output="' + platform.id + '"]'
        );
        return platform.label.toUpperCase() + "\n" + output.value;
      }).join("\n\n----------------------------------------\n\n");
    }

    section
      .querySelector('[data-caption-action="generate"]')
      .addEventListener("click", function () {
        render();
      });

    section
      .querySelector('[data-caption-action="variation"]')
      .addEventListener("click", function () {
        variation += 1;
        render("A new variation is ready. The facts and truth status are unchanged.");
      });

    section
      .querySelector('[data-caption-action="copy-all"]')
      .addEventListener("click", function () {
        copyText(allText())
          .then(function () {
            announce("All six captions copied.");
          })
          .catch(function () {
            announce("Copy was not available. Select the text and copy it manually.");
          });
      });

    section
      .querySelector('[data-caption-action="download"]')
      .addEventListener("click", function () {
        const blob = new Blob([allText()], {
          type: "text/plain;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          "assembl-social-captions-" +
          new Date().toISOString().slice(0, 10) +
          ".txt";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 1000);
        announce("Caption file downloaded.");
      });

    section.querySelectorAll("[data-caption-copy]").forEach(function (button) {
      button.addEventListener("click", function () {
        const platform = button.getAttribute("data-caption-copy");
        const output = section.querySelector(
          '[data-caption-output="' + platform + '"]'
        );
        copyText(output.value)
          .then(function () {
            announce(platform + " caption copied.");
          })
          .catch(function () {
            announce("Copy was not available. Select the text and copy it manually.");
          });
      });
    });

    section.querySelectorAll("[data-caption-output]").forEach(function (output) {
      output.addEventListener("input", function () {
        updateCount(output.getAttribute("data-caption-output"));
      });
    });

    [voice, purpose, truth, hashtagInput].forEach(function (control) {
      control.addEventListener("change", function () {
        render("Captions updated for the selected voice and status.");
      });
    });

    render();
    return true;
  }

  function start() {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    let attempts = 0;
    const tryMount = function () {
      attempts += 1;
      if (mount() || attempts >= 120) {
        window.clearInterval(timer);
      }
    };
    const timer = window.setInterval(tryMount, 250);
    window.setTimeout(tryMount, 0);
  }

  return {
    DEFAULTS,
    PLATFORMS,
    generateCaptions,
    mount,
    start,
  };
});
