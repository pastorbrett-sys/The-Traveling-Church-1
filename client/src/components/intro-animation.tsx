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

  const handleVideoEnd = () => {
    setFadeOut(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  // Fallback in case video doesn't trigger onEnded
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!fadeOut) {
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
        onEnded={handleVideoEnd}
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="video-intro-animation"
      >
        <source src={splashVideo} type="video/mp4" />
      </video>
    </div>
  );
}

// Hook to manage intro state with localStorage persistence
export function useIntroAnimation() {
  const { isNative } = usePlatform();
  const [showIntro, setShowIntro] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only show intro on native platform for first-time visitors
    if (isNative) {
      const hasSeenIntro = localStorage.getItem("vagabond-intro-seen");
      if (!hasSeenIntro) {
        setShowIntro(true);
      }
    }
    setIsChecking(false);
  }, [isNative]);

  const completeIntro = () => {
    localStorage.setItem("vagabond-intro-seen", "true");
    setShowIntro(false);
  };

  // For testing: reset intro
  const resetIntro = () => {
    localStorage.removeItem("vagabond-intro-seen");
    setShowIntro(true);
  };

  return {
    showIntro,
    isChecking,
    completeIntro,
    resetIntro,
  };
}
