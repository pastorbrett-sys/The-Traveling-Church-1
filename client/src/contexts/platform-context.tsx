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
  
  // Note: Android CSS variables are set in main.tsx BEFORE React renders
  // to ensure they're available from the absolute first frame
  
  useEffect(() => {
    setIsSimulating(isSimulatingNativeApp());
  }, []);

  useEffect(() => {
    async function configureStatusBar() {
      const currentPlatform = Capacitor.getPlatform();
      const isNativePlatformCheck = Capacitor.isNativePlatform();
      console.log('[Platform] isNative:', isNativePlatformCheck, 'platform:', currentPlatform);
      
      if (isNativePlatformCheck && currentPlatform === 'android') {
        // Get actual height from StatusBar plugin (may update the default set in main.tsx)
        try {
          const info = await StatusBar.getInfo();
          const actualHeight = (info as any).height || 44;
          document.documentElement.style.setProperty('--android-status-bar-height', `${actualHeight}px`);
          setStatusBarHeight(actualHeight);
          console.log('[Android] Updated status bar height from device:', actualHeight);
        } catch (e) {
          // Default was already set in main.tsx
          setStatusBarHeight(44);
          console.log('[Android] Keeping default status bar height: 44px');
        }
        
        try {
          // Make status bar transparent and overlay content
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setBackgroundColor({ color: '#00000000' }); // Transparent
          await StatusBar.setStyle({ style: 'LIGHT' as any }); // Light icons for dark backgrounds
          console.log('[Android] Status bar configured: transparent, overlay mode');
        } catch (e) {
          console.error('[Android] Status bar config error:', e);
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
