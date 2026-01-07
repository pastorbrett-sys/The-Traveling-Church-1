import { usePlatform } from '@/contexts/platform-context';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor } from 'lucide-react';

export function PlatformToggle() {
  const { isNative, isSimulating, toggleSimulation } = usePlatform();
  
  if (typeof window === 'undefined') return null;
  
  const isLocalDev = window.location.hostname === 'localhost' || 
                     window.location.hostname.includes('replit') ||
                     window.location.hostname.includes('.dev');
  
  if (!isLocalDev) return null;
  
  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-background/95 backdrop-blur border rounded-lg p-2 shadow-lg"
      data-testid="platform-toggle-container"
    >
      <span className="text-xs text-muted-foreground px-2">
        Preview:
      </span>
      <Button
        variant={!isSimulating ? "default" : "outline"}
        size="sm"
        onClick={() => isSimulating && toggleSimulation()}
        className="gap-1"
        data-testid="button-web-preview"
      >
        <Monitor className="h-3 w-3" />
        Web
      </Button>
      <Button
        variant={isSimulating ? "default" : "outline"}
        size="sm"
        onClick={() => !isSimulating && toggleSimulation()}
        className="gap-1"
        data-testid="button-native-preview"
      >
        <Smartphone className="h-3 w-3" />
        Native App
      </Button>
    </div>
  );
}
