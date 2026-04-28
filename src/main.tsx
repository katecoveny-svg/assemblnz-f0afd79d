import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./utils/pwaManifest";
import { ModuleErrorBoundary } from "./components/ModuleErrorBoundary";
import { runStartupDependencyCheck } from "./utils/startupDependencyCheck";
import { track } from "./lib/analytics";

registerServiceWorker();
runStartupDependencyCheck();

// Site-wide light-glass upgrade — every page picks up the
// charcoal-on-light remap defined in index.css. Pages with
// their own kete-light-shell wrapper still work; they just
// inherit the same rules from body.
document.body.classList.add("light-glass-shell");

// Delegated cta_click listener — fires for every element with data-cta="...".
// Walks up to 4 ancestors so clicks on inner spans/icons still attribute correctly.
document.addEventListener("click", (e) => {
  let el = e.target as HTMLElement | null;
  for (let i = 0; i < 4 && el; i++) {
    const cta = el.getAttribute?.("data-cta");
    if (cta) {
      track("cta_click", {
        cta,
        href: (el as HTMLAnchorElement).href || null,
        path: window.location.pathname,
      });
      return;
    }
    el = el.parentElement;
  }
});

createRoot(document.getElementById("root")!).render(
  <ModuleErrorBoundary>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ModuleErrorBoundary>
);
