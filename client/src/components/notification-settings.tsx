import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatform } from "@/contexts/platform-context";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { apiRequest, apiFetch } from "@/lib/queryClient";

interface NotificationPreference {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface NotificationSettingsProps {
  userId: string;
  t: {
    notifications?: string;
    manageNotifications?: string;
    verseOfWeek?: string;
    verseOfWeekDesc?: string;
    enableNotifications?: string;
  };
}

const defaultText = {
  notifications: "Notifications",
  manageNotifications: "Manage your notification preferences",
  verseOfWeek: "Verse of the Week",
  verseOfWeekDesc: "Receive an inspiring Bible verse every Tuesday morning",
  enableNotifications: "Enable push notifications to receive verses",
};

export function NotificationSettings({ userId, t }: NotificationSettingsProps) {
  const { isNative } = usePlatform();
  const queryClient = useQueryClient();
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  const labels = { ...defaultText, ...t };

  useEffect(() => {
    async function checkPermission() {
      if (!isNative || !Capacitor.isNativePlatform()) {
        setPermissionStatus('unknown');
        setIsCheckingPermission(false);
        return;
      }

      try {
        const result = await PushNotifications.checkPermissions();
        setPermissionStatus(result.receive as 'prompt' | 'granted' | 'denied');
      } catch (error) {
        console.error('Error checking notification permission:', error);
        setPermissionStatus('unknown');
      } finally {
        setIsCheckingPermission(false);
      }
    }
    checkPermission();
  }, [isNative]);

  const { data: preferences, isLoading: isLoadingPrefs, error: prefsError } = useQuery<NotificationPreference[]>({
    queryKey: ['notification-preferences', userId],
    queryFn: async () => {
      console.log('[Notifications] Fetching preferences for userId:', userId);
      const response = await apiFetch(`/api/notifications/preferences?userId=${userId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Notifications] Failed to fetch preferences:', response.status, errorText);
        throw new Error('Failed to fetch notification preferences');
      }
      const data = await response.json();
      console.log('[Notifications] Received preferences:', data);
      return data;
    },
    enabled: isNative && permissionStatus === 'granted' && !!userId,
  });

  // Log errors for debugging
  if (prefsError) {
    console.error('[Notifications] Query error:', prefsError);
  }

  const updatePreferenceMutation = useMutation({
    mutationFn: async ({ notificationTypeId, enabled }: { notificationTypeId: string; enabled: boolean }) => {
      const response = await apiRequest('PUT', `/api/notifications/preferences/${notificationTypeId}`, { userId, enabled });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', userId] });
    },
  });

  const requestPermission = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const result = await PushNotifications.requestPermissions();
      setPermissionStatus(result.receive as 'prompt' | 'granted' | 'denied');
      if (result.receive === 'granted') {
        await PushNotifications.register();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleToggle = (notificationTypeId: string, currentEnabled: boolean) => {
    updatePreferenceMutation.mutate({ notificationTypeId, enabled: !currentEnabled });
  };

  if (!isNative) {
    return null;
  }

  if (isCheckingPermission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="heading-notifications">
            <Bell className="w-5 h-5" />
            {labels.notifications}
          </CardTitle>
          <CardDescription>{labels.manageNotifications}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="heading-notifications">
            <BellOff className="w-5 h-5 text-muted-foreground" />
            {labels.notifications}
          </CardTitle>
          <CardDescription>{labels.manageNotifications}</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={requestPermission}
            className="w-full py-3 px-4 bg-[hsl(25,35%,45%)] text-white rounded-lg hover:bg-[hsl(25,35%,40%)] transition-colors text-sm font-medium"
            data-testid="button-enable-notifications"
          >
            <Bell className="w-4 h-4 inline mr-2" />
            {labels.enableNotifications}
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" data-testid="heading-notifications">
          <Bell className="w-5 h-5 text-[hsl(25,35%,45%)]" />
          {labels.notifications}
        </CardTitle>
        <CardDescription>{labels.manageNotifications}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingPrefs ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {preferences?.map((pref) => {
              const isPending = updatePreferenceMutation.isPending && 
                updatePreferenceMutation.variables?.notificationTypeId === pref.id;

              // Use pref.id to check notification type (id is 'verse_of_week', name is display name)
              const displayName = pref.id === 'verse_of_week' ? labels.verseOfWeek : pref.name;
              const description = pref.id === 'verse_of_week' ? labels.verseOfWeekDesc : pref.description;

              return (
                <div
                  key={pref.id}
                  className="flex items-center justify-between py-2"
                  data-testid={`notification-row-${pref.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {description}
                    </p>
                  </div>
                  <div className="ml-4">
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Switch
                        checked={pref.enabled}
                        onCheckedChange={() => handleToggle(pref.id, pref.enabled)}
                        data-testid={`switch-${pref.id}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {(!preferences || preferences.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No notification types available
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
