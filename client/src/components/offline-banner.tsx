import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2"
      style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}
      data-testid="banner-offline"
    >
      <WifiOff className="h-4 w-4" />
      <span>You're offline. Some features may be unavailable.</span>
    </div>
  );
}
