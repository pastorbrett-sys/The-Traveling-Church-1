import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeft,
  CheckCircle,
  Pause,
  Play,
  Shield,
  Users,
  MousePointer,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import ambassadorLogo from "@assets/Ambassador_Logo_1768768266982.png";

interface AmbassadorWithStats {
  id: string;
  userId: string;
  name: string;
  email: string;
  referralCode: string;
  inviteCode: string;
  referredBy: string | null;
  status: string;
  tier: number;
  isSuperAdmin: boolean;
  createdAt: string;
  clicks: number;
  signups: number;
  conversions: number;
  teamSize: number;
}

export default function AdminPanel() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [ambassadors, setAmbassadors] = useState<AmbassadorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "Admin Panel | Vagabond Bible";
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/ambassador");
      return;
    }

    if (user) {
      checkAdminAccess();
    }
  }, [isLoading, isAuthenticated, user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/ambassador/me?userId=${user.id}`);
      if (res.ok) {
        const { ambassador } = await res.json();
        if (!ambassador.isSuperAdmin) {
          setLocation("/ambassador");
          return;
        }
        fetchAmbassadors();
      } else {
        setLocation("/ambassador");
      }
    } catch (err) {
      console.error("Admin check error:", err);
      setLocation("/ambassador");
    }
  };

  const getAuthHeaders = async (): Promise<HeadersInit> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Not authenticated");
    }
    const token = await currentUser.getIdToken();
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchAmbassadors = async () => {
    if (!user) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/ambassador/admin/all", { headers });
      if (res.ok) {
        const data = await res.json();
        setAmbassadors(data.ambassadors);
      }
    } catch (err) {
      console.error("Fetch ambassadors error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!user) return;
    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/ambassador/admin/approve/${id}`, { 
        method: "POST",
        headers,
      });
      fetchAmbassadors();
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handlePause = async (id: string) => {
    if (!user) return;
    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/ambassador/admin/pause/${id}`, { 
        method: "POST",
        headers,
      });
      fetchAmbassadors();
    } catch (err) {
      console.error("Pause error:", err);
    }
  };

  const handleSetSuperAdmin = async (id: string, isSuperAdmin: boolean) => {
    if (!user) return;
    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/ambassador/admin/set-super-admin/${id}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ isSuperAdmin }),
      });
      fetchAmbassadors();
    } catch (err) {
      console.error("Set super admin error:", err);
    }
  };

  const filteredAmbassadors = ambassadors.filter(a => 
    statusFilter === "all" ? true : a.status === statusFilter
  );

  const pendingCount = ambassadors.filter(a => a.status === "pending").length;
  const totalClicks = ambassadors.reduce((sum, a) => sum + a.clicks, 0);
  const totalSignups = ambassadors.reduce((sum, a) => sum + a.signups, 0);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#c08e00] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/ambassador")}
            className="text-gray-400 hover:text-white"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <img 
            src={ambassadorLogo} 
            alt="Admin" 
            className="h-10 object-contain"
          />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
            <p className="text-xs text-gray-500">Manage ambassadors</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs">Total</p>
                  <p className="text-xl font-bold text-white">{ambassadors.length}</p>
                </div>
                <Users className="w-5 h-5 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs">Pending</p>
                  <p className="text-xl font-bold text-yellow-400">{pendingCount}</p>
                </div>
                <div className="w-5 h-5 rounded-full bg-yellow-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs">Clicks</p>
                  <p className="text-xl font-bold text-blue-400">{totalClicks}</p>
                </div>
                <MousePointer className="w-5 h-5 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs">Signups</p>
                  <p className="text-xl font-bold text-green-400">{totalSignups}</p>
                </div>
                <UserPlus className="w-5 h-5 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "pending", "active", "paused"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                statusFilter === status
                  ? "bg-[#c08e00] text-black font-medium"
                  : "bg-[#1a1a1a] text-gray-400 hover:text-white"
              }`}
              data-testid={`filter-${status}`}
            >
              {status}
              {status === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-black/30 px-1.5 py-0.5 rounded text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredAmbassadors.length === 0 ? (
            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No ambassadors found</p>
              </CardContent>
            </Card>
          ) : (
            filteredAmbassadors.map((amb) => (
              <Card key={amb.id} className="bg-[#1a1a1a] border-[#333]">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium truncate">{amb.name}</p>
                        {amb.isSuperAdmin && (
                          <Shield className="w-4 h-4 text-[#c08e00] flex-shrink-0" />
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${
                          amb.status === "active" 
                            ? "bg-green-500/20 text-green-400" 
                            : amb.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {amb.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm truncate">{amb.email}</p>
                      <p className="text-gray-600 text-xs mt-1">
                        Code: {amb.referralCode}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Clicks</p>
                          <p className="text-white text-sm">{amb.clicks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Signups</p>
                          <p className="text-white text-sm">{amb.signups}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pro</p>
                          <p className="text-[#c08e00] text-sm">{amb.conversions}</p>
                        </div>
                      </div>

                      <div className="flex gap-1 border-l border-[#333] pl-4">
                        {amb.status === "pending" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleApprove(amb.id)}
                            className="h-8 w-8 hover:bg-green-500/20 hover:text-green-400"
                            title="Approve"
                            data-testid={`approve-${amb.id}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {amb.status === "active" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handlePause(amb.id)}
                            className="h-8 w-8 hover:bg-yellow-500/20 hover:text-yellow-400"
                            title="Pause"
                            data-testid={`pause-${amb.id}`}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {amb.status === "paused" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleApprove(amb.id)}
                            className="h-8 w-8 hover:bg-green-500/20 hover:text-green-400"
                            title="Reactivate"
                            data-testid={`reactivate-${amb.id}`}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSetSuperAdmin(amb.id, !amb.isSuperAdmin)}
                          className={`h-8 w-8 ${amb.isSuperAdmin 
                            ? "text-[#c08e00] hover:bg-[#c08e00]/20" 
                            : "hover:bg-[#c08e00]/20 hover:text-[#c08e00]"
                          }`}
                          title={amb.isSuperAdmin ? "Remove Super Admin" : "Make Super Admin"}
                          data-testid={`toggle-admin-${amb.id}`}
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
