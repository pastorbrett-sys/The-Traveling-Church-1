import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import { CapacitorMusicControls } from "capacitor-music-controls-plugin-v3";
import { Haptics, NotificationType } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";

const R2_BUCKET_URL = "https://pub-9a4a185151ef43a7a34948cd665a8e5c.r2.dev";
const ARTWORK_URL = "https://vagabondbible.com/prayer-artwork.png";

export const PRAYER_TRACKS = [
  "Breath Like Quiet Water.mp3",
  "Floating Above The Morning.mp3",
  "Sky Slowly Opens.mp3",
  "Soft Cloud Prayer.mp3",
  "Soft River of Prayer.mp3",
  "Soft Sky Breathing.mp3",
  "Soft Sky, Slow Heart.mp3",
  "Soft Still Waters.mp3",
  "Stillness Between Breaths.mp3",
  "Stillness Between Heartbeats.mp3",
];

const CROSSFADE_DURATION = 3000;
const END_FADE_DURATION = 5000;
const CHIME_URL = "https://cdn.freesound.org/previews/411/411089_5121236-lq.mp3";

let chimeAudioElement: HTMLAudioElement | null = null;
let androidChannelCreated = false;

const setupAndroidChannel = async () => {
  if (androidChannelCreated || Capacitor.getPlatform() !== 'android') return;
  
  try {
    await LocalNotifications.createChannel({
      id: 'timer_complete',
      name: 'Timer Complete',
      description: 'Prayer timer completion alerts',
      sound: 'timer_chime.wav',
      importance: 4,
      vibration: true,
    });
    androidChannelCreated = true;
  } catch (error) {
    console.log("[PrayerAudio] Channel creation error:", error);
  }
};

const preloadChime = () => {
  console.log("[PrayerAudio] Preloading chime...");
  
  if (Capacitor.isNativePlatform()) {
    LocalNotifications.requestPermissions().catch(() => {});
    setupAndroidChannel();
  }
  
  if (!chimeAudioElement) {
    chimeAudioElement = new Audio(CHIME_URL);
    chimeAudioElement.volume = 0.5;
    chimeAudioElement.preload = "auto";
    chimeAudioElement.load();
    console.log("[PrayerAudio] Chime audio element created:", CHIME_URL);
  }
};

const playCompletionChime = async () => {
  console.log("[PrayerAudio] Timer complete! Playing chime. isNative:", Capacitor.isNativePlatform());
  
  if (Capacitor.isNativePlatform()) {
    Haptics.notification({ type: NotificationType.Success }).catch(() => {});
    
    try {
      const permission = await LocalNotifications.checkPermissions();
      
      if (permission.display === 'granted') {
        await setupAndroidChannel();
        await LocalNotifications.schedule({
          notifications: [{
            id: Date.now(),
            title: "Prayer Complete",
            body: "Your prayer time has ended. Peace be with you.",
            sound: 'timer_chime.wav',
            channelId: 'timer_complete',
            schedule: { at: new Date(Date.now() + 100) },
          }]
        });
      } else {
        playWebAudioChime();
      }
    } catch (error) {
      console.log("[PrayerAudio] Notification error:", error);
      playWebAudioChime();
    }
  } else {
    playWebAudioChime();
  }
};

const playWebAudioChime = () => {
  console.log("[PrayerAudio] Playing web audio chime, element exists:", !!chimeAudioElement);
  
  if (chimeAudioElement) {
    chimeAudioElement.currentTime = 0;
    chimeAudioElement.play()
      .then(() => console.log("[PrayerAudio] Chime playing successfully"))
      .catch((error) => {
        console.log("[PrayerAudio] Chime play failed:", error);
        playFallbackChime();
      });
  } else {
    console.log("[PrayerAudio] No chime element, using fallback");
    playFallbackChime();
  }
};

const playFallbackChime = () => {
  console.log("[PrayerAudio] Playing fallback chime (Web Audio API)");
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (frequency: number, startTime: number, duration: number, volume: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    playTone(528, now, 2.5, 0.3);
    playTone(396, now + 0.05, 2.3, 0.2);
    playTone(639, now + 0.1, 2.0, 0.15);
    
    setTimeout(() => audioContext.close(), 3000);
  } catch (error) {
    console.log("[PrayerAudio] Fallback chime error:", error);
  }
};

interface PrayerAudioContextType {
  isPlaying: boolean;
  currentTrack: string | null;
  volume: number;
  isLoading: boolean;
  tracks: string[];
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (vol: number) => void;
  fadeOutAndStop: () => void;
  startWithTimer: (durationSeconds: number) => void;
  resumeWithTimer: (remainingSeconds: number) => void;
  selectTrack: (trackName: string) => void;
  // Timer state - persists across page navigation
  isTimerRunning: boolean;
  timerTimeRemaining: number;
  timerDuration: number;
  timerProgress: number;
  startGlobalTimer: (durationMinutes: number) => void;
  pauseGlobalTimer: () => void;
  resumeGlobalTimer: () => void;
  stopGlobalTimer: () => void;
}

const PrayerAudioContext = createContext<PrayerAudioContextType | null>(null);

export function usePrayerAudioContext(): PrayerAudioContextType {
  const context = useContext(PrayerAudioContext);
  if (!context) {
    throw new Error("usePrayerAudioContext must be used within PrayerAudioProvider");
  }
  return context;
}

export function PrayerAudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  
  // Global timer state - persists across page navigation
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerTimeRemaining, setTimerTimeRemaining] = useState(0);
  const [timerDuration, setTimerDuration] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);
  const timerStartTimeRef = useRef<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const crossfadeTimeoutRef = useRef<number | null>(null);
  const timerEndTimeRef = useRef<number | null>(null);
  const endFadeStartedRef = useRef(false);
  const playlistRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getTrackUrl = (trackName: string): string => {
    return `${R2_BUCKET_URL}/${encodeURIComponent(trackName)}`;
  };

  const getDisplayName = (trackName: string): string => {
    return trackName.replace(".mp3", "");
  };

  const updateNowPlaying = useCallback(async (trackName: string, playing: boolean) => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      if (playing) {
        await CapacitorMusicControls.create({
          track: getDisplayName(trackName),
          artist: "Pastor Brett",
          album: "Vagabond Bible",
          cover: ARTWORK_URL,
          hasPrev: false,
          hasNext: true,
          hasClose: true,
          isPlaying: true,
          playIcon: "media_play",
          pauseIcon: "media_pause",
          prevIcon: "media_prev",
          nextIcon: "media_next",
          closeIcon: "media_close",
          notificationIcon: "notification",
        });
      } else {
        await CapacitorMusicControls.destroy();
      }
    } catch (error) {
      console.log("[PrayerAudio] Music controls error:", error);
    }
  }, []);

  const clearAllTimeouts = useCallback(() => {
    if (fadeIntervalRef.current) {
      cancelAnimationFrame(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    if (crossfadeTimeoutRef.current) {
      clearTimeout(crossfadeTimeoutRef.current);
      crossfadeTimeoutRef.current = null;
    }
  }, []);

  const fadeVolume = useCallback(
    (audio: HTMLAudioElement, from: number, to: number, duration: number, onComplete?: () => void) => {
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress * progress * (3 - 2 * progress);
        const newVolume = from + (to - from) * eased;
        
        audio.volume = Math.max(0, Math.min(1, newVolume * volume));
        
        if (progress < 1) {
          fadeIntervalRef.current = requestAnimationFrame(animate);
        } else {
          onComplete?.();
        }
      };
      
      fadeIntervalRef.current = requestAnimationFrame(animate);
    },
    [volume]
  );

  const preloadNextTrack = useCallback(() => {
    const nextIndex = (currentIndexRef.current + 1) % playlistRef.current.length;
    const nextTrackName = playlistRef.current[nextIndex];
    
    if (nextAudioRef.current) {
      nextAudioRef.current.pause();
      nextAudioRef.current = null;
    }
    
    const nextAudio = new Audio(getTrackUrl(nextTrackName));
    nextAudio.volume = 0;
    nextAudio.preload = "auto";
    nextAudioRef.current = nextAudio;
  }, []);

  const crossfadeToNext = useCallback(() => {
    if (!audioRef.current || !nextAudioRef.current || !isPlaying) return;
    
    const currentAudio = audioRef.current;
    const nextAudio = nextAudioRef.current;
    const nextIndex = (currentIndexRef.current + 1) % playlistRef.current.length;
    const nextTrackName = playlistRef.current[nextIndex];
    
    nextAudio.volume = 0;
    nextAudio.play().catch(console.error);
    
    fadeVolume(currentAudio, 1, 0, CROSSFADE_DURATION, () => {
      currentAudio.pause();
    });
    
    fadeVolume(nextAudio, 0, 1, CROSSFADE_DURATION);
    
    audioRef.current = nextAudio;
    nextAudioRef.current = null;
    currentIndexRef.current = nextIndex;
    setCurrentTrack(getDisplayName(nextTrackName));
    updateNowPlaying(nextTrackName, true);
    
    preloadNextTrack();
    scheduleNextCrossfade();
  }, [isPlaying, fadeVolume, preloadNextTrack, updateNowPlaying]);

  const scheduleNextCrossfade = useCallback(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const checkTime = () => {
      if (!audio || audio.paused) return;
      
      const timeUntilEnd = audio.duration - audio.currentTime;
      const now = Date.now();
      
      if (timerEndTimeRef.current && !endFadeStartedRef.current) {
        const timeUntilTimerEnd = timerEndTimeRef.current - now;
        if (timeUntilTimerEnd <= END_FADE_DURATION) {
          endFadeStartedRef.current = true;
          const safeVolume = volume > 0 ? volume : 1;
          fadeVolume(audio, audio.volume / safeVolume, 0, timeUntilTimerEnd, () => {
            audio.pause();
            setIsPlaying(false);
            setCurrentTrack(null);
            updateNowPlaying("", false);
          });
          return;
        }
      }
      
      if (timeUntilEnd <= CROSSFADE_DURATION / 1000 + 0.5) {
        crossfadeToNext();
      } else {
        crossfadeTimeoutRef.current = window.setTimeout(checkTime, 500);
      }
    };
    
    crossfadeTimeoutRef.current = window.setTimeout(checkTime, 1000);
  }, [crossfadeToNext, fadeVolume, volume, updateNowPlaying]);

  const play = useCallback(() => {
    console.log("[PrayerAudioContext] play() called");
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
      console.log("[PrayerAudioContext] setIsPlaying(true)");
      scheduleNextCrossfade();
    } else {
      playlistRef.current = shuffleArray(PRAYER_TRACKS);
      currentIndexRef.current = 0;
      const firstTrack = playlistRef.current[0];
      
      setIsLoading(true);
      const audio = new Audio(getTrackUrl(firstTrack));
      audio.volume = volume;
      
      audio.addEventListener("canplaythrough", () => {
        setIsLoading(false);
        audio.play().catch(console.error);
        setIsPlaying(true);
        setCurrentTrack(getDisplayName(firstTrack));
        updateNowPlaying(firstTrack, true);
        preloadNextTrack();
        scheduleNextCrossfade();
      }, { once: true });
      
      audio.addEventListener("error", () => {
        setIsLoading(false);
        console.error("Error loading audio");
      }, { once: true });
      
      audioRef.current = audio;
    }
  }, [volume, preloadNextTrack, scheduleNextCrossfade]);

  const pause = useCallback(() => {
    clearAllTimeouts();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    updateNowPlaying("", false);
  }, [clearAllTimeouts, updateNowPlaying]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const setVolume = useCallback((vol: number) => {
    const clampedVol = Math.max(0, Math.min(1, vol));
    setVolumeState(clampedVol);
    if (audioRef.current) {
      audioRef.current.volume = clampedVol;
    }
    if (nextAudioRef.current) {
      nextAudioRef.current.volume = clampedVol;
    }
  }, []);

  const fadeOutAndStop = useCallback(() => {
    clearAllTimeouts();
    if (audioRef.current && isPlaying) {
      const safeVolume = volume > 0 ? volume : 1;
      fadeVolume(audioRef.current, audioRef.current.volume / safeVolume, 0, END_FADE_DURATION, () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (nextAudioRef.current) {
          nextAudioRef.current.pause();
          nextAudioRef.current = null;
        }
        setIsPlaying(false);
        setCurrentTrack(null);
        updateNowPlaying("", false);
      });
    }
  }, [clearAllTimeouts, fadeVolume, isPlaying, volume, updateNowPlaying]);

  const startWithTimer = useCallback((durationSeconds: number) => {
    timerEndTimeRef.current = Date.now() + durationSeconds * 1000;
    endFadeStartedRef.current = false;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (nextAudioRef.current) {
      nextAudioRef.current.pause();
      nextAudioRef.current = null;
    }
    clearAllTimeouts();
    
    play();
  }, [clearAllTimeouts, play]);

  const resumeWithTimer = useCallback((remainingSeconds: number) => {
    timerEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    endFadeStartedRef.current = false;
    
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
      scheduleNextCrossfade();
    } else {
      play();
    }
  }, [volume, play, scheduleNextCrossfade]);

  const selectTrack = useCallback((trackName: string) => {
    let trackIndex = PRAYER_TRACKS.indexOf(trackName);
    if (trackIndex === -1) {
      const fullName = trackName + ".mp3";
      trackIndex = PRAYER_TRACKS.indexOf(fullName);
    }
    if (trackIndex === -1) {
      const foundTrack = PRAYER_TRACKS.find(t => t.replace(".mp3", "") === trackName);
      if (foundTrack) {
        trackIndex = PRAYER_TRACKS.indexOf(foundTrack);
      }
    }
    if (trackIndex === -1) return;
    
    clearAllTimeouts();
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (nextAudioRef.current) {
      nextAudioRef.current.pause();
      nextAudioRef.current = null;
    }
    
    playlistRef.current = [...PRAYER_TRACKS];
    currentIndexRef.current = trackIndex;
    
    setIsLoading(true);
    const audio = new Audio(getTrackUrl(trackName));
    audio.volume = volume;
    
    audio.addEventListener("canplaythrough", () => {
      setIsLoading(false);
      audio.play().catch(console.error);
      setIsPlaying(true);
      setCurrentTrack(getDisplayName(trackName));
      updateNowPlaying(trackName, true);
      preloadNextTrack();
      scheduleNextCrossfade();
    }, { once: true });
    
    audio.addEventListener("error", () => {
      setIsLoading(false);
      console.error("Error loading audio");
    }, { once: true });
    
    audioRef.current = audio;
  }, [clearAllTimeouts, volume, preloadNextTrack, scheduleNextCrossfade, updateNowPlaying]);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (nextAudioRef.current) {
        nextAudioRef.current.pause();
        nextAudioRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [clearAllTimeouts]);

  // Global timer functions
  const startGlobalTimer = useCallback((durationMinutes: number) => {
    preloadChime();
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    const totalSeconds = durationMinutes * 60;
    setTimerDuration(totalSeconds);
    setTimerTimeRemaining(totalSeconds);
    setIsTimerRunning(true);
    timerStartTimeRef.current = Date.now();
    
    timerIntervalRef.current = window.setInterval(() => {
      setTimerTimeRemaining(prev => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          setIsTimerRunning(false);
          playCompletionChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const pauseGlobalTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerRunning(false);
  }, []);

  const resumeGlobalTimer = useCallback(() => {
    if (timerTimeRemaining <= 0) return;
    
    preloadChime();
    setIsTimerRunning(true);
    timerIntervalRef.current = window.setInterval(() => {
      setTimerTimeRemaining(prev => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          setIsTimerRunning(false);
          playCompletionChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timerTimeRemaining]);

  const stopGlobalTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerRunning(false);
    setTimerTimeRemaining(0);
    setTimerDuration(0);
  }, []);

  const timerProgress = timerDuration > 0 ? (timerDuration - timerTimeRemaining) / timerDuration : 0;

  const value: PrayerAudioContextType = {
    isPlaying,
    currentTrack,
    volume,
    isLoading,
    tracks: PRAYER_TRACKS.map(getDisplayName),
    play,
    pause,
    toggle,
    setVolume,
    fadeOutAndStop,
    startWithTimer,
    resumeWithTimer,
    selectTrack,
    // Timer state
    isTimerRunning,
    timerTimeRemaining,
    timerDuration,
    timerProgress,
    startGlobalTimer,
    pauseGlobalTimer,
    resumeGlobalTimer,
    stopGlobalTimer,
  };

  return (
    <PrayerAudioContext.Provider value={value}>
      {children}
    </PrayerAudioContext.Provider>
  );
}
