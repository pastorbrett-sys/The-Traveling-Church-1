import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { t } from "@/lib/i18n";

export type TooltipType = "translation" | "verse" | "actionBar";

interface OnboardingState {
  hasSeenTranslationTooltip: boolean;
  hasSeenVerseTooltip: boolean;
  hasSeenActionBarTooltip: boolean;
}

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

export function useOnboardingState(userId: string | undefined) {
  const queryClient = useQueryClient();
  
  const [localState, setLocalState] = useState<OnboardingState>(() => getLocalOnboardingState());
  
  const testMode = typeof window !== "undefined" && 
    new URLSearchParams(window.location.search).get("testOnboarding") === "true";

  const { data: serverState, isLoading: serverLoading } = useQuery<OnboardingState>({
    queryKey: ["/api/onboarding/status"],
    enabled: !!userId && !testMode,
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

  const shouldShowTooltip = useCallback((type: TooltipType): boolean => {
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

  const markSeen = useCallback((type: TooltipType) => {
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
  const isReady = testMode || !isLoading;

  return {
    shouldShowTooltip,
    markSeen,
    getTooltipText,
    isLoading,
    isReady,
    testMode,
  };
}
