// ToroaApp — family navigator app (formerly HelmApp)
// Re-exports the Tōroa dashboard as the app entry point

import ToroaDashboard from "@/components/toroa/ToroaDashboard";

export default function ToroaApp() {
  return <ToroaDashboard />;
}
