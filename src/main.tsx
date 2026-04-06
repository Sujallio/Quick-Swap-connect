import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { validateEnv } from "./lib/env-validation";

// Validate environment variables before app starts
try {
  validateEnv();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Failed to validate environment';
  document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;padding:20px;font-family:system-ui"><div style="max-width:600px;color:#7f1d1d;background:#fee2e2;padding:20px;border-radius:8px"><h1 style="margin:0 0 10px 0;font-size:20px;font-weight:bold">Configuration Error</h1><p style="margin:0;font-size:14px">${message}</p></div></div>`;
  throw error;
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

