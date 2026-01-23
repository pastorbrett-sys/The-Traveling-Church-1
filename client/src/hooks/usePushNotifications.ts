import { useEffect, useCallback, useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { useLocation } from 'wouter';

// Production server URL for native apps
const PRODUCTION_URL = 'https://vagabondbible.com';

function getApiUrl(path: string): string {
  const isNative = Capacitor.isNativePlatform();
  return isNative ? `${PRODUCTION_URL}${path}` : path;
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
  const [token, setToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  
  // Track initialization state with refs to avoid re-renders triggering re-init
  const isInitializedRef = useRef(false);
  const listenersAddedRef = useRef(false);

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

  // Register token with backend - stable callback
  const registerTokenWithBackend = useCallback(async (tokenValue: string, userIdValue: string) => {
    const platform = Capacitor.getPlatform();
    const { timezone, utcOffset } = getTimezoneInfo();

    try {
      console.log('[Push] Registering token with backend for user:', userIdValue);
      const response = await fetch(getApiUrl('/api/notifications/register-token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          deviceToken: tokenValue,
          platform,
          timezone,
          utcOffset,
          userId: userIdValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register token');
      }

      console.log('[Push] Token registered successfully with backend');
    } catch (error) {
      console.error('[Push] Error registering push token:', error);
    }
  }, [getTimezoneInfo]);

  // Handle deep link navigation - stable callback
  const handleDeepLink = useCallback((data: DeepLinkData) => {
    console.log('[Push] Handling deep link:', data);
    if (data.type === 'verse_of_week' || data.type === 'verse') {
      const bookId = data.bookId;
      const chapter = data.chapter;
      const verse = data.verse;

      if (bookId && chapter) {
        const params = new URLSearchParams();
        if (verse) params.set('verse', verse);
        if (data.showActionMenu === 'true') params.set('showAction', 'true');
        if (data.triggerHighlight === 'true') params.set('highlight', 'true');

        const queryString = params.toString();
        const path = `/bible/${bookId}/${chapter}${queryString ? `?${queryString}` : ''}`;
        console.log('[Push] Navigating to:', path);
        setLocation(path);
      }
    }
  }, [setLocation]);

  // Main initialization effect - runs once when userId becomes available
  useEffect(() => {
    // Skip if not on native platform
    if (!Capacitor.isNativePlatform()) {
      console.log('[Push] Not a native platform, skipping');
      return;
    }

    // Skip if already initialized or no user
    if (isInitializedRef.current || !userId) {
      return;
    }

    // Mark as initializing to prevent duplicate attempts
    isInitializedRef.current = true;

    const setupPushNotifications = async () => {
      try {
        console.log('[Push] Starting push notification setup...');

        // Step 1: Check/request permissions
        let permStatus = await PushNotifications.checkPermissions();
        console.log('[Push] Current permission status:', permStatus.receive);
        
        if (permStatus.receive === 'prompt') {
          console.log('[Push] Requesting permissions...');
          permStatus = await PushNotifications.requestPermissions();
          console.log('[Push] Permission result:', permStatus.receive);
        }

        setPermissionStatus(permStatus.receive as 'prompt' | 'granted' | 'denied');

        if (permStatus.receive !== 'granted') {
          console.log('[Push] Permission not granted, aborting');
          isInitializedRef.current = false;
          return;
        }

        // Step 2: Add listeners FIRST (critical ordering)
        if (!listenersAddedRef.current) {
          console.log('[Push] Adding notification listeners...');
          
          await PushNotifications.addListener('registration', async (tokenData: Token) => {
            console.log('[Push] Registration success! Token:', tokenData.value.substring(0, 20) + '...');
            setToken(tokenData.value);
            setIsRegistered(true);
          });

          await PushNotifications.addListener('registrationError', (error) => {
            console.error('[Push] Registration error:', error);
            setIsRegistered(false);
          });

          await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
            console.log('[Push] Notification received in foreground:', notification.title);
          });

          await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
            console.log('[Push] Notification tapped:', action.notification.title);
            const data = action.notification.data as DeepLinkData;
            if (data) {
              handleDeepLink(data);
            }
          });

          listenersAddedRef.current = true;
          console.log('[Push] All listeners added successfully');
        }

        // Step 3: Register for push (AFTER listeners are set up)
        console.log('[Push] Calling register()...');
        await PushNotifications.register();
        console.log('[Push] Register() called successfully');

      } catch (error) {
        console.error('[Push] Setup error:', error);
        isInitializedRef.current = false;
      }
    };

    setupPushNotifications();

    // Cleanup only on unmount
    return () => {
      if (listenersAddedRef.current) {
        console.log('[Push] Cleaning up listeners on unmount');
        PushNotifications.removeAllListeners();
        listenersAddedRef.current = false;
        isInitializedRef.current = false;
      }
    };
  }, [userId, handleDeepLink]);

  // Separate effect to register token with backend when we have both token and userId
  useEffect(() => {
    if (token && userId) {
      registerTokenWithBackend(token, userId);
    }
  }, [token, userId, registerTokenWithBackend]);

  // Allow manual re-initialization
  const reinitialize = useCallback(() => {
    isInitializedRef.current = false;
    listenersAddedRef.current = false;
  }, []);

  return {
    token,
    isRegistered,
    permissionStatus,
    reinitialize,
  };
}
