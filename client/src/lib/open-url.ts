import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const PRODUCTION_URL = 'https://vagabondbible.com';

export async function openExternalUrl(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    // For relative URLs, prepend production URL on native
    const fullUrl = url.startsWith('/') ? `${PRODUCTION_URL}${url}` : url;
    await Browser.open({ url: fullUrl });
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
