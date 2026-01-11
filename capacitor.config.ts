/// <reference types="@capacitor-firebase/authentication" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vagabondbible.app',
  appName: 'Vagabond Bible',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 0, // Don't auto-hide, we'll hide manually when ready
      launchAutoHide: false, // Manual control for faster transition
      backgroundColor: '#B78C00',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a2e',
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
  },
  ios: {
    contentInset: 'never',
    scheme: 'com.vagabondbible.app',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
