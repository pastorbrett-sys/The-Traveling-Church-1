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
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = selectedDuration * 60;
  const progress = isRunning ? (totalSeconds - timeRemaining) / totalSeconds : 0;

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
    setIsRunning(true);
  };

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      setTimeRemaining(selectedDuration * 60);
      setIsRunning(true);
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
      className="h-screen w-full flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(180deg, #191919 0%, #000000 100%)" }}
      data-testid="prayer-timer-screen"
    >
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
      `}</style>

      {/* Top 30% - Header and Title */}
      <div 
        className="flex flex-col items-center"
        style={{ 
          height: "30%",
          paddingTop: "env(safe-area-inset-top, 44px)",
        }}
      >
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

        <div className="flex-1 flex items-end justify-center pb-4">
          <h1 
            className="text-white text-center tracking-wide"
            style={{ fontFamily: "'Abhaya Libre', serif", fontSize: "26px" }}
          >
            PRAYER TIMER
          </h1>
        </div>
      </div>

      {/* Middle 40% - Timer Circle */}
      <div 
        className="flex items-start justify-center px-5 pt-4"
        style={{ height: "40%" }}
      >
        <div className="relative w-[350px] h-[350px] flex items-center justify-center">
          {isRunning && (
            <>
              <div 
                className="absolute rounded-full"
                style={{
                  width: "324px",
                  height: "324px",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  animation: "pulse-ring 4s ease-out infinite",
                }}
              />
              <div 
                className="absolute rounded-full"
                style={{
                  width: "324px",
                  height: "324px",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
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
            <defs>
              <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFBE00" />
                <stop offset="100%" stopColor="#FF6A00" />
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
              className="w-[185px] h-[279px] object-contain"
            />
          </div>

          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ fontFamily: "'SCHABO Condensed', 'Impact', sans-serif" }}
          >
            <span 
              className="text-white text-7xl tracking-wider"
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
      </div>

      {/* Bottom 30% - Buttons */}
      <div 
        className="flex flex-col items-center justify-start px-5 pt-4"
        style={{ 
          height: "30%",
          paddingBottom: "env(safe-area-inset-bottom, 34px)",
        }}
      >
        <div className="flex flex-wrap justify-center gap-3 px-4">
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
            {isRunning ? "STOP" : "START"}
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
