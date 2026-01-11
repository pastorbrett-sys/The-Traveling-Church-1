import { useState, useEffect, useRef } from "react";
import { usePlatform } from "@/contexts/platform-context";
import { isNativePlatform } from "@/lib/host-detection";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import splashVideo from "@/assets/splash-intro.mp4";

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const { isNative } = usePlatform();
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  console.log("[IntroAnimation] Mounted, isNative:", isNative, "video src:", splashVideo);

  const handleVideoEnd = () => {
    console.log("[IntroAnimation] Video ended");
    setFadeOut(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;
    console.error("[IntroAnimation] Video error:", error?.message, error?.code);
    // Still complete on error to not block the app
    setTimeout(() => onComplete(), 500);
  };

  // Hide native splash screen and start video playback
  useEffect(() => {
    const initVideo = async () => {
      // Hide the native splash screen immediately - video is ready to take over
      if (Capacitor.isNativePlatform()) {
        try {
          console.log("[IntroAnimation] Hiding native splash screen");
          await SplashScreen.hide({ fadeOutDuration: 200 });
        } catch (err) {
          console.log("[IntroAnimation] Splash hide error (non-critical):", err);
        }
      }
      
      // Manually trigger play for iOS (which can block autoplay)
      const video = videoRef.current;
      if (video) {
        console.log("[IntroAnimation] Attempting manual video.play()");
        video.play().then(() => {
          console.log("[IntroAnimation] Manual play succeeded");
        }).catch((err) => {
          console.error("[IntroAnimation] Manual play failed:", err);
        });
      }
    };
    
    initVideo();
  }, []);

  // Fallback in case video doesn't trigger onEnded
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!fadeOut) {
        console.log("[IntroAnimation] Fallback timer triggered");
        handleVideoEnd();
      }
    }, 2500); // Video is 1.5s, give extra buffer

    return () => clearTimeout(fallbackTimer);
  }, [fadeOut]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#B78D00] transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="video-intro-animation"
      >
        <source src={splashVideo} type="video/mp4" />
      </video>
    </div>
  );
}

// Hook to manage intro state - shows on native first visit
export function useIntroAnimation() {
  const { isNative } = usePlatform();
  
  // Initialize showIntro synchronously based on native platform check
  // This ensures the intro renders on the FIRST paint, not after a useEffect
  const [showIntro, setShowIntro] = useState(() => {
    const nativeNow = isNativePlatform();
    console.log("[useIntroAnimation] Initial state, isNativePlatform:", nativeNow);
    // Always show on native for testing
    // TODO: Add localStorage check for "first visit only" after video is verified working
    return nativeNow;
  });

  const completeIntro = () => {
    console.log("[useIntroAnimation] completeIntro called");
    setShowIntro(false);
  };

  return {
    showIntro,
    isChecking: false, // No longer needed since we check synchronously
    completeIntro,
  };
}
