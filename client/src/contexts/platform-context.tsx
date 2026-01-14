import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  getPlatform, 
  isNativePlatform, 
  isSimulatingNativeApp,
  setSimulateNativeApp,
  type Platform 
} from '@/lib/host-detection';

interface PlatformContextType {
  platform: Platform;
  isNative: boolean;
  isSimulating: boolean;
  isLoading: boolean;
  toggleSimulation: () => void;
}

const PlatformContext = createContext<PlatformContextType | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsSimulating(isSimulatingNativeApp());
    setIsLoading(false);
  }, []);
  
  const platform = getPlatform();
  const isNative = isNativePlatform() || isSimulating;
  
  const toggleSimulation = () => {
    setSimulateNativeApp(!isSimulating);
  };
  
  return (
    <PlatformContext.Provider value={{ 
      platform: isSimulating ? 'ios' : platform,
      isNative, 
      isSimulating,
      isLoading,
      toggleSimulation 
    }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
}
