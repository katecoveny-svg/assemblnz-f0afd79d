(function () {
  const BRAND_STORAGE_KEY = "assembl-tools-brand-config";

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[char]);
  }

  function initBrandConfig(options = {}) {
    const nameInput = $("brandName");
    const taglineInput = $("brandTagline");
    const nameDisplay = $("brandDisplay");
    const taglineDisplay = $("taglineDisplay");
    if (!nameInput || !taglineInput) return;

    const fallbackName = options.fallbackName || "your brand";
    const fallbackTagline = options.fallbackTagline || "";
    const suffix = options.suffix || "";

    function render() {
      const brandName = (nameInput.value || fallbackName).trim().toLowerCase();
      const brandTagline = (taglineInput.value || fallbackTagline).trim();
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify({ brandName, brandTagline }));
      if (nameDisplay) {
        nameDisplay.innerHTML = suffix
          ? `${escapeHtml(brandName)} <span class="dot">·</span> ${escapeHtml(suffix)}`
          : escapeHtml(brandName);
      }
      if (taglineDisplay) taglineDisplay.textContent = brandTagline;
    }

    try {
      const saved = JSON.parse(localStorage.getItem(BRAND_STORAGE_KEY) || "{}");
      nameInput.value = saved.brandName || fallbackName;
      taglineInput.value = saved.brandTagline || fallbackTagline;
    } catch {
      nameInput.value = fallbackName;
      taglineInput.value = fallbackTagline;
    }

    nameInput.addEventListener("input", render);
    taglineInput.addEventListener("input", render);
    render();
  }

  function initApiKeyInput({ storageKey, inputId = "key-input", statusId = "key-status" } = {}) {
    const input = $(inputId);
    if (!input || !storageKey) return;
    const status = $(statusId);
    const show = $("show-key");
    const save = $("save-key");
    const forget = $("forget-key");

    function updateStatus() {
      if (status) status.textContent = localStorage.getItem(storageKey)
        ? "key saved in this browser."
        : "key stored in this browser only.";
    }

    if (save) {
      save.addEventListener("click", () => {
        const value = input.value.trim();
        if (value) localStorage.setItem(storageKey, value);
        input.value = "";
        updateStatus();
      });
    }
    if (show) {
      show.addEventListener("click", () => {
        input.type = input.type === "password" ? "text" : "password";
        show.textContent = input.type === "password" ? "show" : "hide";
      });
    }
    if (forget) {
      forget.addEventListener("click", () => {
        localStorage.removeItem(storageKey);
        input.value = "";
        updateStatus();
      });
    }
    updateStatus();
  }

  async function copyToClipboard(text, buttonElement, copiedText = "copied", resetText = "copy") {
    await navigator.clipboard.writeText(text);
    if (!buttonElement) return;
    const original = buttonElement.textContent || resetText;
    buttonElement.textContent = copiedText;
    buttonElement.classList.add("copied");
    setTimeout(() => {
      buttonElement.textContent = original;
      buttonElement.classList.remove("copied");
    }, 1600);
  }

  async function callAnthropicHaiku({ systemPrompt, userPrompt, temperature = 0.7, apiKey, maxTokens = 2048 }) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!response.ok) {
      throw new Error(`Anthropic request failed (${response.status}): ${await response.text()}`);
    }
    const data = await response.json();
    const text = (data.content || []).map((part) => part.text || "").join("\n").trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    return JSON.parse(cleaned);
  }

  window.HapaiShell = {
    BRAND_STORAGE_KEY,
    callAnthropicHaiku,
    copyToClipboard,
    escapeHtml,
    initApiKeyInput,
    initBrandConfig,
  };
})();
