import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import App from "./App";
import "./index.css";

// Set Android CSS variables IMMEDIATELY before React renders
// This prevents any gap/flash on first load, login, etc.
if (Capacitor.getPlatform() === 'android') {
  document.documentElement.style.setProperty('--android-status-bar-height', '44px');
  document.documentElement.style.setProperty('--android-bottom-inset', '34px');
  console.log('[Android] Set initial safe area CSS variables');
}

createRoot(document.getElementById("root")!).render(<App />);
