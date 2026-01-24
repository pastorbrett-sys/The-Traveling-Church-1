import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import maryImage from "@assets/Mary_1769243057081.png";
import soundIcon from "@assets/Sound_Icon_1769243057081.png";

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
  const [isPushing, setIsPushing] = useState(false);
  const [pushProgress, setPushProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const introAnimationRef = useRef<number | null>(null);

  const totalSeconds = selectedDuration * 60;
  const progress = isRunning ? (totalSeconds - timeRemaining) / totalSeconds : 0;

  // Intro swoop animation - fluid wooshy effect with collapsing tail
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
      
      // Start the timer when tail is about to collapse (at 95%)
      // This creates the "bounce" effect where the tail pushes the timer forward
      if (tailPos >= 0.95 && headPos >= 0.99) {
        // Immediately start the countdown - the tail "bounces" into it
        setIsIntroAnimating(false);
        setSwoopHead(0);
        setSwoopTail(0);
        setIsRunning(true);
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
  }, [isIntroAnimating]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const handleDurationSelect = (minutes: number) => {
    setSelectedDuration(minutes);
    setTimeRemaining(minutes * 60);
    setSwoopHead(0);
    setSwoopTail(0);
    setIsPushing(false);
    setPushProgress(0);
    setIsIntroAnimating(true);
    setIsRunning(false);
  };

  const handleStartStop = () => {
    if (isRunning || isIntroAnimating) {
      setIsRunning(false);
      setIsIntroAnimating(false);
      setIsPushing(false);
      setSwoopHead(0);
      setSwoopTail(0);
      setPushProgress(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (introAnimationRef.current) {
        cancelAnimationFrame(introAnimationRef.current);
      }
    } else {
      setTimeRemaining(selectedDuration * 60);
      setSwoopHead(0);
      setSwoopTail(0);
      setIsPushing(false);
      setPushProgress(0);
      setIsIntroAnimating(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const circumference = 2 * Math.PI * 130;
  const strokeDashoffset = circumference - progress * circumference;

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
            {isIntroAnimating ? (
              <>
                {/* Swoop arc - drawn from tail to head position */}
                {(() => {
                  // Arc goes from tail position to head position
                  const arcLength = Math.max(0, (swoopHead - swoopTail)) * circumference;
                  // Offset positions the START of the visible arc at the tail position
                  // Negative offset moves the arc forward (clockwise)
                  const dashOffset = -swoopTail * circumference;
                  
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
                        filter: "drop-shadow(0 0 12px rgba(255, 150, 0, 0.8))",
                      }}
                    />
                  );
                })()}
                {/* Glow at the head of the swoosh */}
                {swoopHead > 0.05 && (
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
                      opacity: 0.6,
                      filter: "blur(6px)",
                    }}
                  />
                )}
              </>
            ) : isPushing ? (
              <circle
                cx="150"
                cy="150"
                r="130"
                fill="none"
                stroke="url(#orangeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (pushProgress * circumference)}
                style={{ 
                  filter: "drop-shadow(0 0 8px rgba(255, 150, 0, 0.6))",
                }}
              />
            ) : (
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
                style={{ transition: "stroke-dashoffset 1s linear" }}
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
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #b98500 0%, #ff6a00 100%)",
            }}
            data-testid="button-sound"
          >
            <img
              src={soundIcon}
              alt="Sound"
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
