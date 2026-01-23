import { useEffect, useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { useLocation } from 'wouter';

// Production server URL for native apps
const PRODUCTION_URL = 'https://vagabondbible.com';

function getApiUrl(path: string): string {
  const isNative = Capacitor.isNativePlatform();
  return isNative ? `${PRODUCTION_URL}${path}` : path;
}

interface PushNotificationState {
  token: string | null;
  isRegistered: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
}

interface DeepLinkData {
  type: string;
  bookId?: string;
  chapter?: string;
  verse?: string;
  verseRef?: string;
  showActionMenu?: string;
  triggerHighlight?: string;
}

export function usePushNotifications(userId: string | null | undefined) {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<PushNotificationState>({
    token: null,
    isRegistered: false,
    permissionStatus: 'unknown',
  });

  // Get device timezone info
  const getTimezoneInfo = useCallback(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date();
      const utcOffset = -Math.round(now.getTimezoneOffset() / 60);
      return { timezone, utcOffset };
    } catch {
      return { timezone: 'UTC', utcOffset: 0 };
    }
  }, []);

  // Register token with backend
  const registerTokenWithBackend = useCallback(async (token: string) => {
    if (!userId) return;

    const platform = Capacitor.getPlatform();
    const { timezone, utcOffset } = getTimezoneInfo();

    try {
      const response = await fetch(getApiUrl('/api/notifications/register-token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          deviceToken: token,
          platform,
          timezone,
          utcOffset,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register token');
      }

      console.log('Push token registered successfully');
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  }, [userId, getTimezoneInfo]);

  // Handle deep link navigation
  const handleDeepLink = useCallback((data: DeepLinkData) => {
    if (data.type === 'verse_of_week' || data.type === 'verse') {
      const bookId = data.bookId;
      const chapter = data.chapter;
      const verse = data.verse;

      if (bookId && chapter) {
        // Navigate to the Bible reader with the specific verse
        const params = new URLSearchParams();
        if (verse) params.set('verse', verse);
        if (data.showActionMenu === 'true') params.set('showAction', 'true');
        if (data.triggerHighlight === 'true') params.set('highlight', 'true');

        const queryString = params.toString();
        const path = `/bible/${bookId}/${chapter}${queryString ? `?${queryString}` : ''}`;
        setLocation(path);
      }
    }
  }, [setLocation]);

  // Initialize push notifications
  const initializePushNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only work on native platforms');
      return;
    }

    try {
      // Check current permission status
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        // Request permission
        permStatus = await PushNotifications.requestPermissions();
      }

      setState(prev => ({
        ...prev,
        permissionStatus: permStatus.receive as 'prompt' | 'granted' | 'denied',
      }));

      if (permStatus.receive !== 'granted') {
        console.log('Push notification permission denied');
        return;
      }

      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration success
      await PushNotifications.addListener('registration', async (token: Token) => {
        console.log('Push registration success, token:', token.value);
        setState(prev => ({
          ...prev,
          token: token.value,
          isRegistered: true,
        }));

        // Register with backend
        await registerTokenWithBackend(token.value);
      });

      // Listen for registration errors
      await PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
        setState(prev => ({
          ...prev,
          isRegistered: false,
        }));
      });

      // Listen for notifications received while app is in foreground
      await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
        // Could show an in-app banner here if desired
      });

      // Listen for notification tap (from background or killed state)
      await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
        console.log('Push notification action performed:', action);
        const data = action.notification.data as DeepLinkData;
        if (data) {
          handleDeepLink(data);
        }
      });

    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }, [registerTokenWithBackend, handleDeepLink]);

  // Initialize on mount when userId is available
  useEffect(() => {
    if (userId) {
      initializePushNotifications();
    }

    // Cleanup listeners on unmount
    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [userId, initializePushNotifications]);

  // Re-register token if userId changes (e.g., after login)
  useEffect(() => {
    if (userId && state.token) {
      registerTokenWithBackend(state.token);
    }
  }, [userId, state.token, registerTokenWithBackend]);

  return {
    token: state.token,
    isRegistered: state.isRegistered,
    permissionStatus: state.permissionStatus,
    reinitialize: initializePushNotifications,
  };
}
