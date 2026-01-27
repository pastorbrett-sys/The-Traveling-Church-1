import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  Flame, 
  Calendar,
  MessageCircle,
  Lock,
  ChevronRight
} from "lucide-react";

import litCandleImage from "@assets/candle_cropped.png";

function AnimatedCandle() {
  return (
    <div className="relative flex items-center justify-center h-full w-full">
      <motion.div
        className="absolute rounded-full blur-2xl"
        style={{
          width: '120px',
          height: '80px',
          top: '5%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.9) 0%, rgba(251,191,36,0) 70%)',
        }}
        animate={{
          opacity: [0.7, 1, 0.7],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <img 
        src={litCandleImage} 
        alt="Lit candle" 
        style={{
          height: 'calc(160vh - 448px)',
          width: 'auto',
        }}
      />
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { usePlatform } from "@/contexts/platform-context";
import { NativeTabBarSpacer } from "@/components/native-tab-bar";
import { CandleDonation } from "@/components/candle-donation";

interface PrayerStats {
  totalSessions: number;
  totalMinutes: number;
  streak: number;
  prayerRequestCount: number;
  recentSessions: Array<{
    id: string;
    durationSeconds: number;
    completedAt: string;
    withMusic: boolean;
  }>;
}

interface PrayerRequest {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  respondedAt: string | null;
  responseContent: string | null;
}

export default function PrayerRequests() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { isNative, platform } = usePlatform();
  
  const [view, setView] = useState<"list" | "form" | "donation">("list");
  const [prayerContent, setPrayerContent] = useState("");
  const [name, setName] = useState(user?.firstName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittedPrayerId, setSubmittedPrayerId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<PrayerStats>({
    queryKey: ["/api/prayer-stats"],
    enabled: isAuthenticated,
  });

  const { data: prayers, isLoading: prayersLoading } = useQuery<PrayerRequest[]>({
    queryKey: ["/api/prayer-requests"],
    enabled: isAuthenticated,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { name?: string; email?: string; content: string; isAnonymous: boolean }) => {
      const res = await apiRequest("POST", "/api/prayer-requests", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-stats"] });
      setSubmittedPrayerId(data.prayerRequest?.id || null);
      setView("donation");
      setPrayerContent("");
    },
  });

  const handleSubmit = () => {
    if (!prayerContent.trim()) return;
    submitMutation.mutate({
      name: isAnonymous ? undefined : name,
      email: isAnonymous ? undefined : email,
      content: prayerContent,
      isAnonymous,
    });
  };

  const getNavStyle = () => {
    if (!isNative) return undefined;
    if (platform === 'android') {
      return { paddingTop: 'var(--android-status-bar-height, 44px)' };
    }
    return { paddingTop: 'env(safe-area-inset-top, 0px)' };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white flex flex-col overflow-hidden">
      <header 
        className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
        style={getNavStyle()}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => view === "list" ? setLocation("/prayer-timer") : setView("list")}
            className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-white">Prayer Requests</h1>
          <div className="w-10" />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === "list" && isAuthenticated && prayers && prayers.length > 0 && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-4 pb-4 shrink-0 max-h-[30%] overflow-y-auto"
          >
            <div>
              <h2 className="text-sm uppercase tracking-wider text-white/40 mb-3">Your Previous Prayers</h2>
              <div className="space-y-3">
                {prayers.map((prayer) => (
                  <motion.div
                    key={prayer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-white/80 text-sm line-clamp-2 flex-1">
                        {prayer.content}
                      </p>
                      {prayer.status === "responded" && (
                        <span className="shrink-0 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                          Responded
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                      <Calendar className="w-3 h-3" />
                      {formatDate(prayer.createdAt)}
                    </div>
                    {prayer.responseContent && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-amber-400 mb-1">Response from our team:</p>
                        <p className="text-sm text-white/70">{prayer.responseContent}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {view === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-4 pb-8 flex-1 overflow-y-auto"
          >
            <div className="bg-gradient-to-b from-amber-500/10 to-transparent rounded-2xl p-4 mb-6 border border-amber-500/20">
              <p className="text-amber-200 text-sm leading-relaxed">
                Every prayer submitted will be read and responded to personally within 24 hours. 
                Your request is sacred to us.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-white/40" />
                  <div>
                    <Label className="text-white font-medium">Submit Anonymously</Label>
                    <p className="text-xs text-white/40 mt-0.5">
                      Not stored, not shared with anyone
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                  className="data-[state=checked]:bg-[#c08e00] data-[state=unchecked]:bg-[#c08e00]/40 shrink-0"
                  data-testid="switch-anonymous"
                />
              </div>

              {!isAnonymous && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div>
                    <Label className="text-white/60 text-sm">Your Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="First name"
                      className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <Label className="text-white/60 text-sm">Email (for response)</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      data-testid="input-email"
                    />
                  </div>
                </motion.div>
              )}

              <div>
                <Label className="text-white/60 text-sm">Your Prayer Request</Label>
                <Textarea
                  value={prayerContent}
                  onChange={(e) => setPrayerContent(e.target.value)}
                  placeholder="Share what's on your heart..."
                  className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[150px] resize-none"
                  data-testid="textarea-prayer"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!prayerContent.trim() || submitMutation.isPending}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold py-6 rounded-2xl shadow-lg shadow-amber-500/20"
                data-testid="button-send-prayer"
              >
                {submitMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                    />
                    Sending...
                  </span>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Prayer Request
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {view === "donation" && (
          <CandleDonation
            prayerRequestId={submittedPrayerId}
            onComplete={() => setView("list")}
            onSkip={() => setView("list")}
          />
        )}
      </AnimatePresence>

      {view === "list" && (
        <>
          {/* Candle area - fills remaining space */}
          <div className="flex-1 flex items-center justify-center px-4 min-h-0 relative">
            <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none">
              <AnimatedCandle />
            </div>
          </div>
          
          {/* Bottom section - fixed height, locked above nav */}
          <div className="shrink-0 px-4 pb-4 space-y-4">
            {isAuthenticated && stats && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-white/60">Streak</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.streak}</p>
                  <p className="text-xs text-white/40">days</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-white/60">Time</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalMinutes}</p>
                  <p className="text-xs text-white/40">minutes</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-white/60">Prayers</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.prayerRequestCount}</p>
                  <p className="text-xs text-white/40">submitted</p>
                </div>
              </div>
            )}
            
            <Button
              onClick={() => setView("form")}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold py-6 rounded-2xl shadow-lg shadow-amber-500/20"
              data-testid="button-submit-prayer"
            >
              <Send className="w-5 h-5 mr-2" />
              Submit a Prayer Request
            </Button>
          </div>
        </>
      )}

      <NativeTabBarSpacer />
    </div>
  );
}
