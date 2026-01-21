import { Capacitor } from "@capacitor/core";

export function getBottomNavOffset(): string {
  const isAndroid = Capacitor.getPlatform() === 'android';
  
  if (isAndroid) {
    return 'calc(64px + var(--android-bottom-inset, 34px))';
  }
  return 'calc(64px + env(safe-area-inset-bottom, 0px))';
}

export function getBottomInset(): string {
  const isAndroid = Capacitor.getPlatform() === 'android';
  
  if (isAndroid) {
    return 'var(--android-bottom-inset, 34px)';
  }
  return 'env(safe-area-inset-bottom, 0px)';
}
