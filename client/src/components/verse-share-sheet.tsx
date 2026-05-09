import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { useTranslation } from "@/lib/i18n";

import sunsetOcean from "@/assets/share-backgrounds/sunset-ocean.jpg";
import mountainMist from "@/assets/share-backgrounds/mountain-mist.jpg";
import whiteFlower from "@/assets/share-backgrounds/white-flower.jpg";
import nightSky from "@/assets/share-backgrounds/night-sky.jpg";
import wheatField from "@/assets/share-backgrounds/wheat-field.jpg";
import desertDunes from "@/assets/share-backgrounds/desert-dunes.jpg";
import lakeReflection from "@/assets/share-backgrounds/lake-reflection.jpg";
import pinkSky from "@/assets/share-backgrounds/pink-sky.jpg";
import stormClouds from "@/assets/share-backgrounds/storm-clouds.jpg";
import calmOcean from "@/assets/share-backgrounds/calm-ocean.jpg";
import softClouds from "@/assets/share-backgrounds/soft-clouds.jpg";
import mistyForest from "@/assets/share-backgrounds/misty-forest.jpg";
import darkCharcoal from "@/assets/share-backgrounds/dark-charcoal.jpg";
import goldenSunset from "@/assets/share-backgrounds/golden-sunset.jpg";
import greenBlur from "@/assets/share-backgrounds/green-blur.jpg";
import darkMountain from "@/assets/share-backgrounds/dark-mountain.jpg";
import darkForest from "@/assets/share-backgrounds/dark-forest.jpg";
import darkOcean from "@/assets/share-backgrounds/dark-ocean.jpg";
import lightningStorm from "@/assets/share-backgrounds/lightning-storm.jpg";
import darkRock from "@/assets/share-backgrounds/dark-rock.jpg";
import fireEmbers from "@/assets/share-backgrounds/fire-embers.jpg";
import vagabondLogo from "@assets/Vagabond_Faith_Black_1778324785021.png";

const BACKGROUNDS = [
  { id: "sunset-ocean", src: sunsetOcean, name: "Sunset Ocean" },
  { id: "mountain-mist", src: mountainMist, name: "Mountain Mist" },
  { id: "storm-clouds", src: stormClouds, name: "Storm Clouds" },
  { id: "dark-mountain", src: darkMountain, name: "Dark Mountain" },
  { id: "dark-forest", src: darkForest, name: "Dark Forest" },
  { id: "dark-ocean", src: darkOcean, name: "Dark Ocean" },
  { id: "lightning-storm", src: lightningStorm, name: "Lightning Storm" },
  { id: "dark-rock", src: darkRock, name: "Dark Rock" },
  { id: "fire-embers", src: fireEmbers, name: "Fire Embers" },
  { id: "calm-ocean", src: calmOcean, name: "Calm Ocean" },
  { id: "night-sky", src: nightSky, name: "Night Sky" },
  { id: "soft-clouds", src: softClouds, name: "Soft Clouds" },
  { id: "wheat-field", src: wheatField, name: "Wheat Field" },
  { id: "misty-forest", src: mistyForest, name: "Misty Forest" },
  { id: "desert-dunes", src: desertDunes, name: "Desert Dunes" },
  { id: "dark-charcoal", src: darkCharcoal, name: "Dark Charcoal" },
  { id: "golden-sunset", src: goldenSunset, name: "Golden Sunset" },
  { id: "green-blur", src: greenBlur, name: "Green Blur" },
  { id: "lake-reflection", src: lakeReflection, name: "Lake Reflection" },
  { id: "pink-sky", src: pinkSky, name: "Pink Sky" },
  { id: "white-flower", src: whiteFlower, name: "White Flower" },
];

interface VerseShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  verseText: string;
  verseReference: string;
}

export function VerseShareSheet({ isOpen, onClose, verseText, verseReference }: VerseShareSheetProps) {
  const { t, isAmharic } = useTranslation();
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  
  const isNative = Capacitor.isNativePlatform();
  const isAndroid = Capacitor.getPlatform() === "android";
  const isIOS = Capacitor.getPlatform() === "ios";

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = vagabondLogo;
    img.onload = () => {
      logoImgRef.current = img;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSelectedBackground(null);
      setGeneratedImage(null);
      setIsSaved(false);
    }
  }, [isOpen]);

  const wrapText = useCallback((ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const words = text.split(" ");
    let line = "";
    let lineCount = 0;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, y + lineCount * lineHeight);
        line = words[n] + " ";
        lineCount++;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, y + lineCount * lineHeight);
    return lineCount + 1;
  }, []);

  const generateImage = useCallback(async (backgroundSrc: string) => {
    setIsGenerating(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = 1080;
    canvas.height = 1080;
    
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    
    bgImg.onload = () => {
      const imgRatio = bgImg.width / bgImg.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;
      
      if (imgRatio > 1) {
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      }
      
      ctx.drawImage(bgImg, offsetX, offsetY, drawWidth, drawHeight);
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const fontSize = Math.min(72, Math.max(48, 1200 / verseText.length * 4.5));
      ctx.font = `500 ${fontSize}px "Spectral SC", Georgia, serif`;
      
      let cleanText = verseText.replace(/["\u201C\u201D]/g, '"').replace(/['\u2018\u2019]/g, "'");
      cleanText = cleanText.replace(/§[^§]+§\s*/g, '').trim();
      const displayText = isAmharic ? `"${cleanText}"` : `"${cleanText.toUpperCase()}"`;
      
      const lineHeight = fontSize * 1.4;
      const maxWidth = canvas.width - 140;
      
      
      const words = displayText.split(" ");
      let lines: string[] = [];
      let currentLine = "";
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      
      const totalTextHeight = lines.length * lineHeight;
      const startY = (canvas.height - totalTextHeight) / 2 + lineHeight / 2;
      
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
      });
      
      if (logoImgRef.current) {
        const logoHeight = 72;
        const logoWidth = (logoImgRef.current.width / logoImgRef.current.height) * logoHeight;
        const logoX = 55;
        const logoY = canvas.height - logoHeight - 55;
        
        ctx.globalAlpha = 0.9;
        ctx.drawImage(logoImgRef.current, logoX, logoY, logoWidth, logoHeight);
        ctx.globalAlpha = 1;
      }
      
      ctx.font = "400 38px Poppins, sans-serif";
      ctx.textAlign = "right";
      
      const refText = isAmharic ? verseReference : verseReference.toUpperCase();
      const letterSpacing = 6;
      let totalWidth = 0;
      for (let i = 0; i < refText.length; i++) {
        totalWidth += ctx.measureText(refText[i]).width;
        if (i < refText.length - 1) totalWidth += letterSpacing;
      }
      
      ctx.textAlign = "left";
      let refX = canvas.width - totalWidth - 55;
      const refY = canvas.height - 82;
      
      for (let i = 0; i < refText.length; i++) {
        ctx.fillText(refText[i], refX, refY);
        refX += ctx.measureText(refText[i]).width + letterSpacing;
      }
      
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setGeneratedImage(dataUrl);
      setIsGenerating(false);
    };
    
    bgImg.onerror = () => {
      console.error("Failed to load background image");
      setIsGenerating(false);
    };
    
    bgImg.src = backgroundSrc;
  }, [verseText, verseReference, wrapText]);

  const handleBackgroundSelect = (bg: typeof BACKGROUNDS[0]) => {
    setSelectedBackground(bg.id);
    setIsSaved(false);
    generateImage(bg.src);
  };

  const handleShare = async () => {
    if (!generatedImage) return;
    
    try {
      if (isNative) {
        const base64Data = generatedImage.split(",")[1];
        const fileName = `verse-${Date.now()}.jpg`;
        
        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });
        
        const fileUri = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Cache,
        });
        
        await Share.share({
          title: verseReference,
          text: `📖 ${verseReference}\nvagabondbible.com`,
          url: fileUri.uri,
          dialogTitle: t("verse_share.share_verse"),
        });
      } else {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], `${verseReference.replace(/\s+/g, "-")}.jpg`, { type: "image/jpeg" });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: verseReference,
            text: `📖 ${verseReference}\nvagabondbible.com`,
            files: [file],
          });
        } else {
          const link = document.createElement("a");
          link.href = generatedImage;
          link.download = `${verseReference.replace(/\s+/g, "-")}.jpg`;
          link.click();
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error("Share failed:", error);
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `${verseReference.replace(/\s+/g, "-")}.jpg`;
      link.click();
      setIsSaved(true);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200]"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "tween", 
              duration: 0.25, 
              ease: [0.32, 0.72, 0, 1]
            }}
            className="fixed left-0 right-0 bg-background rounded-t-2xl z-[201] flex flex-col"
            style={{
              bottom: isNative && isIOS ? "calc(64px + env(safe-area-inset-bottom, 0px))" : "0px",
              maxHeight: isNative ? "70vh" : "85vh",
              paddingBottom: "16px"
            }}
          >
            <div 
              className="flex items-center justify-between p-4 border-b"
            >
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-share-cancel" className="hover:bg-[#daa520]/20 hover:text-[#daa520]">
                {t("verse_share.cancel")}
              </Button>
              <span className="font-semibold">{t("verse_share.choose_image")}</span>
              <div className="w-16" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {!generatedImage ? (
                <>
                  <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">{t("verse_share.choose_background")}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => handleBackgroundSelect(bg)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedBackground === bg.id 
                            ? "border-[#c08e00] ring-2 ring-[#c08e00]/50" 
                            : "border-transparent hover:border-[#c08e00]/50"
                        }`}
                        data-testid={`bg-${bg.id}`}
                      >
                        <img
                          src={bg.src}
                          alt={bg.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {isSaved && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span>{t("verse_share.image_saved")}</span>
                    </div>
                  )}
                  
                  <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-xl">
                    {isGenerating ? (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c08e00] border-t-transparent" />
                      </div>
                    ) : (
                      <img
                        src={generatedImage}
                        alt="Generated verse image"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full max-w-md hover:bg-[#daa520]/20 hover:text-[#daa520] hover:border-[#daa520]"
                    onClick={() => {
                      setGeneratedImage(null);
                      setSelectedBackground(null);
                      setIsSaved(false);
                    }}
                    data-testid="button-change-background"
                  >
                    {t("verse_share.change")}
                  </Button>
                  
                  <Button
                    className="w-full max-w-md bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
                    size="lg"
                    onClick={handleShare}
                    data-testid="button-share-image"
                  >
                    {t("verse_share.share")}
                  </Button>
                </div>
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
