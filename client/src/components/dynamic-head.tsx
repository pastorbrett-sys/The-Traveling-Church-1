import { useEffect } from "react";
import { isVagabondBibleDomain } from "@/lib/host-detection";

const VAGABOND_META = {
  title: "Vagabond Bible - The Best AI Bible Ever Built",
  description: "The best AI Bible ever built. Analyze verses, ask questions, dive deeper, and chat with our 24/7 AI pastor wherever, whenever.",
  url: "https://vagabondbible.com/",
  themeColor: "#be9009",
  manifest: "/manifest.json",
  appleTouchIcon: "/vagabond-apple-touch-icon.png",
};

const CHURCH_META = {
  title: "The Traveling Church - A Global Ministry",
  description: "A global, traveling ministry connecting believers worldwide. Join our community for events, resources, and the AI Bible Buddy.",
  url: "https://travelingchurch.com/",
  themeColor: "#0F172A",
  manifest: "/church-manifest.json",
  appleTouchIcon: "/apple-touch-icon.png",
};

function updateOrCreateMeta(selector: string, content: string, createFn?: () => Element) {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute("content", content);
  } else if (createFn) {
    document.head.appendChild(createFn());
  }
}

function updateMetadata(meta: typeof VAGABOND_META) {
  document.title = meta.title;
  
  updateOrCreateMeta('meta[name="description"]', meta.description);
  updateOrCreateMeta('meta[property="og:title"]', meta.title);
  updateOrCreateMeta('meta[property="og:description"]', meta.description);
  updateOrCreateMeta('meta[property="og:url"]', meta.url);
  updateOrCreateMeta('meta[name="twitter:title"]', meta.title);
  updateOrCreateMeta('meta[name="twitter:description"]', meta.description);
  updateOrCreateMeta('meta[name="twitter:url"]', meta.url);
  
  updateOrCreateMeta('meta[name="theme-color"]', meta.themeColor, () => {
    const el = document.createElement('meta');
    el.name = "theme-color";
    el.content = meta.themeColor;
    return el;
  });
  
  const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
  if (appleTouchIcon) {
    appleTouchIcon.setAttribute("href", meta.appleTouchIcon);
  }
  
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    manifestLink.setAttribute("href", meta.manifest);
  }
}

export function DynamicHead() {
  useEffect(() => {
    const isVagabond = isVagabondBibleDomain();
    updateMetadata(isVagabond ? VAGABOND_META : CHURCH_META);
  }, []);
  
  return null;
}
