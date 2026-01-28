import { Link } from "wouter";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Feature list with checkmarks
const FEATURES_EN = [
  "Smart Search",
  "AI Verse Insights", 
  "Save Notes",
  "Pastor Chat"
];

const FEATURES_AM = [
  "ብልጥ ፍለጋ",
  "AI የቁጥር ግንዛቤ",
  "ማስታወሻ አስቀምጥ",
  "የፓስተር ውይይት"
];

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
  
  const features = isAm ? FEATURES_AM : FEATURES_EN;
  
  const t = {
    headline: isAm ? "የ AI ባህሪያትን ያግኙ።\n100% ነፃ!" : "Access AI Features.\n100% Free!",
    subtitle: isAm ? "ክሬዲት ካርድ አያስፈልግም" : "No credit card required",
    createAccount: isAm ? "ነፃ መለያ ፍጠር" : "Create a free account",
    signIn: isAm ? "ግባ" : "Sign In"
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
        <div className="max-w-md mx-auto px-6">
          {/* Headline */}
          <h1 
            className="text-4xl sm:text-5xl font-bold text-foreground leading-tight whitespace-pre-line"
            data-testid="heading-login-required"
          >
            {t.headline}
          </h1>
          
          {/* Subtitle */}
          <p className="text-muted-foreground mt-3 text-lg">
            {t.subtitle}
          </p>
          
          {/* Feature list with checkmarks */}
          <div className="mt-8 space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-foreground font-semibold text-xl">{feature}</span>
              </div>
            ))}
          </div>
          
          {/* Buttons */}
          <div className="mt-10 space-y-3">
            <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}>
              <Button 
                className="w-full h-14 text-lg font-semibold bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-full"
                size="lg"
                data-testid="button-guest-create-account"
              >
                {t.createAccount}
              </Button>
            </Link>
            
            <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}>
              <button 
                className="w-full py-3 text-center text-foreground font-medium text-base hover:text-[#c08e00] transition-colors"
                data-testid="button-guest-signin"
              >
                {t.signIn}
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
