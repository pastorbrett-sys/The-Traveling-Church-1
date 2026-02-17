import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  Flame, 
  MessageCircle,
  Lock,
  CheckCircle2,
  BookOpen,
  Timer,
  Heart
} from "lucide-react";

import litCandleImage from "@assets/candle_cropped.png";

function AnimatedCandle() {
  // Fixed size candle - glow positioned 32px from top, centered
  return (
    <div className="relative flex items-center justify-center h-full w-full">
      <div className="relative" style={{ width: '480px', height: '1280px' }}>
        <img 
          src={litCandleImage} 
          alt="Lit candle" 
          className="absolute inset-0 w-full h-full object-contain"
        />
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{
            width: '400px',
            height: '240px',
            top: '428px',
            left: '50%',
            marginLeft: '-200px',
            background: 'radial-gradient(circle, rgba(251,191,36,0.9) 0%, rgba(251,191,36,0) 70%)',
          }}
          animate={{
            opacity: [0.49, 0.7, 0.49],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
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
import { t } from "@/lib/i18n";

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

export default function PrayerRequests() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { isNative, platform } = usePlatform();
  
  const [view, setView] = useState<"list" | "form" | "confirmation">("list");
  const [prayerContent, setPrayerContent] = useState("");
  const [name, setName] = useState(user?.firstName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittedPrayerId, setSubmittedPrayerId] = useState<string | null>(null);

  const { data: stats } = useQuery<PrayerStats>({
    queryKey: ["/api/prayer-stats"],
    enabled: isAuthenticated,
  });

  const handleSubmitPrayer = async () => {
    if (!prayerContent.trim()) return;
    
    try {
      const res = await apiRequest("POST", "/api/prayer-requests", {
        name: isAnonymous ? undefined : name,
        email: isAnonymous ? undefined : email,
        content: prayerContent,
        isAnonymous,
      });
      const data = await res.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-stats"] });
      setSubmittedPrayerId(data.prayerRequest?.id || null);
      setPrayerContent("");
      setView("confirmation");
    } catch (e) {
      console.error("Failed to submit prayer:", e);
    }
  };

  const getNavStyle = () => {
    if (!isNative) return undefined;
    if (platform === 'android') {
      return { paddingTop: 'var(--android-status-bar-height, 44px)' };
    }
    return { paddingTop: 'env(safe-area-inset-top, 0px)' };
  };

  return (
    <div className="h-screen text-white flex flex-col overflow-hidden" style={{ background: 'linear-gradient(to bottom, #1a1a1a 0%, #000000 100%)' }}>
      {view === "confirmation" ? (
        <div style={getNavStyle()} />
      ) : (
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
            <h1 className="text-lg font-semibold text-white">{t("prayer_requests.title")}</h1>
            <div className="w-10" />
          </div>
        </header>
      )}

      <AnimatePresence mode="wait">
        {view === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-4 pb-8 flex-1 overflow-y-auto"
          >
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              {t("prayer_requests.every_prayer_read")}
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-white/40" />
                  <div>
                    <Label className="text-white font-medium">{t("prayer_requests.submit_anonymously")}</Label>
                    <p className="text-xs text-white/40 mt-0.5">
                      {t("prayer_requests.not_stored")}
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
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-white/60 text-sm mb-1.5 block">{t("prayer_requests.your_name")}</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("prayer_requests.first_name")}
                      className="bg-transparent border border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl px-4"
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <Label className="text-white/60 text-sm mb-1.5 block">{t("prayer_requests.email_for_response")}</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("prayer_requests.email_placeholder")}
                      className="bg-transparent border border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl px-4"
                      data-testid="input-email"
                    />
                  </div>
                </motion.div>
              )}

              <div>
                <Label className="text-white/60 text-sm mb-1.5 block">{t("prayer_requests.your_prayer_request")}</Label>
                <Textarea
                  value={prayerContent}
                  onChange={(e) => setPrayerContent(e.target.value)}
                  placeholder={t("prayer_requests.share_whats_on_heart")}
                  className="bg-transparent border border-white/20 text-white placeholder:text-white/40 min-h-[150px] resize-none rounded-xl px-4 py-3"
                  data-testid="textarea-prayer"
                />
              </div>

              <Button
                onClick={handleSubmitPrayer}
                disabled={!prayerContent.trim()}
                className="w-full bg-[#c08e00] hover:bg-[#d4a000] text-white font-semibold py-6 rounded-2xl shadow-lg shadow-[#c08e00]/30"
                data-testid="button-send-prayer"
              >
                <Send className="w-5 h-5 mr-2" />
                {t("prayer_requests.submit_prayer")}
              </Button>
            </div>
          </motion.div>
        )}

        {view === "confirmation" && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center px-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-2xl font-semibold text-white mb-3"
            >
              {t("prayer_requests.prayer_submitted")}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-white/60 text-base leading-relaxed mb-8 max-w-xs"
            >
              {t("prayer_requests.prayer_received")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-xs space-y-3"
            >
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Button
                  onClick={() => setLocation("/prayer-timer")}
                  className="w-full bg-[#c08e00] hover:bg-[#d4a000] text-white font-semibold py-6 rounded-2xl"
                  data-testid="button-continue-prayer"
                >
                  <Timer className="w-5 h-5 mr-2" />
                  {t("prayer_requests.continue_praying")}
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.50, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Button
                  onClick={() => setLocation("/pastor-chat")}
                  variant="ghost"
                  className="w-full border border-white/30 bg-transparent text-white hover:bg-white/10 font-semibold py-6 rounded-2xl"
                  data-testid="button-read-bible"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  {t("prayer_requests.read_the_bible")}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {view === "list" && (
          <motion.div
            key="candle-section"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Candle area - fills remaining space */}
            <div className="flex-1 flex items-center justify-center px-4 min-h-0 relative pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none">
                <AnimatedCandle />
              </div>
            </div>
            
            {/* Bottom section - fixed height, locked above nav */}
            <div className="shrink-0 px-4 pb-4 space-y-4 relative z-10">
              {isAuthenticated && stats && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-xs text-white/60">{t("prayer_requests.streak")}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.streak}</p>
                    <p className="text-xs text-white/40">{t("prayer_requests.days")}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-white/60">{t("prayer_requests.time")}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalMinutes}</p>
                    <p className="text-xs text-white/40">{t("prayer_requests.minutes")}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-white/60">{t("prayer_requests.prayers")}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.prayerRequestCount}</p>
                    <p className="text-xs text-white/40">{t("prayer_requests.submitted")}</p>
                  </div>
                </div>
              )}
              
              <Button
                onClick={() => setView("form")}
                className="w-full bg-[#c08e00] hover:bg-[#d4a000] text-white font-semibold py-6 rounded-xl shadow-lg shadow-[#c08e00]/30"
                size="lg"
                data-testid="button-submit-prayer"
              >
                <Heart className="w-5 h-5 mr-2" />
                {t("prayer_requests.submit_prayer_request")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NativeTabBarSpacer />
    </div>
  );
}
