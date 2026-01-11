import { useState, useEffect, useRef } from "react";
import { usePlatform } from "@/contexts/platform-context";
import splashVideo from "@/assets/splash-intro.mp4";
import splashLadder from "@/assets/splash-ladder.png";

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const { isNative } = usePlatform();
  const [showLadder, setShowLadder] = useState(true);
  const [fadeOutLadder, setFadeOutLadder] = useState(false);
  const [fadeOutVideo, setFadeOutVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Start fading out the ladder after a brief moment
    const ladderFadeTimer = setTimeout(() => {
      setFadeOutLadder(true);
    }, 300);

    // Hide ladder completely after fade
    const ladderHideTimer = setTimeout(() => {
      setShowLadder(false);
    }, 600);

    return () => {
      clearTimeout(ladderFadeTimer);
      clearTimeout(ladderHideTimer);
    };
  }, []);

  const handleVideoEnd = () => {
    // Fade out the entire intro
    setFadeOutVideo(true);
    // Complete after fade animation
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  // Calculate ladder size to match iOS LaunchScreen (44% of screen width)
  const ladderSize = Math.min(window.innerWidth * 0.44, window.innerHeight * 0.35);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#B78D00] transition-opacity duration-300 ${
        fadeOutVideo ? "opacity-0" : "opacity-100"
      }`}
      style={{
        paddingTop: isNative ? "env(safe-area-inset-top, 0px)" : undefined,
        paddingBottom: isNative ? "env(safe-area-inset-bottom, 0px)" : undefined,
      }}
    >
      {/* Video background */}
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

      {/* Ladder overlay - matches iOS LaunchScreen positioning */}
      {showLadder && (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
            fadeOutLadder ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
            src={splashLadder}
            alt=""
            style={{
              width: `${ladderSize}px`,
              height: "auto",
            }}
            className="object-contain"
            data-testid="img-intro-ladder"
          />
        </div>
      )}
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
