import { usePlatform } from "@/contexts/platform-context";
import { Smartphone, Globe } from "lucide-react";

export function PlatformToggle() {
  const { isNative, isSimulating, toggleSimulation } = usePlatform();

  // Only show in development mode on web (hide on actual native devices and production)
  if (import.meta.env.PROD) return null;
  
  // Hide on actual native devices (only show web simulation toggle)
  if (isNative && !isSimulating) return null;

  return (
    <div 
      className="fixed top-4 left-4 z-[999999] flex items-center gap-2 bg-black/90 backdrop-blur-sm border-2 border-yellow-400 rounded-lg p-2 shadow-xl"
      data-testid="platform-toggle-container"
    >
      <button
        onClick={() => isSimulating && toggleSimulation()}
        className={`p-2 rounded-md transition-colors ${
          !isNative ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        }`}
        title="Web mode"
        data-testid="button-web-mode"
      >
        <Globe className="w-4 h-4" />
      </button>
      <button
        onClick={() => !isSimulating && toggleSimulation()}
        className={`p-2 rounded-md transition-colors ${
          isNative ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        }`}
        title="Native mode"
        data-testid="button-native-mode"
      >
        <Smartphone className="w-4 h-4" />
      </button>
    </div>
  );
}
