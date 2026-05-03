import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./utils/pwaManifest";
import { ModuleErrorBoundary } from "./components/ModuleErrorBoundary";
import { runStartupDependencyCheck } from "./utils/startupDependencyCheck";

registerServiceWorker();
runStartupDependencyCheck();

// Site-wide light-glass upgrade — every page picks up the
// charcoal-on-light remap defined in index.css. Pages with
// their own kete-light-shell wrapper still work; they just
// inherit the same rules from body.
document.body.classList.add("light-glass-shell");

createRoot(document.getElementById("root")!).render(
  <ModuleErrorBoundary>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ModuleErrorBoundary>
);
