import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'ios' | 'android';

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export function getPlatform(): Platform {
  if (Capacitor.isNativePlatform()) {
    return Capacitor.getPlatform() as 'ios' | 'android';
  }
  return 'web';
}

export function isVagabondBibleDomain(): boolean {
  if (isNativePlatform()) {
    return true;
  }
  
  if (typeof window !== 'undefined' && window.localStorage) {
    const simulateNative = window.localStorage.getItem('simulate-native-app');
    if (simulateNative === 'true') {
      return true;
    }
  }
  
  const hostname = window.location.hostname.toLowerCase();
  return hostname === 'vagabondbible.com' || 
         hostname === 'www.vagabondbible.com' ||
         hostname.endsWith('.vagabondbible.com');
}

export function isTravelingChurchDomain(): boolean {
  return !isVagabondBibleDomain();
}

export function getCurrentBrand(): 'vagabond' | 'church' {
  return isVagabondBibleDomain() ? 'vagabond' : 'church';
}

export function setSimulateNativeApp(enabled: boolean): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (enabled) {
      window.localStorage.setItem('simulate-native-app', 'true');
    } else {
      window.localStorage.removeItem('simulate-native-app');
    }
    window.location.reload();
  }
}

export function isSimulatingNativeApp(): boolean {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('simulate-native-app') === 'true';
  }
  return false;
}
