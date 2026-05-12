import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Clock, Copy, Check, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/queryClient";
import ambassadorLogo from "@assets/Ambassador_Logo_1768768266982.png";
import { t } from "@/lib/i18n";

export default function AmbassadorPending() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [ambassador, setAmbassador] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Application Pending | Sea Scroll Ambassador";
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/ambassador");
      return;
    }

    if (user) {
      fetchAmbassador();
    }
  }, [isLoading, isAuthenticated, user]);

  const fetchAmbassador = async () => {
    if (!user) return;
    try {
      const res = await apiFetch(`/api/ambassador/me?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setAmbassador(data.ambassador);
        
        if (data.ambassador.status === "active") {
          if (data.ambassador.isSuperAdmin) {
            setLocation("/admin");
          } else {
            setLocation("/ambassador/dashboard");
          }
        }
      }
    } catch (err) {
      console.error("Fetch ambassador error:", err);
    }
  };

  const handleCopy = () => {
    if (ambassador?.referralCode) {
      navigator.clipboard.writeText(`https://vagabondbible.com/?ref=${ambassador.referralCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #191919, #000000)' }}>
        <div className="animate-spin w-8 h-8 border-2 border-[#c08e00] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom, #191919, #000000)' }}>
      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#333] shadow-2xl">
        <CardHeader className="text-center">
          <img 
            src={ambassadorLogo} 
            alt="Sea Scroll Ambassador" 
            className="h-20 mx-auto mb-4 object-contain"
          />
          <div className="flex items-center justify-center gap-2 text-[#c08e00]">
            <Clock className="w-5 h-5" />
            <CardTitle className="text-xl text-[#c08e00]">{t("ambassador.application_pending")}</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-gray-400 text-center">
            {t("ambassador.thank_you")}
          </p>

          {ambassador && (
            <div className="bg-[#0a0a0a] rounded-lg p-4 space-y-3">
              <p className="text-sm text-gray-500">{t("ambassador.referral_ready")}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 truncate">
                  <Link className="inline w-4 h-4 mr-2 text-[#c08e00]" />
                  vagabondbible.com/?ref={ambassador.referralCode}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="border-[#333] hover:bg-[#c08e00]/10 hover:border-[#c08e00]"
                  data-testid="button-copy-link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {t("ambassador.start_sharing")}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-[#333]">
            <p className="text-xs text-gray-500 text-center">
              {t("ambassador.questions")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
