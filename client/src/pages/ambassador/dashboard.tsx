import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Copy, Check, Link, Users, MousePointer, UserPlus, Crown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/queryClient";
import { isNativePlatform } from "@/lib/host-detection";
import { Haptics, NotificationType } from "@capacitor/haptics";
import ambassadorLogo from "@assets/Ambassador_Logo_1768768266982.png";
import { t } from "@/lib/i18n";

interface AmbassadorStats {
  clicks: number;
  signups: number;
  conversions: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: string;
  clicks: number;
  signups: number;
  createdAt: string;
}

export default function AmbassadorDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [ambassador, setAmbassador] = useState<any>(null);
  const [stats, setStats] = useState<AmbassadorStats>({ clicks: 0, signups: 0, conversions: 0 });
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard | Vagabond Faith Ambassador";
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/ambassador");
      return;
    }

    if (user) {
      fetchDashboard();
    }
  }, [isLoading, isAuthenticated, user]);

  const fetchDashboard = async () => {
    if (!user) return;
    try {
      const res = await apiFetch(`/api/ambassador/dashboard/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setAmbassador(data.ambassador);
        setStats(data.stats);
        setTeam(data.team || []);
        
        if (data.ambassador.status === "pending") {
          setLocation("/ambassador/pending");
        } else if (data.ambassador.isSuperAdmin) {
          setLocation("/admin");
        }
      } else {
        setLocation("/ambassador");
      }
    } catch (err) {
      console.error("Fetch dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRef = async () => {
    if (ambassador?.referralCode) {
      navigator.clipboard.writeText(`https://vagabondbible.com/?ref=${ambassador.referralCode}`);
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch (e) {
        // Haptics not available on web
      }
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleCopyInvite = async () => {
    if (ambassador?.inviteCode) {
      navigator.clipboard.writeText(`https://vagabondbible.com/ambassador?invite=${ambassador.inviteCode}`);
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch (e) {
        // Haptics not available on web
      }
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #191919, #000000)' }}>
        <div className="animate-spin w-8 h-8 border-2 border-[#c08e00] border-t-transparent rounded-full" />
      </div>
    );
  }

  const isNative = isNativePlatform();

  return (
    <div 
      className="min-h-screen p-4 md:p-8" 
      style={{ 
        background: 'linear-gradient(to bottom, #191919, #000000)',
        paddingTop: isNative ? 'calc(env(safe-area-inset-top, 0px) + 16px)' : undefined,
        paddingBottom: isNative ? 'calc(env(safe-area-inset-bottom, 0px) + 100px)' : undefined
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <img 
            src={ambassadorLogo} 
            alt="Vagabond Faith Ambassador" 
            className="h-14 object-contain"
          />
          <div className="text-right">
            <p className="text-gray-400 text-sm">{t("ambassador.welcome_back")}</p>
            <p className="text-white font-medium">{ambassador?.name}</p>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-[#c08e00]/20 to-[#1a1a1a] border-[#c08e00]/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Link className="w-5 h-5 text-[#c08e00]" />
              {t("ambassador.your_referral_link")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-gray-300 truncate font-mono text-sm">
                vagabondbible.com/?ref={ambassador?.referralCode}
              </div>
              <Button
                onClick={handleCopyRef}
                className="bg-[#c08e00] hover:bg-[#a07800] text-black font-medium"
                data-testid="button-copy-referral"
              >
                {copiedRef ? (
                  <><Check className="w-4 h-4 mr-2" /> {t("ambassador.copied")}</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> {t("ambassador.copy")}</>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t("ambassador.share_to_track")}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{t("ambassador.link_clicks")}</p>
                  <p className="text-3xl font-bold text-white">{stats.clicks}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <MousePointer className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{t("ambassador.signups")}</p>
                  <p className="text-3xl font-bold text-white">{stats.signups}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{t("ambassador.pro_conversions")}</p>
                  <p className="text-3xl font-bold text-[#c08e00]">{stats.conversions}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#c08e00]/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-[#c08e00]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1a1a1a] border-[#333]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#c08e00]" />
              {t("ambassador.recruit_ambassadors")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">
              {t("ambassador.invite_others")}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-gray-300 truncate font-mono text-sm">
                vagabondbible.com/ambassador?invite={ambassador?.inviteCode}
              </div>
              <Button
                onClick={handleCopyInvite}
                variant="outline"
                className="border-[#333] hover:bg-[#c08e00]/10 hover:border-[#c08e00] text-gray-300"
                data-testid="button-copy-invite"
              >
                {copiedInvite ? (
                  <><Check className="w-4 h-4 mr-2" /> {t("ambassador.copied")}</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> {t("ambassador.copy")}</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {team.length > 0 && (
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#c08e00]" />
                {t("ambassador.my_team")} ({team.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-gray-500 text-sm">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">{t("ambassador.clicks")}</p>
                        <p className="text-white font-medium">{member.clicks}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">{t("ambassador.signups")}</p>
                        <p className="text-white font-medium">{member.signups}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        member.status === "active" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {member.status === "active" ? t("ambassador.active") : t("ambassador.pending")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
