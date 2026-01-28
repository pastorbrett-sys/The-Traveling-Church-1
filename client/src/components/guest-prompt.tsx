import { Link } from "wouter";
import { User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatform } from "@/contexts/platform-context";
import { getBottomNavOffset } from "@/lib/native-spacing";
import vagabondLogo from "@/assets/vagabond-logo.png";

interface GuestPromptProps {
  featureDescription: string;
  featureDescriptionAmharic: string;
  redirectUrl: string;
}

function isAmharic(): boolean {
  const lang = navigator.language || (navigator as any).userLanguage || "en";
  return lang.startsWith("am");
}

const VagabondHeader = () => (
  <nav className="bg-white/95 backdrop-blur-sm border-b border-[hsl(30,20%,88%)]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <Link href="/">
          <img src={vagabondLogo} alt="Vagabond Bible AI" className="h-10" data-testid="img-vagabond-logo" />
        </Link>
      </div>
    </div>
  </nav>
);

export function GuestPrompt({ featureDescription, featureDescriptionAmharic, redirectUrl }: GuestPromptProps) {
  const { isNative, platform } = usePlatform();
  const isAm = isAmharic();
  
  const text = {
    signInRequired: isAm ? "መግባት ያስፈልጋል" : "Sign In Required",
    description: isAm ? featureDescriptionAmharic : featureDescription,
    signIn: isAm ? "ግባ" : "Sign In",
  };

  const getMainStyle = () => {
    if (!isNative) return undefined;
    
    if (platform === "ios") {
      return {
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: `calc(${getBottomNavOffset()} + 16px)`,
      };
    }
    
    if (platform === "android") {
      return {
        paddingTop: "var(--android-status-bar-height, 44px)",
        paddingBottom: `calc(${getBottomNavOffset()} + 16px)`,
      };
    }
    
    return {
      paddingBottom: `calc(${getBottomNavOffset()} + 16px)`,
    };
  };

  return (
    <div className={`bg-[hsl(40,30%,96%)] text-foreground antialiased flex flex-col ${
      isNative ? "h-screen overflow-hidden" : "min-h-screen"
    }`}>
      {!isNative && <VagabondHeader />}
      <main 
        className="flex-1 flex items-center justify-center overflow-y-auto"
        style={getMainStyle()}
      >
        <div className="max-w-md mx-auto px-4">
          <Card className="border-[hsl(30,20%,88%)]">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-[hsl(25,35%,45%)]/10 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-[hsl(25,35%,45%)]" />
              </div>
              <CardTitle data-testid="heading-login-required">{text.signInRequired}</CardTitle>
              <CardDescription>
                {text.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}>
                <Button className="bg-[#c08e00] hover:bg-[#a07800] gap-2" data-testid="button-guest-signin">
                  <LogIn className="w-4 h-4" />
                  {text.signIn}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
