import { usePlatform } from "@/contexts/platform-context";
import { Smartphone, Globe } from "lucide-react";

export function PlatformToggle() {
  const { isNative, isSimulating, toggleSimulation } = usePlatform();

  // Only show in development mode
  if (import.meta.env.PROD) return null;

  return (
    <div 
      className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg"
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
