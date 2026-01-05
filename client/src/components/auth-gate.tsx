import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import vagabondLogo from "@assets/Vagabond_Bible_AI_Icon_1767553973302.png";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectPath = encodeURIComponent(location);
      setLocation(`/login?redirect=${redirectPath}`);
    }
  }, [isLoading, isAuthenticated, location, setLocation]);

  if (isLoading) {
    return (
      <div className="bg-[hsl(40,30%,96%)] min-h-screen flex flex-col items-center justify-center">
        <img src={vagabondLogo} alt="Vagabond Bible" className="h-16 w-auto mb-4 animate-pulse" />
        <div className="w-8 h-8 border-4 border-[hsl(25,35%,45%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
