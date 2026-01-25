import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Volume2, VolumeX, Music, Loader2 } from "lucide-react";
import maryImage from "@assets/Mary_1769243057081.png";
import { usePrayerAudio } from "@/hooks/usePrayerAudio";

const DURATION_OPTIONS = [
  { label: "5 MIN", minutes: 5 },
  { label: "10 MIN", minutes: 10 },
  { label: "30 MIN", minutes: 30 },
];

export default function PrayerTimer() {
  const [, setLocation] = useLocation();
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isIntroAnimating, setIsIntroAnimating] = useState(true);
  const [swoopHead, setSwoopHead] = useState(0);
  const [swoopTail, setSwoopTail] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const introAnimationRef = useRef<number | null>(null);
  const timerStartRef = useRef<number | null>(null);
  const countdownAnimationRef = useRef<number | null>(null);

  const {
    isPlaying: audioPlaying,
    currentTrack,
    isLoading: audioLoading,
    toggle: toggleAudio,
    fadeOutAndStop,
    startWithTimer,
  } = usePrayerAudio();

  const totalSeconds = selectedDuration * 60;

  // Intro swoop animation - fluid wooshy effect with collapsing tail
  // Uses animationKey to force restart when duration changes
  useEffect(() => {
    if (!isIntroAnimating) return;
    
    const startTime = performance.now();
    const swoopDuration = 1000; // Head takes 1s to complete the full circle
    const tailStartDelay = 200; // Tail starts after head has a lead
    const tailDuration = 1100; // Tail catches up quickly
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      
      // Easing functions
      const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
      const easeInCubic = (t: number) => t * t * t;
      
      // Head position - swoops around the full circle with wooshy easing
      const headRaw = Math.min(elapsed / swoopDuration, 1);
      const headPos = easeOutQuart(headRaw);
      
      // Tail position - starts slow, then accelerates to catch up
      const tailElapsed = Math.max(0, elapsed - tailStartDelay);
      const tailRaw = Math.min(tailElapsed / tailDuration, 1);
      // Tail accelerates aggressively - easeInCubic for faster catch-up
      const tailPos = easeInCubic(tailRaw);
      
      setSwoopHead(headPos);
      setSwoopTail(tailPos);
      
      // When tail catches up to about 90%, immediately end swoosh and start timer
      // No delay - instant transition
      if (tailPos >= 0.92) {
        // Set timer start time BEFORE state changes so countdown starts immediately
        timerStartRef.current = performance.now();
        // Give a small initial progress so the arc is immediately visible
        setSmoothProgress(0.001);
        // Instantly switch from swoosh to timer - no gap
        setIsIntroAnimating(false);
        setSwoopHead(0);
        setSwoopTail(0);
        setIsRunning(true);
        // Start audio when timer begins (if enabled)
        if (audioEnabled) {
          startWithTimer(selectedDuration * 60);
        }
        return;
      }
      
      introAnimationRef.current = requestAnimationFrame(animate);
    };
    
    introAnimationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (introAnimationRef.current) {
        cancelAnimationFrame(introAnimationRef.current);
      }
    };
  }, [isIntroAnimating, animationKey, audioEnabled, startWithTimer, selectedDuration]);

  // Smooth progress animation using requestAnimationFrame
  useEffect(() => {
    if (!isRunning) {
      if (countdownAnimationRef.current) {
        cancelAnimationFrame(countdownAnimationRef.current);
        countdownAnimationRef.current = null;
      }
      return;
    }
    
    // Use existing start time or create new one
    const startTime = timerStartRef.current || performance.now();
    if (!timerStartRef.current) {
      timerStartRef.current = startTime;
    }
    
    const totalMs = totalSeconds * 1000;
    
    const animateProgress = (currentTime: number) => {
      if (!isRunning) return;
      
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / totalMs, 1); // Normalized time 0-1
      
      // Smooth continuous easing with visible burst to ~1 o'clock position
      // Uses a custom curve: fast initial burst that smoothly blends to linear
      // The burst peaks early then gradually settles into natural pace
      const burstPeak = 0.085; // ~1 o'clock position (1/12 of circle)
      const burstContribution = burstPeak * Math.pow(1 - t, 3); // Cubic decay for smooth settle
      const newProgress = Math.min(t + burstContribution, 1);
      
      setSmoothProgress(newProgress);
      
      // Update timeRemaining for display (every second)
      const newTimeRemaining = Math.max(0, totalSeconds - Math.floor(elapsed / 1000));
      setTimeRemaining(prev => prev !== newTimeRemaining ? newTimeRemaining : prev);
      
      if (newProgress < 1) {
        countdownAnimationRef.current = requestAnimationFrame(animateProgress);
      } else {
        setIsRunning(false);
        setTimeRemaining(0);
      }
    };
    
    // Start immediately
    countdownAnimationRef.current = requestAnimationFrame(animateProgress);
    
    return () => {
      if (countdownAnimationRef.current) {
        cancelAnimationFrame(countdownAnimationRef.current);
      }
    };
  }, [isRunning, totalSeconds]);

  const handleDurationSelect = (minutes: number) => {
    // Cancel any running animations first
    if (countdownAnimationRef.current) {
      cancelAnimationFrame(countdownAnimationRef.current);
      countdownAnimationRef.current = null;
    }
    if (introAnimationRef.current) {
      cancelAnimationFrame(introAnimationRef.current);
      introAnimationRef.current = null;
    }
    
    // Fully stop and reset audio when switching durations
    fadeOutAndStop();
    
    // Reset all state
    setIsRunning(false);
    setSelectedDuration(minutes);
    setTimeRemaining(minutes * 60);
    setSwoopHead(0);
    setSwoopTail(0);
    setSmoothProgress(0);
    timerStartRef.current = null;
    
    // Increment key to force effect re-run even if isIntroAnimating is already true
    setAnimationKey(prev => prev + 1);
    setIsIntroAnimating(true);
  };

  const handleStartStop = () => {
    if (isRunning || isIntroAnimating) {
      // Cancel animations
      if (countdownAnimationRef.current) {
        cancelAnimationFrame(countdownAnimationRef.current);
        countdownAnimationRef.current = null;
      }
      if (introAnimationRef.current) {
        cancelAnimationFrame(introAnimationRef.current);
        introAnimationRef.current = null;
      }
      
      // Fade out and stop audio
      fadeOutAndStop();
      
      setIsRunning(false);
      setIsIntroAnimating(false);
      setSwoopHead(0);
      setSwoopTail(0);
      setSmoothProgress(0);
      timerStartRef.current = null;
    } else {
      setTimeRemaining(selectedDuration * 60);
      setSwoopHead(0);
      setSwoopTail(0);
      setSmoothProgress(0);
      timerStartRef.current = null;
      setIsIntroAnimating(true);
    }
  };

  const handleAudioToggle = () => {
    if (isRunning) {
      toggleAudio();
    } else {
      setAudioEnabled(!audioEnabled);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const circumference = 2 * Math.PI * 130;
  const strokeDashoffset = circumference - smoothProgress * circumference;

  return (
    <div 
      className="w-full flex flex-col overflow-hidden"
      style={{ 
        background: "#000000",
        minHeight: "100vh",
        paddingTop: "env(safe-area-inset-top, 44px)",
        paddingBottom: "100px",
      }}
      data-testid="prayer-timer-screen"
    >
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
      `}</style>

      {/* Header bar */}
      <div className="w-full h-1 bg-[#333]" />
      
      <button
        onClick={() => setLocation("/")}
        className="flex items-center gap-1 px-4 py-3 self-start"
        data-testid="button-back"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
        <span 
          className="text-white text-sm font-semibold tracking-wide"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          BACK
        </span>
      </button>

      {/* Content area - centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        {/* Title */}
        <h1 
          className="text-white text-center tracking-wide mb-6"
          style={{ fontFamily: "'Abhaya Libre', serif", fontSize: "26px" }}
        >
          PRAYER TIMER
        </h1>

        {/* Timer Circle */}
        <div className="relative w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] flex items-center justify-center">
          {(isRunning || isIntroAnimating) && (
            <>
              <div 
                className="absolute rounded-full"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  animation: "pulse-ring 4s ease-out infinite",
                }}
              />
              <div 
                className="absolute rounded-full"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  animation: "pulse-ring 4s ease-out infinite 2s",
                }}
              />
            </>
          )}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(185,133,0,0.1) 0%, transparent 70%)",
            }}
          />

          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 300 300"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="150"
              cy="150"
              r="130"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="4"
            />
            {/* SWOOSH SVG - only during intro animation */}
            {isIntroAnimating && (
              <>
                {/* Swoop arc - drawn from tail to head position with building glow */}
                {(() => {
                  const arcLength = Math.max(0, (swoopHead - swoopTail)) * circumference;
                  const dashOffset = -swoopTail * circumference;
                  // Drop shadow builds intensity as tail catches up (charging effect)
                  const shadowOpacity = 0.3 + 0.6 * Math.pow(swoopTail, 0.5);
                  const shadowSize = 8 + 8 * swoopTail;
                  
                  return (
                    <circle
                      cx="150"
                      cy="150"
                      r="130"
                      fill="none"
                      stroke="url(#swoopGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${arcLength} ${circumference}`}
                      strokeDashoffset={dashOffset}
                      style={{ 
                        filter: `drop-shadow(0 0 ${shadowSize}px rgba(255, 150, 0, ${shadowOpacity}))`,
                      }}
                    />
                  );
                })()}
                {/* Glow at the head of the swoosh - builds intensity as swoosh progresses */}
                {swoopHead > 0.05 && (() => {
                  // Glow builds from 0.2 to 0.8 as tail catches up (charging effect)
                  const glowIntensity = 0.2 + 0.6 * Math.pow(swoopTail, 0.5);
                  return (
                    <circle
                      cx="150"
                      cy="150"
                      r="130"
                      fill="none"
                      stroke="url(#glowGradient)"
                      strokeWidth="24"
                      strokeLinecap="round"
                      strokeDasharray={`${circumference * 0.08} ${circumference}`}
                      strokeDashoffset={-swoopHead * circumference + circumference * 0.04}
                      style={{ 
                        opacity: glowIntensity,
                        filter: `blur(${4 + 4 * swoopTail}px)`,
                      }}
                    />
                  );
                })()}
              </>
            )}
            {/* COUNTDOWN TIMER SVG - appears instantly when swoosh ends */}
            {!isIntroAnimating && (
              <circle
                cx="150"
                cy="150"
                r="130"
                fill="none"
                stroke="url(#orangeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: isRunning ? "stroke-dashoffset 1s linear" : "none" }}
              />
            )}
            <defs>
              <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFBE00" />
                <stop offset="100%" stopColor="#FF6A00" />
              </linearGradient>
              <linearGradient id="swoopGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6A00" />
                <stop offset="50%" stopColor="#FFBE00" />
                <stop offset="100%" stopColor="#FFF5D4" />
              </linearGradient>
              <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6A00" stopOpacity="0" />
                <stop offset="100%" stopColor="#FFBE00" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>

          <div 
            className="absolute inset-[42px] rounded-full border-2"
            style={{ borderColor: "#2a2a2a" }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={maryImage}
              alt="Mary"
              className="w-[148px] h-[223px] sm:w-[222px] sm:h-[335px] object-contain"
            />
          </div>

          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ fontFamily: "'SCHABO Condensed', 'Impact', sans-serif" }}
          >
            <span 
              className="text-white text-5xl sm:text-8xl tracking-wider"
              style={{ 
                fontWeight: 400,
                letterSpacing: "2px",
              }}
              data-testid="text-timer"
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-3 px-4 mt-6">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.minutes}
              onClick={() => handleDurationSelect(option.minutes)}
              className="h-9 px-5 rounded-full text-sm tracking-wide transition-all"
              style={{
                fontFamily: "'Poppins', sans-serif",
                ...(selectedDuration === option.minutes
                  ? {
                      background: "linear-gradient(180deg, #b98500 0%, #ff6a00 100%)",
                      color: "white",
                    }
                  : {
                      background: "transparent",
                      border: "2px solid #161616",
                      color: "#747373",
                    }),
              }}
              data-testid={`button-duration-${option.minutes}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-5">
          <button
            onClick={handleStartStop}
            className="h-[52px] px-12 rounded-full text-white text-sm font-semibold tracking-wide"
            style={{
              fontFamily: "'Poppins', sans-serif",
              background: "linear-gradient(180deg, #FFBE00 0%, #FF6A00 100%)",
            }}
            data-testid="button-start-stop"
          >
            {(isRunning || isIntroAnimating) ? "STOP" : "START"}
          </button>

          <button
            onClick={handleAudioToggle}
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center relative"
            style={{
              background: (isRunning ? audioPlaying : audioEnabled) 
                ? "linear-gradient(180deg, #b98500 0%, #ff6a00 100%)"
                : "linear-gradient(180deg, #333 0%, #222 100%)",
            }}
            data-testid="button-sound"
          >
            {audioLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (isRunning ? audioPlaying : audioEnabled) ? (
              <Volume2 className="w-5 h-5 text-white" />
            ) : (
              <VolumeX className="w-5 h-5 text-white/60" />
            )}
          </button>
        </div>

        {/* Now Playing indicator */}
        {currentTrack && audioPlaying && (
          <div 
            className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)" }}
            data-testid="container-now-playing"
          >
            <Music className="w-4 h-4 text-[#FFBE00]" />
            <span 
              className="text-white/70 text-xs truncate max-w-[200px]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
              data-testid="text-now-playing"
            >
              {currentTrack}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
