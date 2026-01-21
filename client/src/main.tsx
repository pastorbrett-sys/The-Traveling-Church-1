import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Note: @capacitor-community/safe-area plugin handles Android safe area insets automatically
// It patches env(safe-area-inset-*) for older Chromium versions
createRoot(document.getElementById("root")!).render(<App />);
