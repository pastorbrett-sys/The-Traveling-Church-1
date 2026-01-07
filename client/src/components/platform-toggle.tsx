import { usePlatform } from '@/contexts/platform-context';
import { Smartphone, Monitor } from 'lucide-react';

export function PlatformToggle() {
  const { isSimulating, toggleSimulation } = usePlatform();
  
  if (typeof window === 'undefined') return null;
  
  const isLocalDev = window.location.hostname === 'localhost' || 
                     window.location.hostname.includes('replit') ||
                     window.location.hostname.includes('.dev');
  
  if (!isLocalDev) return null;
  
  return (
    <div 
      className="fixed top-2 right-2 z-[60] flex items-center gap-1 bg-background/90 backdrop-blur border rounded-full p-1 shadow-md"
      data-testid="platform-toggle-container"
    >
      <button
        onClick={() => isSimulating && toggleSimulation()}
        className={`p-1.5 rounded-full transition-colors ${
          !isSimulating ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        data-testid="button-web-preview"
        title="Web Preview"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => !isSimulating && toggleSimulation()}
        className={`p-1.5 rounded-full transition-colors ${
          isSimulating ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        data-testid="button-native-preview"
        title="Native App Preview"
      >
        <Smartphone className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
