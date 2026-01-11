import { useState, useEffect, useRef } from "react";
import { usePlatform } from "@/contexts/platform-context";
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

  // Manually trigger play for iOS (which can block autoplay)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      console.log("[IntroAnimation] Attempting manual video.play()");
      video.play().then(() => {
        console.log("[IntroAnimation] Manual play succeeded");
      }).catch((err) => {
        console.error("[IntroAnimation] Manual play failed:", err);
      });
    }
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
      style={{
        paddingTop: isNative ? "env(safe-area-inset-top, 0px)" : undefined,
        paddingBottom: isNative ? "env(safe-area-inset-bottom, 0px)" : undefined,
      }}
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
        style={{ objectFit: 'cover' }}
        data-testid="video-intro-animation"
      >
        <source src={splashVideo} type="video/mp4" />
      </video>
    </div>
  );
}

// Hook to manage intro state - always shows on native for now
export function useIntroAnimation() {
  const { isNative } = usePlatform();
  const [showIntro, setShowIntro] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  console.log("[useIntroAnimation] isNative:", isNative, "showIntro:", showIntro, "isChecking:", isChecking);

  useEffect(() => {
    console.log("[useIntroAnimation] useEffect running, isNative:", isNative);
    // Always show intro on native platform (for testing)
    // TODO: Add localStorage check for "first visit only" after video is verified working
    if (isNative) {
      console.log("[useIntroAnimation] Setting showIntro to true");
      setShowIntro(true);
    }
    setIsChecking(false);
  }, [isNative]);

  const completeIntro = () => {
    console.log("[useIntroAnimation] completeIntro called");
    setShowIntro(false);
  };

  return {
    showIntro,
    isChecking,
    completeIntro,
  };
}
