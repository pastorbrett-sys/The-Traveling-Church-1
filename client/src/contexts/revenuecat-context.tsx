import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';

interface RevenueCatContextType {
  isInitialized: boolean;
  isProUser: boolean;
  isLoading: boolean;
  error: string | null;
  purchaseProduct: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshEntitlements: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType | null>(null);

const REVENUECAT_SDK_KEY = import.meta.env.VITE_REVENUECAT_SDK_KEY || '';

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [Purchases, setPurchases] = useState<any>(null);

  const isTrueNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const initializeRevenueCat = async () => {
      if (!isTrueNative) {
        setIsLoading(false);
        return;
      }

      try {
        const { Purchases: PurchasesModule, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');
        setPurchases(PurchasesModule);

        await PurchasesModule.setLogLevel({ level: LOG_LEVEL.DEBUG });
        
        await PurchasesModule.configure({
          apiKey: REVENUECAT_SDK_KEY,
        });

        setIsInitialized(true);

        const customerInfo = await PurchasesModule.getCustomerInfo();
        const hasProEntitlement = customerInfo.customerInfo.entitlements.active['Vagabond Bible Pro'] !== undefined;
        setIsProUser(hasProEntitlement);

      } catch (err: any) {
        console.error('RevenueCat initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize RevenueCat');
      } finally {
        setIsLoading(false);
      }
    };

    initializeRevenueCat();
  }, [isTrueNative]);

  const refreshEntitlements = useCallback(async () => {
    if (!Purchases || !isInitialized) return;

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const hasProEntitlement = customerInfo.customerInfo.entitlements.active['Vagabond Bible Pro'] !== undefined;
      setIsProUser(hasProEntitlement);
    } catch (err) {
      console.error('Failed to refresh entitlements:', err);
    }
  }, [Purchases, isInitialized]);

  const purchaseProduct = useCallback(async (productId: string): Promise<boolean> => {
    if (!Purchases || !isInitialized) {
      console.error('RevenueCat not initialized');
      return false;
    }

    try {
      setIsLoading(true);
      
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current) {
        throw new Error('No offerings available');
      }

      const packageToPurchase = offerings.current.availablePackages.find(
        (pkg: any) => pkg.product.identifier === productId
      ) || offerings.current.availablePackages[0];

      if (!packageToPurchase) {
        throw new Error('No package found to purchase');
      }

      const purchaseResult = await Purchases.purchasePackage({ aPackage: packageToPurchase });
      
      const hasProEntitlement = purchaseResult.customerInfo.entitlements.active['Vagabond Bible Pro'] !== undefined;
      setIsProUser(hasProEntitlement);

      return hasProEntitlement;
    } catch (err: any) {
      if (err.userCancelled) {
        console.log('User cancelled purchase');
        return false;
      }
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Purchase failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [Purchases, isInitialized]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!Purchases || !isInitialized) {
      console.error('RevenueCat not initialized');
      return false;
    }

    try {
      setIsLoading(true);
      
      const customerInfo = await Purchases.restorePurchases();
      const hasProEntitlement = customerInfo.customerInfo.entitlements.active['Vagabond Bible Pro'] !== undefined;
      setIsProUser(hasProEntitlement);

      return hasProEntitlement;
    } catch (err) {
      console.error('Restore purchases error:', err);
      setError(err instanceof Error ? err.message : 'Restore failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [Purchases, isInitialized]);

  return (
    <RevenueCatContext.Provider value={{
      isInitialized,
      isProUser,
      isLoading,
      error,
      purchaseProduct,
      restorePurchases,
      refreshEntitlements,
    }}>
      {children}
    </RevenueCatContext.Provider>
  );
}

export function useRevenueCat() {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
}
