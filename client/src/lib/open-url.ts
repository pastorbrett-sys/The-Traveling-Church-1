import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export async function openExternalUrl(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url });
  } else {
    window.location.href = url;
  }
}

export async function openInAppBrowser(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ 
      url,
      presentationStyle: 'fullscreen',
    });
  } else {
    window.location.href = url;
  }
}
