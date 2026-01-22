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

export function useOnboardingState(userId: string | undefined) {
  const queryClient = useQueryClient();
  
  const testMode = typeof window !== "undefined" && 
    new URLSearchParams(window.location.search).get("testOnboarding") === "true";

  const { data: onboardingState, isLoading } = useQuery<OnboardingState>({
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
    if (!userId) return false;
    if (testMode) return true;
    if (isLoading || !onboardingState) return false;
    
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
  }, [userId, testMode, isLoading, onboardingState]);

  const markSeen = useCallback((type: TooltipType) => {
    if (!testMode && userId) {
      markSeenMutation.mutate(type);
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

  return {
    shouldShowTooltip,
    markSeen,
    getTooltipText,
    isLoading,
    testMode,
  };
}
