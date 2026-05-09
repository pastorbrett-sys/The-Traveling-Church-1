import { useContext } from "react";
import { PrayerAudioContext, type PrayerAudioContextType } from "./prayer-audio-context";

export function usePrayerAudioContext(): PrayerAudioContextType {
  const context = useContext(PrayerAudioContext);
  if (!context) {
    throw new Error("usePrayerAudioContext must be used within PrayerAudioProvider");
  }
  return context;
}
