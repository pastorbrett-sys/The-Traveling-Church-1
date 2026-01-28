import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, X, Loader2, Play, Pause, ChevronDown, Heart } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import maryImage from "@assets/Mary_1769243057081.png";
import { usePrayerAudioContext } from "@/contexts/prayer-audio-context";

function SoundWaveIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[2px] w-5 h-5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-[3px] rounded-full"
          style={{
            background: isActive ? "white" : "rgba(255,255,255,0.6)",
            height: isActive ? "100%" : "8px",
            animation: isActive ? `soundWave 0.8s ease-in-out infinite ${i * 0.15}s` : "none",
          }}
        />
      ))}
    </div>
  );
}

const BUTTON_POSITIONS = {
  durationRow: { marginTop: 24 },
  controlRow: { marginTop: 20 },
  nowPlaying: { marginTop: 21 },
};

const DURATION_OPTIONS = [
  { label: "5 MIN", minutes: 5 },
  { label: "10 MIN", minutes: 10 },
  { label: "30 MIN", minutes: 30 },
];

const INSPIRATIONAL_PHRASES = [
  "PRAYER TIMER",
  "BREATHE SPIRIT",
  "EXHALE STRESS",
  "I'M BLESSED",
  "IT'S MY TIME",
  "HE'S WITH ME",
  "I AM ENOUGH",
];

export default function PrayerTimer() {
  const [, setLocation] = useLocation();
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isIntroAnimating, setIsIntroAnimating] = useState(false);
  const [swoopHead, setSwoopHead] = useState(0);
  const [swoopTail, setSwoopTail] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [isClosingTrackSelector, setIsClosingTrackSelector] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [phraseVisible, setPhraseVisible] = useState(true);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introAnimationRef = useRef<number | null>(null);
  const timerStartRef = useRef<number | null>(null);
  const countdownAnimationRef = useRef<number | null>(null);
  const pausedTimeRemainingRef = useRef<number | null>(null);
  // Mutable ref to track current animation session - callbacks check this to abort
  const animationSessionRef = useRef<object | null>(null);
  // Track if component has been initialized (survives StrictMode remount)
  const hasInitializedRef = useRef(false);
  // Ref to hold startGlobalTimer for use in animation callbacks
  const startGlobalTimerRef = useRef<((durationMinutes: number) => void) | null>(null);

  const {
    isPlaying: audioPlaying,
    currentTrack,
    isLoading: audioLoading,
    tracks,
    pause: pauseAudio,
    startWithTimer,
    resumeWithTimer,
    selectTrack,
    // Global timer state
    isTimerRunning: globalTimerRunning,
    timerTimeRemaining: globalTimeRemaining,
    timerDuration: globalTimerDuration,
    timerProgress: globalTimerProgress,
    startGlobalTimer,
    pauseGlobalTimer,
    resumeGlobalTimer,
    stopGlobalTimer,
  } = usePrayerAudioContext();

  const totalSeconds = selectedDuration * 60;
  
  // Keep refs updated with latest functions
  startGlobalTimerRef.current = startGlobalTimer;

  // Page load entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Cycle through inspirational phrases when timer is running
  useEffect(() => {
    if (!isRunning && !isIntroAnimating) {
      setCurrentPhraseIndex(0);
      setPhraseVisible(true);
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      return;
    }
    
    const cycleDuration = 6000; // 6 seconds per phrase
    const fadeDuration = 1000; // 1 second fade
    
    const interval = setInterval(() => {
      // Start fade out
      setPhraseVisible(false);
      
      // Clear any existing fade timeout
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      
      // After fade out, change phrase and fade in
      fadeTimeoutRef.current = setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % INSPIRATIONAL_PHRASES.length);
        setPhraseVisible(true);
        fadeTimeoutRef.current = null;
      }, fadeDuration);
    }, cycleDuration);
    
    return () => {
      clearInterval(interval);
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    };
  }, [isRunning, isIntroAnimating]);

  // Use a ref to hold the current selectedDuration for animations
  const selectedDurationRef = useRef(selectedDuration);
  selectedDurationRef.current = selectedDuration;

  // Function to start intro animation - called directly, not through state
  const startIntroAnimation = useCallback(() => {
    // Cancel any existing animations
    if (introAnimationRef.current) {
      cancelAnimationFrame(introAnimationRef.current);
      introAnimationRef.current = null;
    }
    if (countdownAnimationRef.current) {
      cancelAnimationFrame(countdownAnimationRef.current);
      countdownAnimationRef.current = null;
    }
    
    // Create new session - old callbacks will see their session is stale
    const session = {};
    animationSessionRef.current = session;
    
    // Reset state
    setSwoopHead(0);
    setSwoopTail(0);
    setSmoothProgress(0);
    setIsRunning(false);
    setIsIntroAnimating(true);
    timerStartRef.current = null;
    
    const startTime = performance.now();
    const swoopDuration = 1000;
    const tailStartDelay = 200;
    const tailDuration = 1100;
    
    const animate = (currentTime: number) => {
      // Abort if session changed (user switched duration or stopped)
      if (animationSessionRef.current !== session) {
        return;
      }
      
      const elapsed = currentTime - startTime;
      
      const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
      const easeInCubic = (t: number) => t * t * t;
      
      const headRaw = Math.min(elapsed / swoopDuration, 1);
      const headPos = easeOutQuart(headRaw);
      
      const tailElapsed = Math.max(0, elapsed - tailStartDelay);
      const tailRaw = Math.min(tailElapsed / tailDuration, 1);
      const tailPos = easeInCubic(tailRaw);
      
      setSwoopHead(headPos);
      setSwoopTail(tailPos);
      
      if (tailPos >= 0.92) {
        // Transition to countdown - inline the countdown start here
        // Read duration from ref to get current value
        const duration = selectedDurationRef.current;
        
        timerStartRef.current = performance.now();
        setSmoothProgress(0.001);
        setIsIntroAnimating(false);
        setSwoopHead(0);
        setSwoopTail(0);
        setIsRunning(true);
        
        // Start the global timer so it persists when navigating away
        if (startGlobalTimerRef.current) {
          startGlobalTimerRef.current(duration);
        }
        
        const countdownStartTime = timerStartRef.current;
        const totalMs = duration * 60 * 1000;
        
        const animateCountdown = (countdownTime: number) => {
          if (animationSessionRef.current !== session) {
            return;
          }
          
          const countdownElapsed = countdownTime - countdownStartTime;
          const t = Math.min(countdownElapsed / totalMs, 1);
          
          // Burst effect: eases IN at start, peaks, then decays
          // This prevents the jarring jump at t=0
          const burstPeak = 0.085;
          const burstRampUp = Math.min(t * 40, 1); // Ramps from 0 to 1 over first 2.5% of timer
          const burstDecay = Math.pow(1 - t, 3); // Decays over full duration
          const burstContribution = burstPeak * burstRampUp * burstDecay;
          const newProgress = Math.min(t + burstContribution, 1);
          
          setSmoothProgress(newProgress);
          
          const newTimeRemaining = Math.max(0, duration * 60 - Math.floor(countdownElapsed / 1000));
          setTimeRemaining(prev => prev !== newTimeRemaining ? newTimeRemaining : prev);
          
          if (newProgress < 1) {
            countdownAnimationRef.current = requestAnimationFrame(animateCountdown);
          } else {
            setIsRunning(false);
            setTimeRemaining(0);
            animationSessionRef.current = null;
          }
        };
        
        countdownAnimationRef.current = requestAnimationFrame(animateCountdown);
        return;
      }
      
      introAnimationRef.current = requestAnimationFrame(animate);
    };
    
    introAnimationRef.current = requestAnimationFrame(animate);
  }, []);

  // On mount, check if there's an active global timer to resume
  useEffect(() => {
    if (globalTimerRunning && globalTimeRemaining > 0) {
      // Resume from global timer state
      const durationMinutes = Math.round(globalTimerDuration / 60);
      const totalDurationSeconds = globalTimerDuration;
      
      setSelectedDuration(durationMinutes);
      selectedDurationRef.current = durationMinutes;
      setTimeRemaining(globalTimeRemaining);
      setIsRunning(true);
      setIsIntroAnimating(false);
      
      // Calculate initial progress
      const initialProgress = (totalDurationSeconds - globalTimeRemaining) / totalDurationSeconds;
      setSmoothProgress(initialProgress);
      
      // Start local animation loop for smooth progress updates
      const session = {};
      animationSessionRef.current = session;
      
      // Calculate when the timer started based on current state
      const elapsedSeconds = totalDurationSeconds - globalTimeRemaining;
      timerStartRef.current = performance.now() - elapsedSeconds * 1000;
      
      const animateCountdown = (countdownTime: number) => {
        if (animationSessionRef.current !== session) return;
        
        const countdownStartTime = timerStartRef.current!;
        const totalMs = totalDurationSeconds * 1000;
        const countdownElapsed = countdownTime - countdownStartTime;
        const t = Math.min(countdownElapsed / totalMs, 1);
        
        const burstPeak = 0.085;
        const burstRampUp = Math.min(t * 40, 1);
        const burstDecay = Math.pow(1 - t, 3);
        const burstContribution = burstPeak * burstRampUp * burstDecay;
        const newProgress = Math.min(t + burstContribution, 1);
        
        setSmoothProgress(newProgress);
        
        // Calculate time remaining from elapsed time (not from stale closure)
        const newTimeRemaining = Math.max(0, totalDurationSeconds - Math.floor(countdownElapsed / 1000));
        setTimeRemaining(prev => prev !== newTimeRemaining ? newTimeRemaining : prev);
        
        if (newProgress < 1) {
          countdownAnimationRef.current = requestAnimationFrame(animateCountdown);
        } else {
          setIsRunning(false);
          setTimeRemaining(0);
          animationSessionRef.current = null;
        }
      };
      
      countdownAnimationRef.current = requestAnimationFrame(animateCountdown);
    } else {
      // No active global timer, start fresh intro animation
      startIntroAnimation();
    }
    // Cleanup will happen via the session invalidation
  }, []);

  // Cleanup on unmount - but don't stop the global timer!
  useEffect(() => {
    return () => {
      if (introAnimationRef.current) cancelAnimationFrame(introAnimationRef.current);
      if (countdownAnimationRef.current) cancelAnimationFrame(countdownAnimationRef.current);
      animationSessionRef.current = null;
      // Note: We intentionally DO NOT stop the global timer here - it should continue running
    };
  }, []);


  const handleDurationSelect = async (minutes: number) => {
    // Haptic feedback
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
    
    // Pause audio and stop global timer when switching durations
    pauseAudio();
    setAudioEnabled(false); // Reset audio state to prevent double-tap issue
    stopGlobalTimer();
    pausedTimeRemainingRef.current = null;
    
    // Update duration - MUST update ref BEFORE calling startIntroAnimation
    // because React state update is async but the animation reads the ref immediately
    selectedDurationRef.current = minutes;
    setSelectedDuration(minutes);
    setTimeRemaining(minutes * 60);
    
    // Start fresh intro animation - this handles all cancellation and state reset
    startIntroAnimation();
  };

  // Function to resume countdown from paused position
  const resumeCountdown = useCallback(() => {
    if (pausedTimeRemainingRef.current === null) return;
    
    const session = {};
    animationSessionRef.current = session;
    
    const remainingSeconds = pausedTimeRemainingRef.current;
    const elapsedSeconds = selectedDuration * 60 - remainingSeconds;
    timerStartRef.current = performance.now() - elapsedSeconds * 1000;
    
    setIsRunning(true);
    
    const startTime = timerStartRef.current;
    const totalMs = selectedDuration * 60 * 1000;
    
    const animateProgress = (currentTime: number) => {
      if (animationSessionRef.current !== session) return;
      
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / totalMs, 1);
      
      // Burst effect: eases IN at start, peaks, then decays
      const burstPeak = 0.085;
      const burstRampUp = Math.min(t * 40, 1);
      const burstDecay = Math.pow(1 - t, 3);
      const burstContribution = burstPeak * burstRampUp * burstDecay;
      const newProgress = Math.min(t + burstContribution, 1);
      
      setSmoothProgress(newProgress);
      
      const newTimeRemaining = Math.max(0, selectedDuration * 60 - Math.floor(elapsed / 1000));
      setTimeRemaining(prev => prev !== newTimeRemaining ? newTimeRemaining : prev);
      
      if (newProgress < 1) {
        countdownAnimationRef.current = requestAnimationFrame(animateProgress);
      } else {
        setIsRunning(false);
        setTimeRemaining(0);
        animationSessionRef.current = null;
      }
    };
    
    countdownAnimationRef.current = requestAnimationFrame(animateProgress);
    pausedTimeRemainingRef.current = null;
  }, [selectedDuration]);

  const handleStartStop = async () => {
    // Haptic feedback
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}
    
    if (isRunning || isIntroAnimating) {
      // Stop/Pause - invalidate current session
      animationSessionRef.current = null;
      
      if (countdownAnimationRef.current) {
        cancelAnimationFrame(countdownAnimationRef.current);
        countdownAnimationRef.current = null;
      }
      if (introAnimationRef.current) {
        cancelAnimationFrame(introAnimationRef.current);
        introAnimationRef.current = null;
      }
      
      pauseAudio();
      setAudioEnabled(false); // Reset audio state to prevent double-tap issue
      pauseGlobalTimer(); // Pause the global timer
      pausedTimeRemainingRef.current = timeRemaining;
      
      setIsRunning(false);
      setIsIntroAnimating(false);
    } else {
      // Start - check if resuming or fresh start
      if (pausedTimeRemainingRef.current !== null && smoothProgress > 0) {
        // Resume from paused position
        resumeCountdown();
        resumeGlobalTimer(); // Resume the global timer
        if (audioEnabled) {
          resumeWithTimer(pausedTimeRemainingRef.current || timeRemaining);
        }
      } else {
        // Fresh start
        startIntroAnimation();
      }
    }
  };

  const closeTrackSelector = () => {
    setIsClosingTrackSelector(true);
    setTimeout(() => {
      setShowTrackSelector(false);
      setIsClosingTrackSelector(false);
    }, 200);
  };

  const handleTrackSelect = (trackName: string) => {
    if (!audioEnabled) {
      setAudioEnabled(true);
    }
    selectTrack(trackName + ".mp3");
    closeTrackSelector();
  };

  const handleAudioToggle = async () => {
    // Prevent toggle while audio is loading to avoid state issues
    if (audioLoading) return;
    
    // Haptic feedback
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
    
    // Use audioPlaying from context as source of truth, not local audioEnabled state
    // This prevents double-tap issues from state desync
    if (audioPlaying) {
      pauseAudio();
      setAudioEnabled(false);
    } else {
      setAudioEnabled(true);
      // Start audio regardless of timer state - use current timer or a long duration if not running
      const duration = isRunning ? timeRemaining : 60 * 60; // 1 hour if timer not running
      resumeWithTimer(duration);
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
        @keyframes soundWave {
          0%, 100% {
            height: 4px;
          }
          50% {
            height: 14px;
          }
        }
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes heartEntrance {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
          75% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes heartJumpSpin {
          0%, 80% {
            transform: scale(1) rotateY(0deg) translateY(0);
          }
          87% {
            transform: scale(1.3) rotateY(180deg) translateY(-5px);
          }
          94% {
            transform: scale(1.1) rotateY(360deg) translateY(-2px);
          }
          100% {
            transform: scale(1) rotateY(360deg) translateY(0);
          }
        }
        .animate-heart-pulse {
          animation: heartEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, heartJumpSpin 7s ease-in-out 0.6s infinite;
          transform-style: preserve-3d;
        }
      `}</style>

      {/* Header bar */}
      <div className="w-full h-1 bg-[#333]" />
      
      {/* Navigation row */}
      <div className="w-full flex items-center justify-between" style={{ marginTop: "7px" }}>
        <button
          onClick={() => setLocation("/bible-buddy")}
          className="flex items-center gap-1 px-4 py-3"
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
        
        <button
          onClick={() => setLocation("/prayer-requests")}
          className="flex items-center gap-2 px-4 py-3"
          data-testid="button-prayer-requests"
        >
          <span 
            className="text-sm font-semibold tracking-wide"
            style={{ fontFamily: "'Poppins', sans-serif", color: "#666" }}
          >
            PRAYERS
          </span>
          <Heart 
            className="w-5 h-5 animate-heart-pulse" 
            style={{ color: "#FD0250" }} 
          />
        </button>
      </div>

      {/* Content area - centered vertically */}
      <div 
        className="flex-1 flex flex-col items-center justify-center px-5"
      >
        {/* Title - shows inspirational phrases when timer is running */}
        <h1 
          className="text-white text-center tracking-wide mb-6"
          style={{ 
            fontFamily: "'Abhaya Libre', serif", 
            fontSize: "26px",
            opacity: (isRunning || isIntroAnimating) ? (phraseVisible ? 1 : 0) : 1,
            transition: "opacity 1s ease-in-out",
            minHeight: "36px",
          }}
        >
          {(isRunning || isIntroAnimating) ? INSPIRATIONAL_PHRASES[currentPhraseIndex] : "PRAYER TIMER"}
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
                {/* Swoop arc - drawn from tail to head position */}
                {(() => {
                  const arcLength = Math.max(0, (swoopHead - swoopTail)) * circumference;
                  const dashOffset = -swoopTail * circumference;
                  
                  return (
                    <circle
                      cx="150"
                      cy="150"
                      r="130"
                      fill="none"
                      stroke="#c08e00"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${arcLength} ${circumference}`}
                      strokeDashoffset={dashOffset}
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
                stroke="#c08e00"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
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
        <div 
          className="flex flex-wrap justify-center gap-3 px-4"
          style={{
            marginTop: `${BUTTON_POSITIONS.durationRow.marginTop}px`,
            opacity: pageLoaded ? 1 : 0,
            transform: pageLoaded ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
          }}
        >
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.minutes}
              onClick={() => handleDurationSelect(option.minutes)}
              className="h-11 min-w-[80px] px-5 rounded-full text-sm tracking-wide transition-all"
              style={{
                fontFamily: "'Poppins', sans-serif",
                ...(selectedDuration === option.minutes
                  ? {
                      backgroundColor: "#c08e00",
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

        <div 
          className="flex items-center gap-4"
          style={{
            marginTop: `${BUTTON_POSITIONS.controlRow.marginTop}px`,
            opacity: pageLoaded ? 1 : 0,
            transform: pageLoaded ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s",
          }}
        >
          <button
            onClick={handleStartStop}
            className="h-[52px] px-12 rounded-full text-white text-sm font-semibold tracking-wide"
            style={{
              fontFamily: "'Poppins', sans-serif",
              backgroundColor: "#c08e00",
            }}
            data-testid="button-start-stop"
          >
            {(isRunning || isIntroAnimating) ? "STOP" : "START"}
          </button>

          <button
            onClick={handleAudioToggle}
            disabled={audioLoading}
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center relative"
            style={{
              backgroundColor: "#c08e00",
              opacity: audioLoading ? 0.7 : 1,
            }}
            data-testid="button-sound"
          >
            {audioLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : audioPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Now Playing / Pick Music indicator */}
        <button 
          onClick={() => setShowTrackSelector(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ 
            background: "rgba(255,255,255,0.1)", 
            marginTop: `${BUTTON_POSITIONS.nowPlaying.marginTop}px`,
          }}
          data-testid="container-now-playing"
        >
          {audioPlaying && (
            <SoundWaveIcon isActive={true} />
          )}
          <span 
            className="text-white/70 text-xs truncate max-w-[200px]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
            data-testid="text-now-playing"
          >
            {audioPlaying && currentTrack ? currentTrack : "Tap to pick music"}
          </span>
          <ChevronDown className="w-4 h-4 text-white/50" style={{ marginTop: "1px" }} />
        </button>
      </div>

      {/* Track Selector Sheet */}
      {showTrackSelector && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ 
            background: "rgba(0,0,0,0.7)",
            animation: isClosingTrackSelector ? "fadeOut 0.2s ease-out forwards" : "fadeIn 0.2s ease-out",
          }}
          onClick={closeTrackSelector}
          data-testid="track-selector-overlay"
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes fadeOut {
              from { opacity: 1; }
              to { opacity: 0; }
            }
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            @keyframes slideDown {
              from { transform: translateY(0); }
              to { transform: translateY(100%); }
            }
          `}</style>
          <div 
            className="w-full max-w-md rounded-t-3xl pb-8"
            style={{ 
              background: "#1a1a1a",
              paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 20px)",
              animation: isClosingTrackSelector ? "slideDown 0.2s ease-out forwards" : "slideUp 0.25s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 
                className="text-white text-lg font-semibold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Select Track
              </h3>
              <button 
                onClick={closeTrackSelector}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
                data-testid="button-close-tracks"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {tracks.map((track) => (
                <button
                  key={track}
                  onClick={() => handleTrackSelect(track)}
                  className="w-full px-5 py-4 flex items-center gap-3 text-left transition-colors"
                  style={{ 
                    background: currentTrack === track ? "rgba(255,190,0,0.15)" : "transparent",
                  }}
                  data-testid={`track-${track.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {currentTrack === track && audioPlaying ? (
                    <SoundWaveIcon isActive={true} />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/30" />
                  )}
                  <span 
                    className="text-white text-sm"
                    style={{ 
                      fontFamily: "'Poppins', sans-serif",
                      color: currentTrack === track ? "#FFBE00" : "white",
                    }}
                  >
                    {track}
                  </span>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
