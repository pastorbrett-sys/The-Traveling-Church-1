import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
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
  statusBarHeight: number;
  toggleSimulation: () => void;
}

const PlatformContext = createContext<PlatformContextType | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  
  useEffect(() => {
    setIsSimulating(isSimulatingNativeApp());
  }, []);

  useEffect(() => {
    async function configureStatusBar() {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        try {
          // Make status bar transparent and overlay content
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setBackgroundColor({ color: '#00000000' }); // Transparent
          await StatusBar.setStyle({ style: 'LIGHT' as any }); // Light icons for dark backgrounds
          
          // Get the status bar height
          const info = await StatusBar.getInfo();
          const height = (info as any).height || 28;
          setStatusBarHeight(height);
          document.documentElement.style.setProperty('--android-status-bar-height', `${height}px`);
          console.log('[Android] Status bar height:', height);
        } catch (e) {
          console.error('[Android] Status bar config error:', e);
          setStatusBarHeight(28);
          document.documentElement.style.setProperty('--android-status-bar-height', '28px');
        }
      }
    }
    configureStatusBar();
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
      statusBarHeight,
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
