import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { 
  Users, 
  Mail, 
  Bell, 
  BarChart3, 
  Settings, 
  BookOpen,
  ChevronRight,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Shield
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

const MENU_ITEMS = [
  { id: "ambassadors", label: "Ambassadors", icon: Users, available: true },
  { id: "users", label: "Users", icon: Users, available: false },
  { id: "content", label: "Content", icon: BookOpen, available: false },
  { id: "analytics", label: "Analytics", icon: BarChart3, available: false },
  { id: "email", label: "Email Constructor", icon: Mail, available: false },
  { id: "notifications", label: "Notifications", icon: Bell, available: false },
  { id: "settings", label: "Settings", icon: Settings, available: false },
];

export default function AdminPanel() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("ambassadors");
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
          setLocation("/ambassador/dashboard");
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

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#c08e00] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <aside className="w-64 bg-[#111] border-r border-[#222] p-4 flex flex-col">
        <img 
          src={ambassadorLogo} 
          alt="Admin" 
          className="h-12 object-contain mb-8"
        />
        
        <nav className="space-y-1 flex-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => item.available && setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? "bg-[#c08e00]/20 text-[#c08e00]"
                  : item.available
                  ? "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                  : "text-gray-600 cursor-not-allowed"
              }`}
              disabled={!item.available}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {!item.available && (
                <span className="text-xs text-gray-600">Soon</span>
              )}
              {item.id === "ambassadors" && pendingCount > 0 && (
                <span className="bg-[#c08e00] text-black text-xs px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-[#222]">
          <p className="text-xs text-gray-600 text-center">
            Super Admin Panel
          </p>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {activeSection === "ambassadors" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Ambassador Management</h1>
              <div className="flex gap-2">
                {["all", "pending", "active", "paused"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg text-sm capitalize ${
                      statusFilter === status
                        ? "bg-[#c08e00] text-black"
                        : "bg-[#1a1a1a] text-gray-400 hover:text-white"
                    }`}
                    data-testid={`filter-${status}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#1a1a1a] border-[#333]">
                <CardContent className="pt-4">
                  <p className="text-gray-500 text-sm">Total Ambassadors</p>
                  <p className="text-2xl font-bold text-white">{ambassadors.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a1a] border-[#333]">
                <CardContent className="pt-4">
                  <p className="text-gray-500 text-sm">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a1a] border-[#333]">
                <CardContent className="pt-4">
                  <p className="text-gray-500 text-sm">Total Clicks</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {ambassadors.reduce((sum, a) => sum + a.clicks, 0)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a1a] border-[#333]">
                <CardContent className="pt-4">
                  <p className="text-gray-500 text-sm">Total Signups</p>
                  <p className="text-2xl font-bold text-green-400">
                    {ambassadors.reduce((sum, a) => sum + a.signups, 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1a1a1a] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">All Ambassadors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredAmbassadors.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No ambassadors found</p>
                  ) : (
                    filteredAmbassadors.map((amb) => (
                      <div 
                        key={amb.id}
                        className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{amb.name}</p>
                            {amb.isSuperAdmin && (
                              <Shield className="w-4 h-4 text-[#c08e00]" />
                            )}
                          </div>
                          <p className="text-gray-500 text-sm">{amb.email}</p>
                          <p className="text-gray-600 text-xs mt-1">
                            Code: {amb.referralCode} | Team: {amb.teamSize}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Clicks</p>
                            <p className="text-white">{amb.clicks}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Signups</p>
                            <p className="text-white">{amb.signups}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Pro</p>
                            <p className="text-[#c08e00]">{amb.conversions}</p>
                          </div>
                          
                          <div className={`px-2 py-1 rounded text-xs ${
                            amb.status === "active" 
                              ? "bg-green-500/20 text-green-400" 
                              : amb.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {amb.status}
                          </div>

                          <div className="flex gap-1">
                            {amb.status === "pending" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleApprove(amb.id)}
                                className="hover:bg-green-500/20 hover:text-green-400"
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
                                className="hover:bg-yellow-500/20 hover:text-yellow-400"
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
                                className="hover:bg-green-500/20 hover:text-green-400"
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
                              className={amb.isSuperAdmin 
                                ? "text-[#c08e00] hover:bg-[#c08e00]/20" 
                                : "hover:bg-[#c08e00]/20 hover:text-[#c08e00]"
                              }
                              title={amb.isSuperAdmin ? "Remove Super Admin" : "Make Super Admin"}
                              data-testid={`toggle-admin-${amb.id}`}
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection !== "ambassadors" && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl text-gray-500 mb-2">Coming Soon</h2>
              <p className="text-gray-600">This feature is under development</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
