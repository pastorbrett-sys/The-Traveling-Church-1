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
  
  const testMode = typeof window !== "undefined" && 
    new URLSearchParams(window.location.search).get("testOnboarding") === "true";

  const { data: onboardingState, isLoading } = useQuery<OnboardingState>({
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
    if (!onboardingState) return false;
    
    switch (type) {
      case "translation":
        return !onboardingState.hasSeenTranslationTooltip;
      case "verse":
        return !onboardingState.hasSeenVerseTooltip;
      case "actionBar":
        return !onboardingState.hasSeenActionBarTooltip;
      default:
        return false;
    }
  }, [onboardingState, testMode]);

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
        if (!testMode && userId) {
          markSeenMutation.mutate("translation");
        }
        break;
      case "verse":
        setShowVerseTooltip(false);
        if (!testMode && userId) {
          markSeenMutation.mutate("verse");
        }
        break;
      case "actionBar":
        setShowActionBarTooltip(false);
        if (!testMode && userId) {
          markSeenMutation.mutate("actionBar");
        }
        break;
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
