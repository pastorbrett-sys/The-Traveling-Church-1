import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRevenueCat } from "@/contexts/revenuecat-context";
import { usePlatform } from "@/contexts/platform-context";

interface SubscriptionStatus {
  isProUser: boolean;
}

interface UsageSummary {
  isPro: boolean;
}

export function useProStatus() {
  const { user, isAuthenticated } = useAuth();
  const { isProUser: revenueCatIsPro, isInitialized: revenueCatInitialized } = useRevenueCat();
  const { isNative } = usePlatform();

  const { data: subscriptionStatus } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/stripe/my-subscription"],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const { data: usageSummary } = useQuery<UsageSummary>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const serverIsPro = subscriptionStatus?.isProUser || usageSummary?.isPro || false;
  
  const isPro = isNative && revenueCatInitialized 
    ? (revenueCatIsPro || serverIsPro)
    : serverIsPro;

  return {
    isPro,
    isLoading: !revenueCatInitialized && isNative,
    serverIsPro,
    revenueCatIsPro: isNative ? revenueCatIsPro : false,
  };
}
