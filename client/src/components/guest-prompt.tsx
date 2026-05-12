import { Link } from "wouter";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlatform } from "@/contexts/platform-context";
import { getBottomNavOffset } from "@/lib/native-spacing";
import seaScrollDarkLogo from "@assets/Sea Scroll Logo Black.svg";

interface GuestPromptProps {
  featureDescription: string;
  featureDescriptionAmharic: string;
  redirectUrl: string;
}

function isAmharic(): boolean {
  const lang = navigator.language || (navigator as any).userLanguage || "en";
  return lang.startsWith("am");
}

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

const VagabondHeader = () => {
  const { isNative, platform } = usePlatform();
  
  const getHeaderStyle = () => {
    if (!isNative) return undefined;
    if (platform === 'android') {
      return { paddingTop: 'var(--android-status-bar-height, 44px)' };
    }
    return { paddingTop: 'env(safe-area-inset-top, 0px)' };
  };

  return (
    <nav 
      className="bg-white/95 backdrop-blur-sm border-b border-[hsl(30,20%,88%)]"
      style={getHeaderStyle()}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <img src={seaScrollDarkLogo} alt="Sea Scroll AI" className="h-10" data-testid="img-vagabond-logo" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export function GuestPrompt({ featureDescription, featureDescriptionAmharic, redirectUrl }: GuestPromptProps) {
  const { isNative, platform } = usePlatform();
  const isAm = isAmharic();
  
  const features = isAm ? FEATURES_AM : FEATURES_EN;
  
  const t = {
    headline: isAm ? "መለያ ይፍጠሩ" : "Create an Account",
    subtitle: isAm ? "የሚከተሉትን ለመጠቀም ይመዝገቡ" : "Sign up to unlock these features",
    createAccount: isAm ? "መለያ ፍጠር" : "Create Account",
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
            className="text-4xl sm:text-5xl font-bold text-foreground leading-tight"
            data-testid="heading-login-required"
          >
            {t.headline}
          </h1>
          
          {/* Subtitle */}
          <p className="text-muted-foreground mt-3 text-lg">
            {t.subtitle}
          </p>
          
          {/* Feature list with line checkmarks */}
          <div className="mt-8 space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-6 h-6 text-[#c08e00] flex-shrink-0" strokeWidth={2.5} />
                <span className="text-foreground font-semibold text-xl">{feature}</span>
              </div>
            ))}
          </div>
          
          {/* Buttons */}
          <div className="mt-10 space-y-3">
            <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}>
              <Button 
                className="w-full h-14 text-lg font-semibold bg-[#c08e00] hover:bg-[#a07800] text-white rounded-lg"
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
