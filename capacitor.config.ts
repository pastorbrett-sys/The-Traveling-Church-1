/// <reference types="@capacitor-firebase/authentication" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vagabondbible.app',
  appName: 'Vagabond Faith',
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
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#B78D00',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_INSIDE',
      splashFullScreen: true,
      splashImmersive: true,
      iosSpinnerStyle: 'small',
    },
    // Using @capacitor-community/safe-area for system bar styling
    // Disable Capacitor's built-in insets handling to prevent conflicts
    SystemBars: {
      insetsHandling: 'disable',
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com", "apple.com"],
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_notification",
      iconColor: "#B78D00",
      sound: "timer_chime.wav",
    },
  },
  ios: {
    contentInset: 'never',
    scheme: 'com.vagabondbible.app',
    backgroundColor: '#B78D00',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
