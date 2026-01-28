import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { t } from "@/lib/i18n";

type TooltipType = "translation" | "verse" | "actionBar";

interface OnboardingState {
  hasSeenTranslationTooltip: boolean;
  hasSeenVerseTooltip: boolean;
  hasSeenActionBarTooltip: boolean;
}

interface OnboardingContextType {
  showTranslationTooltip: boolean;
  showVerseTooltip: boolean;
  showActionBarTooltip: boolean;
  translationRef: React.RefObject<HTMLElement> | null;
  verseRef: React.RefObject<HTMLElement> | null;
  actionBarRef: React.RefObject<HTMLElement> | null;
  registerTranslationRef: (ref: React.RefObject<HTMLElement>) => void;
  registerVerseRef: (ref: React.RefObject<HTMLElement>) => void;
  registerActionBarRef: (ref: React.RefObject<HTMLElement>) => void;
  triggerTranslationTooltip: () => void;
  triggerVerseTooltip: () => void;
  triggerActionBarTooltip: () => void;
  dismissTooltip: (type: TooltipType) => void;
  getTooltipText: (type: TooltipType) => string;
  isLoading: boolean;
  testMode: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const STORAGE_KEY = "vagabond_onboarding_state";

function getLocalOnboardingState(): OnboardingState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return {
    hasSeenTranslationTooltip: false,
    hasSeenVerseTooltip: false,
    hasSeenActionBarTooltip: false,
  };
}

function setLocalOnboardingState(state: OnboardingState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function markLocalTooltipSeen(type: TooltipType) {
  const state = getLocalOnboardingState();
  switch (type) {
    case "translation":
      state.hasSeenTranslationTooltip = true;
      break;
    case "verse":
      state.hasSeenVerseTooltip = true;
      break;
    case "actionBar":
      state.hasSeenActionBarTooltip = true;
      break;
  }
  setLocalOnboardingState(state);
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}

interface OnboardingProviderProps {
  children: ReactNode;
  userId?: string;
}

export function OnboardingProvider({ children, userId }: OnboardingProviderProps) {
  const queryClient = useQueryClient();
  
  const [translationRef, setTranslationRef] = useState<React.RefObject<HTMLElement> | null>(null);
  const [verseRef, setVerseRef] = useState<React.RefObject<HTMLElement> | null>(null);
  const [actionBarRef, setActionBarRef] = useState<React.RefObject<HTMLElement> | null>(null);
  
  const [showTranslationTooltip, setShowTranslationTooltip] = useState(false);
  const [showVerseTooltip, setShowVerseTooltip] = useState(false);
  const [showActionBarTooltip, setShowActionBarTooltip] = useState(false);
  
  const [localState, setLocalState] = useState<OnboardingState>(() => getLocalOnboardingState());
  
  const testMode = typeof window !== "undefined" && 
    new URLSearchParams(window.location.search).get("testOnboarding") === "true";

  const { data: serverState, isLoading: serverLoading } = useQuery<OnboardingState>({
    queryKey: ["/api/onboarding/status"],
    enabled: !!userId,
    staleTime: Infinity,
  });

  const markSeenMutation = useMutation({
    mutationFn: async (tooltip: TooltipType) => {
      return apiRequest("POST", "/api/onboarding/mark-seen", { tooltip });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/status"] });
    },
  });

  const registerTranslationRef = useCallback((ref: React.RefObject<HTMLElement>) => {
    setTranslationRef(ref);
  }, []);

  const registerVerseRef = useCallback((ref: React.RefObject<HTMLElement>) => {
    setVerseRef(ref);
  }, []);

  const registerActionBarRef = useCallback((ref: React.RefObject<HTMLElement>) => {
    setActionBarRef(ref);
  }, []);

  const shouldShow = useCallback((type: TooltipType): boolean => {
    if (testMode) return true;
    
    const hasSeenLocally = (() => {
      switch (type) {
        case "translation":
          return localState.hasSeenTranslationTooltip;
        case "verse":
          return localState.hasSeenVerseTooltip;
        case "actionBar":
          return localState.hasSeenActionBarTooltip;
        default:
          return true;
      }
    })();
    
    if (hasSeenLocally) return false;
    
    if (userId && serverState) {
      switch (type) {
        case "translation":
          return !serverState.hasSeenTranslationTooltip;
        case "verse":
          return !serverState.hasSeenVerseTooltip;
        case "actionBar":
          return !serverState.hasSeenActionBarTooltip;
        default:
          return false;
      }
    }
    
    return true;
  }, [localState, serverState, userId, testMode]);

  const triggerTranslationTooltip = useCallback(() => {
    if (shouldShow("translation") && translationRef?.current) {
      setShowTranslationTooltip(true);
    }
  }, [shouldShow, translationRef]);

  const triggerVerseTooltip = useCallback(() => {
    if (shouldShow("verse") && verseRef?.current) {
      setShowVerseTooltip(true);
    }
  }, [shouldShow, verseRef]);

  const triggerActionBarTooltip = useCallback(() => {
    if (shouldShow("actionBar") && actionBarRef?.current) {
      setShowActionBarTooltip(true);
    }
  }, [shouldShow, actionBarRef]);

  const dismissTooltip = useCallback((type: TooltipType) => {
    switch (type) {
      case "translation":
        setShowTranslationTooltip(false);
        break;
      case "verse":
        setShowVerseTooltip(false);
        break;
      case "actionBar":
        setShowActionBarTooltip(false);
        break;
    }
    
    if (!testMode) {
      markLocalTooltipSeen(type);
      setLocalState(getLocalOnboardingState());
      
      if (userId) {
        markSeenMutation.mutate(type);
      }
    }
  }, [testMode, userId, markSeenMutation]);

  const getTooltipText = useCallback((type: TooltipType): string => {
    switch (type) {
      case "translation":
        return t("onboarding.translation_tooltip");
      case "verse":
        return t("onboarding.verse_tooltip");
      case "actionBar":
        return t("onboarding.action_bar_tooltip");
      default:
        return "";
    }
  }, []);

  const isLoading = userId ? serverLoading : false;

  return (
    <OnboardingContext.Provider
      value={{
        showTranslationTooltip,
        showVerseTooltip,
        showActionBarTooltip,
        translationRef,
        verseRef,
        actionBarRef,
        registerTranslationRef,
        registerVerseRef,
        registerActionBarRef,
        triggerTranslationTooltip,
        triggerVerseTooltip,
        triggerActionBarTooltip,
        dismissTooltip,
        getTooltipText,
        isLoading,
        testMode,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export default OnboardingProvider;
