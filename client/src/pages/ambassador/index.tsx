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
  ArrowLeft,
  ChevronRight,
  X,
  ChevronsUpDown
} from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import ambassadorLogo from "@assets/Ambassador_Logo_1768768266982.png";

const INVITE_CODE_KEY = "vagabond_ambassador_invite";
const INVITE_EXPIRY_KEY = "vagabond_ambassador_invite_expiry";
const INVITE_EXPIRY_DAYS = 30;

function getStoredInviteCode(): string {
  const code = localStorage.getItem(INVITE_CODE_KEY);
  const expiryStr = localStorage.getItem(INVITE_EXPIRY_KEY);
  
  if (!code || !expiryStr) return "";
  
  const expiry = parseInt(expiryStr, 10);
  if (Date.now() > expiry) {
    localStorage.removeItem(INVITE_CODE_KEY);
    localStorage.removeItem(INVITE_EXPIRY_KEY);
    return "";
  }
  
  return code;
}

function storeInviteCode(code: string) {
  localStorage.setItem(INVITE_CODE_KEY, code);
  const expiry = Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(INVITE_EXPIRY_KEY, expiry.toString());
}

function clearStoredInviteCode() {
  localStorage.removeItem(INVITE_CODE_KEY);
  localStorage.removeItem(INVITE_EXPIRY_KEY);
}

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba",
  "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
  "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany",
  "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica",
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho",
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal", "Serbia", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Trinidad and Tobago",
  "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

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

interface SignupDetail {
  id: string;
  userId: string;
  email: string;
  name: string;
  convertedToPro: boolean;
  conversionDate: string | null;
  signupDate: string;
}

interface ClickDetail {
  id: string;
  userAgent: string | null;
  clickedAt: string;
}

interface ConversionDetail {
  id: string;
  userId: string;
  email: string;
  name: string;
  conversionDate: string | null;
}

type ViewState = "loading" | "login-required" | "apply" | "pending" | "dashboard";

export default function AmbassadorPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  
  // Get invite code from URL or localStorage (persists through login flow)
  const urlInviteCode = params.get("invite") || "";
  const [inviteCode, setInviteCode] = useState(() => {
    // Prefer URL param, fall back to stored code
    return urlInviteCode || getStoredInviteCode();
  });
  
  // Store invite code when it comes from URL
  useEffect(() => {
    if (urlInviteCode) {
      storeInviteCode(urlInviteCode);
      setInviteCode(urlInviteCode);
    }
  }, [urlInviteCode]);
  
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [ambassador, setAmbassador] = useState<AmbassadorData | null>(null);
  const [stats, setStats] = useState<AmbassadorStats>({ clicks: 0, signups: 0, conversions: 0 });
  const [team, setTeam] = useState<TeamMember[]>([]);
  
  const [applyName, setApplyName] = useState("");
  const [applyCountry, setApplyCountry] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [applyReason, setApplyReason] = useState("");
  const [applySource, setApplySource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  
  const [showSignups, setShowSignups] = useState(false);
  const [signupsList, setSignupsList] = useState<SignupDetail[]>([]);
  const [loadingSignups, setLoadingSignups] = useState(false);
  const [signupsTitle, setSignupsTitle] = useState("My Signups");
  
  const [showClicks, setShowClicks] = useState(false);
  const [clicksList, setClicksList] = useState<ClickDetail[]>([]);
  const [loadingClicks, setLoadingClicks] = useState(false);
  
  const [showConversions, setShowConversions] = useState(false);
  const [conversionsList, setConversionsList] = useState<ConversionDetail[]>([]);
  const [loadingConversions, setLoadingConversions] = useState(false);

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
          country: applyCountry.trim() || undefined,
          reason: applyReason.trim() || undefined,
          referralSource: applySource.trim() || undefined,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit application");
      }
      
      const data = await res.json();
      setAmbassador(data.ambassador);
      clearStoredInviteCode(); // Clear stored invite code after successful application
      setViewState("pending");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewSignups = async (userId?: string, memberName?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    setSignupsTitle(memberName ? `${memberName}'s Signups` : "My Signups");
    setShowSignups(true);
    setLoadingSignups(true);
    try {
      const res = await fetch(`/api/ambassador/signups/${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setSignupsList(data.signups || []);
      }
    } catch (err) {
      console.error("Failed to fetch signups:", err);
    } finally {
      setLoadingSignups(false);
    }
  };

  const handleViewClicks = async () => {
    if (!user) return;
    setShowClicks(true);
    setLoadingClicks(true);
    try {
      const res = await fetch(`/api/ambassador/clicks/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setClicksList(data.clicks || []);
      }
    } catch (err) {
      console.error("Failed to fetch clicks:", err);
    } finally {
      setLoadingClicks(false);
    }
  };

  const handleViewConversions = async () => {
    if (!user) return;
    setShowConversions(true);
    setLoadingConversions(true);
    try {
      const res = await fetch(`/api/ambassador/conversions/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setConversionsList(data.conversions || []);
      }
    } catch (err) {
      console.error("Failed to fetch conversions:", err);
    } finally {
      setLoadingConversions(false);
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #191919, #000000)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#c08e00]" />
      </div>
    );
  }

  if (viewState === "login-required") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom, #191919, #000000)' }}>
        <div className="w-full max-w-md mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/vagabond-bible")}
            className="text-gray-400 hover:text-white bg-transparent hover:bg-[#c08e00]/30"
            data-testid="button-back-login"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom, #191919, #000000)' }}>
        <div className="w-full max-w-md mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/vagabond-bible")}
            className="text-gray-400 hover:text-white bg-transparent hover:bg-[#c08e00]/30"
            data-testid="button-back-apply"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
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
              
              <div className="space-y-2">
                <Label htmlFor="country" className="text-gray-300">Country</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="w-full justify-between bg-[#0a0a0a] border-gray-700 text-white hover:bg-[#1a1a1a] hover:text-white"
                      data-testid="input-apply-country"
                    >
                      {applyCountry || "Select your country..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-[#0a0a0a] border-gray-700" align="start">
                    <Command className="bg-[#0a0a0a]">
                      <CommandInput placeholder="Search countries..." className="text-white" />
                      <CommandList>
                        <CommandEmpty className="text-gray-400 py-4 text-center text-sm">No country found.</CommandEmpty>
                        <CommandGroup>
                          {COUNTRIES.map((country) => (
                            <CommandItem
                              key={country}
                              value={country}
                              onSelect={(value) => {
                                setApplyCountry(value === applyCountry ? "" : value);
                                setCountryOpen(false);
                              }}
                              className="text-white hover:bg-[#1a1a1a] cursor-pointer"
                            >
                              <Check className={`mr-2 h-4 w-4 ${applyCountry === country ? "opacity-100" : "opacity-0"}`} />
                              {country}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source" className="text-gray-300">How did you hear about us?</Label>
                <Input
                  id="source"
                  type="text"
                  value={applySource}
                  onChange={(e) => setApplySource(e.target.value)}
                  placeholder="e.g., Tour guide, friend, social media"
                  className="bg-[#0a0a0a] border-gray-700 text-white"
                  data-testid="input-apply-source"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-gray-300">Why do you want to be an ambassador?</Label>
                <textarea
                  id="reason"
                  value={applyReason}
                  onChange={(e) => setApplyReason(e.target.value)}
                  placeholder="Tell us about yourself and why you'd like to share Vagabond Bible..."
                  className="w-full bg-[#0a0a0a] border border-gray-700 text-white rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#c08e00] focus:border-transparent"
                  data-testid="input-apply-reason"
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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom, #191919, #000000)' }}>
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
    <div className="min-h-screen p-4 pb-24 md:p-8" style={{ background: 'linear-gradient(to bottom, #191919, #000000)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/pastor-chat")}
              className="text-gray-400 hover:text-white bg-transparent hover:bg-[#c08e00]/30"
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
          <Card 
            className="bg-[#1a1a1a] border-[#333] cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={handleViewClicks}
            data-testid="card-clicks"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Link Clicks</p>
                  <p className="text-3xl font-bold text-white">{stats.clicks}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <MousePointer className="w-6 h-6 text-blue-400" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-[#1a1a1a] border-[#333] cursor-pointer hover:border-green-500/50 transition-colors"
            onClick={() => handleViewSignups()}
            data-testid="card-signups"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Signups</p>
                  <p className="text-3xl font-bold text-white">{stats.signups}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-green-400" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-[#1a1a1a] border-[#333] cursor-pointer hover:border-[#c08e00]/50 transition-colors"
            onClick={handleViewConversions}
            data-testid="card-conversions"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pro Conversions</p>
                  <p className="text-3xl font-bold text-[#c08e00]">{stats.conversions}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-[#c08e00]/20 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-[#c08e00]" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
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
            <p className="text-gray-400 text-sm">Grow your team. When they earn, you earn. Invite others to join the Ambassador Program.</p>
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
              <div className="space-y-3 mt-1">
                {team.map((member: TeamMember & { userId?: string }) => (
                  <div 
                    key={member.id}
                    className="p-3 bg-[#0a0a0a] rounded-lg cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                    onClick={() => {
                      const memberId = (member as any).userId || member.id;
                      handleViewSignups(memberId, member.name);
                    }}
                    data-testid={`team-member-${member.id}`}
                  >
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-gray-500 text-sm">{member.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {member.status === "pending" && ambassador?.isSuperAdmin ? (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const res = await fetch(`/api/ambassador/admin/approve/${member.id}`, {
                                method: "POST",
                              });
                              if (res.ok) {
                                await fetchDashboardData();
                              }
                            } catch (err) {
                              console.error("Failed to approve:", err);
                            }
                          }}
                          data-testid={`button-approve-${member.id}`}
                        >
                          Approve
                        </Button>
                      ) : (
                        <div className={`px-2 py-1 rounded text-xs ${
                          member.status === "active" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {member.status}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Sheet open={showSignups} onOpenChange={setShowSignups}>
        <SheetContent side="right" className="bg-[#1a1a1a] border-[#333] w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-400" />
              {signupsTitle} ({signupsList.length})
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
            {loadingSignups ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#c08e00]" />
              </div>
            ) : signupsList.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No signups yet</p>
                <p className="text-gray-500 text-sm mt-1">Share your referral link to get started</p>
              </div>
            ) : (
              signupsList.map((signup) => (
                <div 
                  key={signup.id}
                  className="p-4 bg-[#0a0a0a] rounded-lg border border-[#333]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{signup.name}</p>
                      <p className="text-gray-500 text-sm truncate">{signup.email}</p>
                      <p className="text-gray-600 text-xs mt-1">
                        Signed up {new Date(signup.signupDate).toLocaleDateString()}
                      </p>
                    </div>
                    {signup.convertedToPro && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-[#c08e00]/20 rounded text-xs text-[#c08e00]">
                        <Crown className="w-3 h-3" />
                        Pro
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showClicks} onOpenChange={setShowClicks}>
        <SheetContent side="right" className="bg-[#1a1a1a] border-[#333] w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-blue-400" />
              Link Clicks ({clicksList.length})
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
            {loadingClicks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#c08e00]" />
              </div>
            ) : clicksList.length === 0 ? (
              <div className="text-center py-8">
                <MousePointer className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No clicks yet</p>
                <p className="text-gray-500 text-sm mt-1">Share your referral link to get started</p>
              </div>
            ) : (
              clicksList.map((click) => (
                <div 
                  key={click.id}
                  className="p-4 bg-[#0a0a0a] rounded-lg border border-[#333]"
                >
                  <p className="text-gray-600 text-xs">
                    {new Date(click.clickedAt).toLocaleString()}
                  </p>
                  {click.userAgent && (
                    <p className="text-gray-500 text-xs mt-1 truncate">
                      {click.userAgent.includes("Mobile") ? "Mobile Device" : "Desktop"}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showConversions} onOpenChange={setShowConversions}>
        <SheetContent side="right" className="bg-[#1a1a1a] border-[#333] w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#c08e00]" />
              Pro Conversions ({conversionsList.length})
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
            {loadingConversions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#c08e00]" />
              </div>
            ) : conversionsList.length === 0 ? (
              <div className="text-center py-8">
                <Crown className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No Pro conversions yet</p>
                <p className="text-gray-500 text-sm mt-1">Users who subscribe to Pro will appear here</p>
              </div>
            ) : (
              conversionsList.map((conversion) => (
                <div 
                  key={conversion.id}
                  className="p-4 bg-[#0a0a0a] rounded-lg border border-[#333]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{conversion.name}</p>
                      <p className="text-gray-500 text-sm truncate">{conversion.email}</p>
                      {conversion.conversionDate && (
                        <p className="text-gray-600 text-xs mt-1">
                          Converted {new Date(conversion.conversionDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-[#c08e00]/20 rounded text-xs text-[#c08e00]">
                      <Crown className="w-3 h-3" />
                      Pro
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
