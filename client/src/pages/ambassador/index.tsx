import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { 
  Loader2, 
  Copy, 
  Check, 
  Link as LinkIcon, 
  Users, 
  MousePointer, 
  UserPlus, 
  Crown, 
  TrendingUp,
  Clock,
  Shield,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import ambassadorLogo from "@assets/Ambassador_Logo_1768768266982.png";

interface AmbassadorData {
  id: string;
  userId: string;
  name: string;
  email: string;
  referralCode: string;
  inviteCode: string;
  status: string;
  isSuperAdmin: boolean;
}

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

type ViewState = "loading" | "login-required" | "apply" | "pending" | "dashboard";

export default function AmbassadorPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const inviteCode = params.get("invite") || "";
  
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [ambassador, setAmbassador] = useState<AmbassadorData | null>(null);
  const [stats, setStats] = useState<AmbassadorStats>({ clicks: 0, signups: 0, conversions: 0 });
  const [team, setTeam] = useState<TeamMember[]>([]);
  
  const [applyName, setApplyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    document.title = "Ambassador Program | Vagabond Bible";
  }, []);

  useEffect(() => {
    if (isLoading) {
      setViewState("loading");
      return;
    }

    if (!isAuthenticated || !user) {
      setViewState("login-required");
      return;
    }

    checkAmbassadorStatus();
  }, [isLoading, isAuthenticated, user]);

  const checkAmbassadorStatus = async () => {
    if (!user) return;
    
    try {
      const res = await fetch(`/api/ambassador/me?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setAmbassador(data.ambassador);
        
        if (data.ambassador.status === "active") {
          await fetchDashboardData();
          setViewState("dashboard");
        } else {
          setViewState("pending");
        }
      } else {
        setApplyName(user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "");
        setViewState("apply");
      }
    } catch (err) {
      console.error("Ambassador check error:", err);
      setViewState("apply");
    }
  };

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/ambassador/dashboard/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setAmbassador(data.ambassador);
        setStats(data.stats);
        setTeam(data.team || []);
      }
    } catch (err) {
      console.error("Fetch dashboard error:", err);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !applyName.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch("/api/ambassador/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: applyName.trim(),
          inviteCode: inviteCode,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit application");
      }
      
      const data = await res.json();
      setAmbassador(data.ambassador);
      setViewState("pending");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (ambassador?.referralCode) {
      navigator.clipboard.writeText(`https://vagabondbible.com/?ref=${ambassador.referralCode}`);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleCopyInvite = () => {
    if (ambassador?.inviteCode) {
      navigator.clipboard.writeText(`https://vagabondbible.com/ambassador?invite=${ambassador.inviteCode}`);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };

  const handleGoToLogin = () => {
    const currentPath = window.location.pathname + window.location.search;
    setLocation(`/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  if (viewState === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c08e00]" />
      </div>
    );
  }

  if (viewState === "login-required") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1a1a1a] border-[#333] shadow-2xl">
          <CardHeader className="text-center">
            <img 
              src={ambassadorLogo} 
              alt="Vagabond Bible Ambassador" 
              className="h-24 mx-auto mb-4 object-contain"
            />
            <CardTitle className="text-xl text-white">Join the Ambassador Program</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to your Vagabond Bible account to become an ambassador
            </CardDescription>
            {inviteCode && (
              <p className="text-sm text-[#c08e00] mt-2">
                You've been invited to join the Ambassador Program
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoToLogin}
              className="w-full bg-[#c08e00] hover:bg-[#a07800] text-black font-medium"
              data-testid="button-go-to-login"
            >
              Sign In to Continue
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Don't have an account? You can create one during sign in.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewState === "apply") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1a1a1a] border-[#333] shadow-2xl">
          <CardHeader className="text-center">
            <img 
              src={ambassadorLogo} 
              alt="Vagabond Bible Ambassador" 
              className="h-24 mx-auto mb-4 object-contain"
            />
            <CardTitle className="text-xl text-white">Become an Ambassador</CardTitle>
            <CardDescription className="text-gray-400">
              Share Vagabond Bible with your community and earn rewards
            </CardDescription>
            {inviteCode && (
              <p className="text-sm text-[#c08e00] mt-2">
                You've been invited by another ambassador
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApply} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={applyName}
                  onChange={(e) => setApplyName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-[#0a0a0a] border-gray-700 text-white"
                  data-testid="input-apply-name"
                  required
                />
              </div>
              
              <div className="bg-[#0a0a0a] rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-white">As an Ambassador, you'll:</p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Get your own unique referral link</li>
                  <li>• Track signups and conversions</li>
                  <li>• Recruit other ambassadors to your team</li>
                  <li>• Earn rewards for Pro subscriptions</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !applyName.trim()}
                className="w-full bg-[#c08e00] hover:bg-[#a07800] text-black font-medium"
                data-testid="button-apply-submit"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                ) : (
                  "Apply to be an Ambassador"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewState === "pending") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1a1a1a] border-[#333] shadow-2xl">
          <CardHeader className="text-center">
            <img 
              src={ambassadorLogo} 
              alt="Vagabond Bible Ambassador" 
              className="h-20 mx-auto mb-4 object-contain"
            />
            <div className="flex items-center justify-center gap-2 text-[#c08e00]">
              <Clock className="w-5 h-5" />
              <CardTitle className="text-xl text-[#c08e00]">Application Pending</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-gray-400 text-center">
              Thank you for applying to the Vagabond Bible Ambassador Program! 
              Your application is being reviewed and you'll be notified once approved.
            </p>

            {ambassador && (
              <div className="bg-[#0a0a0a] rounded-lg p-4 space-y-3">
                <p className="text-sm text-gray-500">Your referral link is ready:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 truncate">
                    <LinkIcon className="inline w-4 h-4 mr-2 text-[#c08e00]" />
                    vagabondbible.com/?ref={ambassador.referralCode}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyRef}
                    className="border-[#333] hover:bg-[#c08e00]/10 hover:border-[#c08e00]"
                    data-testid="button-copy-link-pending"
                  >
                    {copiedRef ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  You can start sharing this link now - clicks will be tracked!
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-[#333]">
              <p className="text-xs text-gray-500 text-center">
                Questions? Contact us at support@vagabondbible.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/pastor-chat")}
              className="text-gray-400 hover:text-white"
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img 
              src={ambassadorLogo} 
              alt="Vagabond Bible Ambassador" 
              className="h-[72px] md:h-[104px] object-contain"
            />
          </div>
          {ambassador?.isSuperAdmin && (
            <>
              <Button
                onClick={() => setLocation("/admin")}
                size="icon"
                className="bg-[#c08e00] hover:bg-[#a07800] text-black md:hidden mt-[7px]"
                data-testid="button-admin-panel-mobile"
              >
                <Shield className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => setLocation("/admin")}
                className="bg-[#c08e00] hover:bg-[#a07800] text-black font-medium hidden md:flex mt-[7px]"
                data-testid="button-admin-panel"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </>
          )}
        </div>

        <Card className="bg-[#1a1a1a] border-[#333]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[#c08e00]" />
              Invite New Users
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
                  <><Check className="w-4 h-4 mr-2" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copy</>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Share this link to Earn money for users you share The Bible with that Subscribe</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Link Clicks</p>
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
                  <p className="text-gray-500 text-sm">Signups</p>
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
                  <p className="text-gray-500 text-sm">Pro Conversions</p>
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
              Recruit Ambassadors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">Invite others to join the Ambassador Program and grow your team when they earn, you earn</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-gray-300 truncate font-mono text-sm">
                vagabondbible.com/ambassador?invite={ambassador?.inviteCode}
              </div>
              <Button
                onClick={handleCopyInvite}
                className="bg-[#c08e00] hover:bg-[#a07800] text-black font-medium"
                data-testid="button-copy-invite"
              >
                {copiedInvite ? (
                  <><Check className="w-4 h-4 mr-2" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copy</>
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
                My Team ({team.length})
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
                        <p className="text-gray-500">Clicks</p>
                        <p className="text-white font-medium">{member.clicks}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Signups</p>
                        <p className="text-white font-medium">{member.signups}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        member.status === "active" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {member.status}
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
