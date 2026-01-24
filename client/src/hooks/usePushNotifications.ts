import { useEffect, useCallback, useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Browser } from '@capacitor/browser';
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
  bookName?: string; // Book name for reliable lookup (e.g., "Psalms")
  chapter?: string;
  verse?: string;
  verseRef?: string;
  showActionMenu?: string;
  triggerHighlight?: string;
  url?: string; // External URL to open (for announcements)
}

export function usePushNotifications(userId: string | null | undefined) {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  
  // Track initialization state with refs to avoid re-renders triggering re-init
  const isInitializedRef = useRef(false);

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
  const handleDeepLink = useCallback(async (data: DeepLinkData) => {
    console.log('[Push] Handling deep link:', data);
    
    // Handle announcement with external URL
    if (data.type === 'announcement' && data.url) {
      console.log('[Push] Opening announcement URL:', data.url);
      try {
        await Browser.open({ url: data.url });
      } catch (error) {
        console.error('[Push] Error opening URL:', error);
        // Fallback to window.open
        window.open(data.url, '_blank');
      }
      return;
    }
    
    // Handle verse notifications
    if (data.type === 'verse_of_week' || data.type === 'verse') {
      const bookId = data.bookId;
      const bookName = data.bookName;
      const chapter = data.chapter;
      const verse = data.verse;

      console.log('[Push] Notification data received:', data);
      
      if ((bookId || bookName) && chapter) {
        const params = new URLSearchParams();
        params.set('tab', 'bible');
        if (bookId) params.set('book', bookId);
        if (bookName) params.set('bookName', bookName); // Include book name for reliable lookup
        params.set('chapter', chapter);
        if (verse) params.set('verse', verse);
        if (data.triggerHighlight === 'true') params.set('highlight', 'true');
        if (data.showActionMenu === 'true') params.set('showActionMenu', 'true');

        const path = `/pastor-chat?${params.toString()}`;
        console.log('[Push] Navigating to verse with showActionMenu:', data.showActionMenu, 'path:', path);
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
    
    // Store userId for use in callbacks
    const currentUserId = userId;

    const setupPushNotifications = async () => {
      console.log('[Push] ====== STARTING PUSH NOTIFICATION SETUP ======');

      try {
        // Step 1: Check/request permissions
        console.log('[Push] Step 1: Checking permissions...');
        let permStatus = await PushNotifications.checkPermissions();
        console.log('[Push] Permission status:', permStatus.receive);
        
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

        // Step 2: Remove any stale listeners first
        console.log('[Push] Step 2: Removing any stale listeners...');
        await PushNotifications.removeAllListeners();
        
        // Step 3: Add ALL listeners BEFORE calling register
        // Using Promise.all to ensure all are set up before proceeding
        console.log('[Push] Step 3: Adding notification listeners...');
        
        await Promise.all([
          PushNotifications.addListener('registration', async (tokenData: Token) => {
            console.log('[Push] >>> REGISTRATION EVENT RECEIVED <<<');
            console.log('[Push] Token:', tokenData.value.substring(0, 30) + '...');
            setToken(tokenData.value);
            setIsRegistered(true);
            
            // Register with backend immediately
            if (currentUserId) {
              await registerTokenWithBackend(tokenData.value, currentUserId);
            }
          }),
          
          PushNotifications.addListener('registrationError', (error) => {
            console.error('[Push] >>> REGISTRATION ERROR <<<', error);
            setIsRegistered(false);
          }),
          
          PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
            console.log('[Push] Notification received in foreground:', notification.title);
          }),
          
          PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
            console.log('[Push] Notification tapped:', action.notification.title);
            const data = action.notification.data as DeepLinkData;
            if (data) {
              handleDeepLink(data);
            }
          })
        ]);
        
        console.log('[Push] All 4 listeners added successfully');

        // Step 4: Small delay to ensure native side has processed listeners
        console.log('[Push] Step 4: Waiting for listeners to be ready...');
        await new Promise(resolve => setTimeout(resolve, 100));

        // Step 5: NOW call register
        console.log('[Push] Step 5: Calling register()...');
        await PushNotifications.register();
        console.log('[Push] ====== SETUP COMPLETE - WAITING FOR REGISTRATION EVENT ======');

      } catch (error) {
        console.error('[Push] Setup error:', error);
        isInitializedRef.current = false;
      }
    };

    setupPushNotifications();

    // Cleanup only on unmount
    return () => {
      console.log('[Push] Cleaning up listeners on unmount');
      PushNotifications.removeAllListeners();
      isInitializedRef.current = false;
    };
  }, [userId, handleDeepLink, registerTokenWithBackend]);

  // Allow manual re-initialization
  const reinitialize = useCallback(() => {
    console.log('[Push] Manual reinitialize requested');
    isInitializedRef.current = false;
  }, []);

  return {
    token,
    isRegistered,
    permissionStatus,
    reinitialize,
  };
}
