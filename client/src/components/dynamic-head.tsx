import { useEffect } from "react";
import { isVagabondBibleDomain } from "@/lib/host-detection";

const VAGABOND_META = {
  title: "Vagabond Faith - AI-Powered Study Bible",
  description: "The AI-powered Bible that makes you feel like you were there. Chat with a 24/7 Pastor, explore Scripture, and gain deeper insights into God's Word.",
  url: "https://vagabondbible.com/",
  themeColor: "#be9009",
  manifest: "/manifest.json",
  appleTouchIcon: "/vagabond-apple-touch-icon.png",
  ogImage: "https://vagabondbible.com/og-image.png",
};

const CHURCH_META = {
  title: "The Global Travel Ministry",
  description: "We travel to where people are to spread the love of God.",
  url: "https://thetravelingchurch.com/",
  themeColor: "#0F172A",
  manifest: "/church-manifest.json",
  appleTouchIcon: "/apple-touch-icon.png",
  ogImage: "https://thetravelingchurch.com/og-image.png",
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
  updateOrCreateMeta('meta[property="og:image"]', meta.ogImage);
  updateOrCreateMeta('meta[name="twitter:title"]', meta.title);
  updateOrCreateMeta('meta[name="twitter:description"]', meta.description);
  updateOrCreateMeta('meta[name="twitter:url"]', meta.url);
  updateOrCreateMeta('meta[name="twitter:image"]', meta.ogImage);
  
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
