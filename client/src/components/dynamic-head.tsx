import { useEffect } from "react";
import { isVagabondBibleDomain } from "@/lib/host-detection";

export function DynamicHead() {
  useEffect(() => {
    const isVagabond = isVagabondBibleDomain();
    
    if (isVagabond) {
      document.title = "Vagabond Bible - The Best AI Bible Ever Built";
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", "The best AI Bible ever built. Analyze verses, ask questions, dive deeper, and chat with our 24/7 AI pastor wherever, whenever.");
      }
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute("content", "Vagabond Bible - The Best AI Bible Ever Built");
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute("content", "The best AI Bible ever built. Analyze verses, ask questions, dive deeper, and chat with our 24/7 AI pastor.");
      }
      
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        ogUrl.setAttribute("content", "https://vagabondbible.com/");
      }
      
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute("content", "Vagabond Bible - The Best AI Bible Ever Built");
      }
      
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute("content", "The best AI Bible ever built. Analyze verses, ask questions, dive deeper, and chat with our 24/7 AI pastor.");
      }
      
      const twitterUrl = document.querySelector('meta[name="twitter:url"]');
      if (twitterUrl) {
        twitterUrl.setAttribute("content", "https://vagabondbible.com/");
      }
      
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (appleTouchIcon) {
        appleTouchIcon.setAttribute("href", "/vagabond-apple-touch-icon.png");
      }
      
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (!themeColor) {
        const meta = document.createElement('meta');
        meta.name = "theme-color";
        meta.content = "#be9009";
        document.head.appendChild(meta);
      } else {
        themeColor.setAttribute("content", "#be9009");
      }
    }
  }, []);
  
  return null;
}
