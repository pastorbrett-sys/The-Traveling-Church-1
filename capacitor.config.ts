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
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#B78D00',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_INSIDE',
      splashFullScreen: true,
      splashImmersive: true,
      iosSpinnerStyle: 'small',
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
    backgroundColor: '#000000',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
