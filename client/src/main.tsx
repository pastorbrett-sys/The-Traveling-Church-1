import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator && !(window as any).Capacitor?.isNativePlatform?.()) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
